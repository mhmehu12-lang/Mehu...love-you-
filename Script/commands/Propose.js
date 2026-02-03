const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

module.exports = {
    config: {
        name: "propose",
        version: "3.5",
        author: "xalman (Optimized for Mirai)",
        countDown: 10,
        role: 0,
        description: "Propose someone with gender-based images",
        category: "love",
        guide: { en: "{p}{n} @mention | Reply | [uid]" }
    },

    onStart: async function ({ api, event, args, usersData }) {
        const { threadID, messageID, senderID, mentions, type, messageReply } = event;
        
        // Target ID define kora
        let mentionID = type === "message_reply" ? messageReply.senderID : 
                        Object.keys(mentions).length > 0 ? Object.keys(mentions)[0] : args[0];

        if (!mentionID) return api.sendMessage("Please mention someone or reply to a message! 💍", threadID, messageID);

        try {
            const senderInfo = await usersData.get(senderID);
            const mentionInfo = await usersData.get(mentionID);

            const sName = senderInfo.name;
            const mName = mentionInfo.name;
            const sGender = senderInfo.gender; // Mirai-te 1 hole Female, 2 hole Male (generally)

            let bgUrl, sP, mP;
            
            // Gender-er upor base kore image select
            if (sGender == 1) { // Female sender
                bgUrl = "https://i.ibb.co/HpXZtX2t/fd52b9bc7357.jpg";
                sP = { x: 335, y: 370, r: 35 }; mP = { x: 185, y: 310, r: 35 };
            } else { // Male or Others
                bgUrl = "https://i.ibb.co/5hRddLFs/053afb72e171.jpg";
                sP = { x: 185, y: 310, r: 35 }; mP = { x: 335, y: 370, r: 35 };
            }

            // Avatar URL
            const getAvt = (id) => `https://graph.facebook.com/${id}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

            // Canvas prepare kora
            const bgImg = await loadImage(bgUrl);
            const canvas = createCanvas(bgImg.width, bgImg.height);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

            // Avatar load and draw function
            const drawAvatar = async (id, p) => {
                try {
                    const avtImg = await loadImage(getAvt(id));
                    ctx.save();
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                    ctx.clip();
                    ctx.drawImage(avtImg, p.x - p.r, p.y - p.r, p.r * 2, p.r * 2);
                    ctx.restore();
                } catch (err) {
                    console.log("Error loading avatar: " + id);
                }
            };

            await drawAvatar(senderID, sP);
            await drawAvatar(mentionID, mP);

            // Cache management
            const cacheDir = path.join(__dirname, 'cache');
            if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);
            const cachePath = path.join(cacheDir, `propose_${senderID}_${mentionID}.png`);
            
            fs.writeFileSync(cachePath, canvas.toBuffer());

            return api.sendMessage({
                body: `${sName} is proposing to ${mName}! ❤️💍`,
                attachment: fs.createReadStream(cachePath)
            }, threadID, () => {
                if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
            }, messageID);

        } catch (e) {
            console.error(e);
            return api.sendMessage("An error occurred while generating the image.", threadID, messageID);
        }
    }
};
