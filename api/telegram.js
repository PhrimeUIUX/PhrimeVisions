const { readFile, unlink } = require('fs/promises');
const { formidable } = require('formidable');

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CONTACT_PATTERN = /^\+63\d{10}$/;
const FIELD_LIMITS = {
  name: 80,
  project: 180,
  contactNumber: 13,
  email: 120,
  date: 40,
  budget: 80,
};

module.exports.config = {
  api: {
    bodyParser: false,
  },
};

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

function getField(fields, fieldName) {
  const value = fields[fieldName];
  const normalizedValue = Array.isArray(value) ? value[0] : value;

  return typeof normalizedValue === 'string' ? normalizedValue.trim() : '';
}

function getUploadedFile(files, fieldName) {
  const value = files[fieldName];

  return Array.isArray(value) ? value[0] : value;
}

function escapeTelegramHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function buildCaption(inquiry) {
  const separator = '\u2501'.repeat(16);

  return [
    '\u{1F3AC} <b>PHRIME VISIONS</b>',
    '<b>NEW PROJECT INQUIRY</b>',
    separator,
    '',
    '\u{1F464} <b>Name:</b>',
    escapeTelegramHtml(inquiry.name),
    '',
    '\u{1F3A5} <b>Project:</b>',
    escapeTelegramHtml(inquiry.project),
    '',
    '\u{1F4F1} <b>Contact:</b>',
    escapeTelegramHtml(inquiry.contactNumber),
    '',
    '\u2709\uFE0F <b>Email:</b>',
    escapeTelegramHtml(inquiry.email),
    '',
    '\u{1F4C5} <b>Date:</b>',
    escapeTelegramHtml(inquiry.date),
    '',
    '\u{1F4B0} <b>Budget:</b>',
    escapeTelegramHtml(inquiry.budget),
    '',
    separator,
    '<b>PHRIME VISIONS WEBSITE</b>',
  ].join('\n');
}

function parseMultipartForm(req) {
  const form = formidable({
    multiples: false,
    maxFileSize: MAX_FILE_SIZE,
    maxTotalFileSize: MAX_FILE_SIZE,
    allowEmptyFiles: false,
  });

  return new Promise((resolve, reject) => {
    form.parse(req, (error, fields, files) => {
      if (error) {
        reject(error);
        return;
      }

      resolve({ fields, files });
    });
  });
}

function validateInquiry(fields, files) {
  const inquiry = {
    name: getField(fields, 'name'),
    project: getField(fields, 'project'),
    contactNumber: getField(fields, 'contactNumber'),
    email: getField(fields, 'email'),
    date: getField(fields, 'date'),
    budget: getField(fields, 'budget'),
  };

  for (const [fieldName, value] of Object.entries(inquiry)) {
    if (!value) {
      return {
        error: `${fieldName} is required`,
      };
    }

    if (value.length > FIELD_LIMITS[fieldName]) {
      return {
        error: `${fieldName} is too long`,
      };
    }
  }

  if (!EMAIL_PATTERN.test(inquiry.email)) {
    return {
      error: 'email must be valid',
    };
  }

  if (!CONTACT_PATTERN.test(inquiry.contactNumber)) {
    return {
      error: 'contactNumber must be a valid +63 number',
    };
  }

  const referenceImage = getUploadedFile(files, 'referenceImage');

  if (!referenceImage) {
    return {
      error: 'reference image is required',
    };
  }

  if (!ALLOWED_MIME_TYPES.has(referenceImage.mimetype)) {
    return {
      error: 'reference image must be a JPG, PNG, or WEBP file',
    };
  }

  if (referenceImage.size > MAX_FILE_SIZE) {
    return {
      error: 'reference image must be 10 MB or smaller',
    };
  }

  return {
    inquiry,
    referenceImage,
  };
}

async function sendInquiryToTelegram(inquiry, referenceImage) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    throw new Error('Telegram environment variables are not configured');
  }

  const photoBuffer = await readFile(referenceImage.filepath);
  const photo = new Blob([photoBuffer], {
    type: referenceImage.mimetype,
  });
  const telegramFormData = new FormData();

  telegramFormData.append('chat_id', chatId);
  telegramFormData.append('caption', buildCaption(inquiry));
  telegramFormData.append('parse_mode', 'HTML');
  telegramFormData.append(
    'photo',
    photo,
    referenceImage.originalFilename || 'reference-image'
  );

  const response = await fetch(
    `https://api.telegram.org/bot${botToken}/sendPhoto`,
    {
      method: 'POST',
      body: telegramFormData,
    }
  );

  if (!response.ok) {
    throw new Error(`Telegram API failed with status ${response.status}`);
  }

  const telegramResponse = await response.json();

  if (!telegramResponse.ok) {
    throw new Error('Telegram API returned an unsuccessful response');
  }
}

module.exports = async function telegramInquiryHandler(req, res) {
  res.setHeader('Allow', 'POST');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    sendJson(res, 405, {
      success: false,
      error: 'Method not allowed',
    });
    return;
  }

  let referenceImage;

  try {
    const { fields, files } = await parseMultipartForm(req);
    const validation = validateInquiry(fields, files);

    if (validation.error) {
      sendJson(res, 400, {
        success: false,
        error: validation.error,
      });
      return;
    }

    referenceImage = validation.referenceImage;

    await sendInquiryToTelegram(validation.inquiry, referenceImage);

    sendJson(res, 200, {
      success: true,
    });
  } catch (error) {
    if (
      error.code === 1009 ||
      error.message === 'options.maxTotalFileSize exceeded' ||
      error.message === 'options.maxFileSize exceeded'
    ) {
      sendJson(res, 400, {
        success: false,
        error: 'reference image must be 10 MB or smaller',
      });
      return;
    }

    console.error('Unable to send inquiry:', error.message);

    sendJson(res, 500, {
      success: false,
      error: 'Unable to send inquiry',
    });
  } finally {
    if (referenceImage && referenceImage.filepath) {
      await unlink(referenceImage.filepath).catch(() => {});
    }
  }
};
