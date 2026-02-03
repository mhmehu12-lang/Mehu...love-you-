const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

module.exports.config = {
    name: "propose",
    version: "3.1",
    hasPermssion: 0,
    credits: "Md Hamim", // Apnar name dilam
    description: "Propose someone with gender-based images",
    commandCategory: "love",
    usages: "@mention | Reply",
    cooldowns: 10
};

module.exports.run = async function ({ api, event, args, Users }) {
    const { threadID, messageID, senderID, mentions, type, messageReply } = event;
    
    // User ID dhora
    let mentionID = type === "message_reply" ? messageReply.senderID : 
                    Object.keys(mentions).length > 0 ? Object.keys(mentions)[0] : args[0];

    if (!mentionID) return api.sendMessage("Please mention someone or reply to a message! 💍", threadID, messageID);

    try {
        // Mirai Bot database theke user info neya
        const senderInfo = await Users.getData(senderID);
        const mentionInfo = await Users.getData(mentionID);

        const sName = senderInfo.name;
        const mName = mentionInfo.name;
        const sGender = senderInfo.gender; // 1 for Female, 2 for Male (shadharonoto)

        let bgUrl, sP, mP;
        
        // Gender check (1 = Female, onno kichu hole Male dhore nibe)
        if (sGender == 1) { 
            bgUrl = "https://i.ibb.co/HpXZtX2t/fd52b9bc7357.jpg";
            sP = { x: 335, y: 370, r: 30 }; mP = { x: 185, y: 310, r: 30 };
        } else {
            bgUrl = "https://i.ibb.co/5hRddLFs/053afb72e171.jpg";
            sP = { x: 185, y: 310, r: 30 }; mP = { x: 335, y: 370, r: 30 };
        }

        const getAvatar = (id) => `https://graph.facebook.com/${id}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

        const [bgImg, avatarS, avatarM] = await Promise.all([
            loadImage(bgUrl),
            loadImage(getAvatar(senderID)),
            loadImage(getAvatar(mentionID))
        ]);

        const canvas = createCanvas(bgImg.width, bgImg.height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

        const drawCircle = (img, p) => {
            ctx.save();
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(img, p.x - p.r, p.y - p.r, p.r * 2, p.r * 2);
            ctx.restore();
        };

        drawCircle(avatarS, sP);
        drawCircle(avatarM, mP);

        const cachePath = path.join(__dirname, 'cache', `propose_${Date.now()}.png`);
        if (!fs.existsSync(path.join(__dirname, 'cache'))) fs.mkdirSync(path.join(__dirname, 'cache'));
        
        fs.writeFileSync(cachePath, canvas.toBuffer());

        return api.sendMessage({
            body: `${sName} is proposing to ${mName}! ❤️💍`,
            attachment: fs.createReadStream(cachePath)
        }, threadID, () => fs.unlinkSync(cachePath), messageID);

    } catch (e) {
        console.log(e);
        return api.sendMessage("An error occurred. Make sure 'canvas' package is installed.", threadID, messageID);
    }
};
