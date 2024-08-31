require('dotenv').config({});

const { Markup } = require('telegraf');
const camelize = require('camelize');
const { translate } = require('./translate');

const LANGUAGE = {
  uz: '🇺🇿 O`zbekcha',
  ru: '🇷🇺 Русский',
};

const language = () =>
  Markup.keyboard([Object.values(LANGUAGE), [translate('commands.go-back')]]).resize();

const back = () => Markup.keyboard([[translate('commands.go-back')]]).resize();

const main = () => {
  return Markup.keyboard([
    [translate('commands.quick-search')],
    [translate('commands.last-ten')],
    [translate('commands.settings')],
    [translate('commands.help')],
  ]).resize();
};

const settings = () => {
  return Markup.keyboard([
    [translate('commands.language')],
    [translate('commands.go-back')],
  ]).resize();
};

const keyboardFuncs = {
  language,
  back,
  main,
  settings,
};

const keyboards = (name, opts = {}) => {
  name = camelize(name);
  if (keyboardFuncs[name]) {
    return keyboardFuncs[name](opts);
  }
  throw new Error(`Keyboard ${name} not found`);
};


module.exports = {
  keyboards,
  LANGUAGE,
};
