const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

const {Scenes, Telegraf, session, Markup} =require("telegraf");
const {downloadInstagramVideo} = require("./utils/functions");
const {loginScene, targetUserScene} = require("./scene/login");

const bot = new Telegraf(process.env.BOT_TOKEN);

const stage = new Scenes.Stage([loginScene, targetUserScene]);
bot.use(session());
bot.use(stage.middleware());

bot.start((ctx) => ctx.reply(
    'Salom! Instagramdan video yuklash yoki followerlarni olish uchun tugmachalardan birini tanlang.',
    Markup.keyboard([
        ['📹 Video yuklash', '👥 Followerlar ro\'yxati']
    ]).resize()
));

bot.hears('📹 Video yuklash', (ctx) => {
    ctx.reply('Instagram video linkini yuboring.');
});

bot.hears('👥 Followerlar ro\'yxati', (ctx) => {
    ctx.scene.enter('loginScene');
});

bot.on('text', async (ctx) => {
    const text = ctx.message.text;

    if (text.includes('instagram.com')) {
        await ctx.reply('🏃 Olib kelinmoqda...');
        const videoUrl = await downloadInstagramVideo(text);

        if (videoUrl) {
            await ctx.replyWithVideo({ url: videoUrl });
        } else {
            await ctx.reply('Instagram videoni yuklab bo\'lmadi.');
        }
    } else {
        ctx.reply('Iltimos, Instagram video havolasini yoki username:password formatida ma\'lumotni yuboring.');
    }
});

bot.launch();

const app = express();
const port = process.env.PORT || 3100;

app.get('/', (req, res) => {
    res.send('Bot is running...');
});

app.listen(port, () => {
    console.log(`Bot server is running on port ${port}`);
});

process.once('SIGINT', () => {
    if (bot && bot.stop) bot.stop('SIGINT');
});
process.once('SIGTERM', () => {
    if (bot && bot.stop) bot.stop('SIGTERM');
});

console.log('Bot is running...');