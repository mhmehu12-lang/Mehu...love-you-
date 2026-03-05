const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
    name: "bonk",
    version: "2.5.0",
    hasPermssion: 0,
    credits: "MJ HAMIM", // আপনার নাম এখানে সেট করা হয়েছে
    description: "কাউকে বনক (Bonk) করার মজার মিম তৈরি করুন",
    commandCategory: "fun",
    usages: "[mention/reply/UID]",
    cooldowns: 5,
};

// ইমেজ সার্কেল করার ফাংশন
async function circleCrop(buffer, size) {
    const img = await loadImage(buffer);
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext("2d");

    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    ctx.drawImage(img, 0, 0, size, size);
    return canvas;
}

module.exports.run = async function ({ api, event, args, Users }) {
    const { threadID, messageID, senderID, mentions, messageReply } = event;

    try {
        // টার্গেট আইডি নির্ধারণ লজিক
        let targetID;
        if (messageReply) {
            targetID = messageReply.senderID;
        } else if (Object.keys(mentions).length > 0) {
            targetID = Object.keys(mentions)[0];
        } else if (args[0] && /^\d+$/.test(args[0])) {
            targetID = args[0];
        } else {
            return api.sendMessage("⚠ দয়া করে কাউকে মেনশন দিন বা রিপ্লাই করুন।\n— MJ HAMIM", threadID, messageID);
        }

        // ইউজারের নাম সংগ্রহ
        const userInfo = await Users.getData(targetID);
        const targetName = userInfo.name || "User";

        // ব্যাকগ্রাউন্ড ইমেজ (Bonk Template)
        const bgURL = "https://i.postimg.cc/KYJ0VnK0/image0.png";
        const width = 640;
        const height = 480;

        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext("2d");

        // ব্যাকগ্রাউন্ড ড্র করা
        const background = await loadImage(bgURL);
        ctx.drawImage(background, 0, 0, width, height);

        // প্রোফাইল পিকচার ইউআরএল (টোকেনসহ)
        const getAvtURL = (uid) => `https://graph.facebook.com/${uid}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

        const [avtOneRes, avtTwoRes] = await Promise.all([
            axios.get(getAvtURL(senderID), { responseType: "arraybuffer" }),
            axios.get(getAvtURL(targetID), { responseType: "arraybuffer" })
        ]);

        // সার্কেল ক্রপিং
        const circle1 = await circleCrop(avtOneRes.data, 110); // অ্যাটাকার
        const circle2 = await circleCrop(avtTwoRes.data, 95);  // ভিকটিম

        // পজিশন সেটআপ
        ctx.drawImage(circle1, 75, 115); 
        ctx.drawImage(circle2, 445, 215);

        // ফাইল সেভ করা (Cache ফোল্ডারে)
        const cachePath = path.join(__dirname, "cache");
        if (!fs.existsSync(cachePath)) fs.mkdirSync(cachePath);
        
        const filePath = path.join(cachePath, `bonk_${Date.now()}.png`);
        fs.writeFileSync(filePath, canvas.toBuffer("image/png"));

        // আউটপুট পাঠানো
        return api.sendMessage({
            body: `ঐ ${targetName}, একটা বনক খা! 🪓\n— Edited by MJ HAMIM`,
            attachment: fs.createReadStream(filePath)
        }, threadID, () => {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }, messageID);

    } catch (err) {
        console.error(err);
        return api.sendMessage("❌ কিছু একটা সমস্যা হয়েছে! দয়া করে আবার চেষ্টা করুন।", threadID, messageID);
    }
};
