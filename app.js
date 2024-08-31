const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const route = require('express-async-handler');
const cors = require('cors');
const errorHandler = require('./middleware/error-handler');
const isTest = process.env.NODE_ENV === 'test';
const cookieParser = require('cookie-parser');
const i18n = require('./utils/i18n-config');
const bot = require("./bot");
const debug = require('debug')('app:index');

morgan.format('custom', ':method :url :status :res[content-length] - :response-time ms');

const allowedOrigins = [
  'http://localhost:4200',
  'http://localhost:8080',
  'https://logistics-backend.vercel.app',
  'https://logistics-backend-uufl.onrender.com',
];

const corsOptions = function (req, callback) {
  let options = {
    credentials: true,
    methods: '*',
    exposedHeaders: true,
    allowedHeaders: [
      'X-Requested-With',
      'X-HTTP-Method-Override',
      'Content-Type',
      'Accept',
      'Cookie',
      'Authorization',
    ],
  };

  const requestOrigin = req.header('Origin');
  options.origin = allowedOrigins.some((origin) => {
    if (requestOrigin === origin) {
      return true;
    }
    const originWithoutProtocol = origin.replace(/^https?:\/\//, '');
    if (requestOrigin?.includes('.' + originWithoutProtocol)) {
      return true;
    }
    return false;
  });

  callback(null, options);
};


const app = express();

app.set('x-powered-by', false);
app.set('view cache', false);
app.set('query parser', 'extended');

if (!isTest) {
  app.use(morgan('custom'));
}

app.use(cookieParser());
app.use(i18n.init)

app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  bodyParser.json({
    strict: true,
    limit: '200kb',
    type: '*/*',
  })
);

app.use(bot.webhookCallback('/api/webhook_telegram'))

app.options('*', cors({ origin: true, credentials: true }));
app.use(cors(corsOptions));

// app.use(require('./server/routes'));

app.use(errorHandler);

app.get('/health', route(async (req, res) => {
   const webhookInfo = await bot.telegram.getWebhookInfo();
   // && webhookInfo.pending_update_count === 0
   if (webhookInfo.url === 'https://logistics-backend-uufl.onrender.com/api/webhook_telegram') {
     res.status(200).send('Bot and webhook are ready to receive traffic');
   } else {
     res.status(503).send('Webhook is not ready or there are pending updates');
   }
}));

module.exports = app;
