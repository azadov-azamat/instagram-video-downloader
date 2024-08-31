const puppeteer = require('puppeteer');
const instagramGetUrl = require('instagram-url-direct');

async function downloadInstagramVideo(url) {
    try {
        const result = await instagramGetUrl(url);
        if (result && result.url_list && result.url_list.length > 0) {
            return result.url_list[0];
        }
    } catch (e) {
        console.log(e);
    }
    return null;
}

function extractUsernameFromLink(link) {
    const match = link.match(/(?:https?:\/\/)?(?:www\.)?instagram\.com\/([A-Za-z0-9_.]+)/);
    return match ? match[1] : link; // Agar link bo'lsa, username ni ajratib oladi, aks holda kiritilgan matnni qaytaradi
}

async function getInstagramFollowers(username, password, targetUsername) {
    const browser = await puppeteer.launch({
        headless: true,
        timeout: 300000,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setViewport({width: 1280, height: 800});

    try {
        await page.goto('https://www.instagram.com/accounts/login/');
        await page.waitForSelector('input[name="username"]');
        await page.type('input[name="username"]', username);
        await page.waitForSelector('input[name="password"]');
        await page.type('input[name="password"]', password);
        await page.click('button[type="submit"]');
        await page.waitForNavigation({ waitUntil: 'networkidle2' });

        await page.goto(`https://www.instagram.com/${targetUsername}/`, { waitUntil: 'networkidle2' });

        await page.waitForSelector('a[href*="/followers/"]', { visible: true });
        await page.click('a[href*="/followers/"]');

        await page.waitForSelector('div[role="dialog"] div[style*="flex-direction: column;"]', { visible: true });

        // Followerlarni olish va scroll qilish
        const followersList = await page.evaluate(async () => {
            const scrollableElement = document.querySelector('div[role="dialog"] div[style*="flex-direction: column;"]');
            let lastHeight = 0;
            let followersArray = new Map();

            while (true) {
                const followersElements = scrollableElement.querySelectorAll('a[role="link"]');
                let newFollowersCount = 0;

                followersElements.forEach(el => {
                    const usernameElement = el.querySelector('img');
                    const username = usernameElement ? usernameElement.alt.split("'")[0] : null;

                    const profilePhotoElement = el.querySelector('img');
                    const profilePhoto = profilePhotoElement ? profilePhotoElement.src : '';

                    if (username && !followersArray.has(username)) {
                        followersArray.set(username, { username, profilePhoto });
                        newFollowersCount++;
                    }
                });

                const lastFollower = followersElements[followersElements.length - 1];
                if (lastFollower) {
                    lastFollower.scrollIntoView();
                }

                await new Promise(resolve => setTimeout(resolve, 2000));

                let currentHeight = scrollableElement.scrollHeight;
                if (newFollowersCount === 0 && lastHeight === currentHeight) {
                    break;
                }

                lastHeight = currentHeight;
            }

            return Array.from(followersArray.values());
        });

        await browser.close();
        return followersList;
    } catch (e) {
        console.log(e);
        await browser.close();
        return null;
    }
}

module.exports = {downloadInstagramVideo, getInstagramFollowers, extractUsernameFromLink}