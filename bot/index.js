const dotenv = require('dotenv');
dotenv.config();

const {Scenes, Telegraf, session, Markup} = require("telegraf");
const {loginScene, targetUserScene} = require("../scene/login");
const {downloadInstagramVideo} = require("../utils/functions");

const Redis = require("../services/telegraf-redis-session");
const {auth} = require("../middleware/auth");
const {User, Follower} = require("../db/models");

const bot = new Telegraf(process.env.BOT_TOKEN);

const stage = new Scenes.Stage([loginScene, targetUserScene]);
const store = new Redis();

bot.use(session({store}));
bot.use(stage.middleware());
bot.use(auth);

bot.use(async (ctx, next) => {
    try {
        await next();
    } catch (err) {
        if (err.code === 403 && err.description.includes('bot was blocked by the user')) {
            console.log(`User ${ctx.from.id} blocked the bot. Cannot send message.`);
            if (ctx.chat?.id) {
                try {
                    await User.destroy({
                        where: {
                            id: ctx.from.id,
                        },
                    });
                } catch (e) {
                    console.error(e);
                }
            }
        } else {
            console.error('An unexpected error occurred:', err);
        }
    }
});

// Global Error Handling
bot.catch(async (err, ctx) => {
    console.error(`Error for ${ctx.updateType}`, err);

    if (err.response && err.response.error_code === 403) {
        console.log(`Bot was blocked by user ${ctx.chat.id}`);
        if (ctx.chat?.id) {
            try {
                await User.destroy({ where: { id: ctx.chat.id } });
            } catch (e) {
                console.error(e);
            }
        }
    } else if (err.response && err.response.error_code === 429) {
        console.log(`Rate limit exceeded. Try again`);
    } else if (err.code) {
        console.log(`A generic error occurred: ${err.code}`);
    }
});

bot.start((ctx) => {
    ctx.reply(
        'Salom! Instagramdan video yuklash yoki followerlarni olish uchun tugmachalardan birini tanlang.',
        Markup.keyboard([
            ['📹 Video yuklash', '👥 Followerlar ro\'yxati']
        ]).resize()
    )
});

bot.hears('📹 Video yuklash', (ctx) => {
    ctx.reply('Instagram video linkini yuboring.');
});

bot.hears('👥 Followerlar ro\'yxati', async (ctx) => {
   await ctx.scene.enter('loginScene');
});

bot.on('text', async (ctx) => {
    const text = ctx.message.text;

    if (text.includes('instagram.com')) {
        await ctx.reply('🏃 Olib kelinmoqda...');
        const videoUrl = await downloadInstagramVideo(text);

        if (videoUrl) {
            await ctx.replyWithVideo({url: videoUrl});
        } else {
            await ctx.reply('Instagram videoni yuklab bo\'lmadi.');
        }
    } else {
        ctx.reply('Iltimos, Instagram video havolasini yoki username:password formatida ma\'lumotni yuboring.');
    }
});

process.on('unhandledRejection', error => {
    console.error(error);
    process.exit(1);
});

process.on('uncaughtException', error => {
    console.log(error);
    process.exit(1);
});

if (process.env.NODE_ENV !== 'production') {
    // bot.launch();
}

module.exports = bot;