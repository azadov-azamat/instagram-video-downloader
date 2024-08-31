require('dotenv').config({});

const i18n = require('i18n');

function translate(text, args = {}) {
  return i18n.__(text, args);
}

module.exports = { translate };
