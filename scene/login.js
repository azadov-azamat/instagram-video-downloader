const {Markup, Scenes} = require("telegraf");
const {getInstagramFollowers, extractUsernameFromLink} = require("../utils/functions");
const loginScene = new Scenes.BaseScene('loginScene');

loginScene.enter((ctx) => ctx.reply('Iltimos, Instagram username va parolni kiriting (format: username:password).'));

loginScene.on('text', (ctx) => {
    const text = ctx.message.text;
    const [username, password] = text.split(':');

    if (username && password) {
        ctx.session.username = username.trim();
        ctx.session.password = password.trim();
        ctx.scene.enter('targetUserScene');
    } else {
        ctx.reply('Noto‘g‘ri formatda kiritildi. Iltimos, username va parolni to‘g‘ri formatda kiriting (format: username:password).');
    }
});

const targetUserScene = new Scenes.BaseScene('targetUserScene');
targetUserScene.enter((ctx) => ctx.reply('Qaysi userning followerslarini olishni xohlaysiz? Username yoki Instagram profil linkini kiriting.'));

targetUserScene.on('text', async (ctx) => {
    const input = ctx.message.text;
    const targetUsername = extractUsernameFromLink(input);

    await ctx.reply('🏃 Olib kelinmoqda...');

    const followers = await getInstagramFollowers(ctx.session.username, ctx.session.password, targetUsername);

    if (!followers) {
        await ctx.reply("Instagramdan followerlarni olishda muammo yuzaga keldi.");
    } else {
        for (let follower of followers) {
            const message = `Username: ${follower.username}`;
            try {
                await ctx.replyWithPhoto(follower.profilePhoto, {
                    caption: message,
                    reply_markup: Markup.inlineKeyboard([
                        Markup.button.url("Instagramga o'tish", 'https://instagram.com/' + follower.username)
                    ])
                });
            } catch (e) {
                console.log(e);
                await ctx.reply(message, Markup.inlineKeyboard([
                    Markup.button.url("Instagramga o'tish", 'https://instagram.com/' + follower.username)
                ]));
            }
        }
        await ctx.reply('Barcha followerslar yuborildi.');
    }

    await ctx.scene.leave();
});

module.exports = { loginScene, targetUserScene };