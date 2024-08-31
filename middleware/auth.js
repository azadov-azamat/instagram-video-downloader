const Promise = require('bluebird');
const i18n = require('i18n');
const { User } = require('../db/models');

async function auth(ctx, next) {

  const {
    id,
    first_name,
    last_name,
    username
  } = ctx.from;

  const [user] = await User.findOrCreate({
    where: { id },
    defaults: {
      id,
      firstName: first_name,
      lastName: last_name,
      telegramUsername: username,
    }
  });

  let language = ctx.session.language || 'uz';
  ctx.session.language = language;
  ctx.session.userId = user.id;

  i18n.setLocale(language);

  ctx.user = user;

  return next();
};


module.exports = { auth };
