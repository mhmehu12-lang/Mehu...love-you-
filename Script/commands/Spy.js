const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const { createCanvas, loadImage, registerFont } = require('canvas');

module.exports.config = {
    name: "spy",
    version: "3.0",
    hasPermssion: 0,
    credits: "Saimx69x",
    description: "Detailed neon-themed user spy card.",
    commandCategory: "Information",
    usages: "[mention/reply/UID]",
    cooldowns: 5
};

// টাকার ফরম্যাট ঠিক করার জন্য
function formatMoney(n) {
    if (n >= 1e12) return (n / 1e12).toFixed(1) + 'T';
    if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
    if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
    return n.toLocaleString();
}

async function loadAssets(cachePath) {
    const fontPath = path.join(cachePath, 'Japanese.ttf');
    if (!fs.existsSync(fontPath)) {
        const url = 'https://github.com/Saim12678/Saim/blob/154232a4ea1ea849f1374d00800f6817416a31f8/fonts/Gen%20Jyuu%20Gothic%20Monospace%20Bold.ttf?raw=true';
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        fs.writeFileSync(fontPath, Buffer.from(response.data));
    }
    registerFont(fontPath, { family: 'SpyFont' });
}

function drawHex(ctx, x, y, size) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        const angle = Math.PI / 3 * i - Math.PI / 6;
        ctx.lineTo(x + size * Math.cos(angle), y + size * Math.sin(angle));
    }
    ctx.closePath();
}

module.exports.run = async ({ api, event, args, Users, Currencies }) => {
    const { threadID, messageID, senderID, mentions, messageReply } = event;
    const cacheDir = path.join(__dirname, 'cache');
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

    try {
        let targetID = senderID;
        if (Object.keys(mentions).length > 0) targetID = Object.keys(mentions)[0];
        else if (messageReply) targetID = messageReply.senderID;
        else if (args[0] && !isNaN(args[0])) targetID = args[0];

        const waitMsg = await api.sendMessage("⚡ Generating your spy card...", threadID);

        // ডাটাবেস থেকে তথ্য সংগ্রহ
        const userData = await Users.getData(targetID) || {};
        const moneyData = await Currencies.getData(targetID) || { money: 0 };
        const allUsers = await Users.getAll(['userID', 'exp']);
        const allMoney = await Currencies.getAll(['userID', 'money']);

        const rank = allUsers.sort((a, b) => (b.exp || 0) - (a.exp || 0)).findIndex(u => u.userID == targetID) + 1;
        const mRank = allMoney.sort((a, b) => (b.money || 0) - (a.money || 0)).findIndex(u => u.userID == targetID) + 1;

        await loadAssets(cacheDir);
        const canvas = createCanvas(490, 840);
        const ctx = canvas.getContext('2d');

        // Background Gradient (Dark Purple)
        const bgGrad = ctx.createLinearGradient(0, 0, 0, 840);
        bgGrad.addColorStop(0, '#1a0033');
        bgGrad.addColorStop(1, '#0d001a');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, 490, 840);

        // Outer Neon Border
        ctx.strokeStyle = '#ff00ff';
        ctx.lineWidth = 8;
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ff00ff';
        ctx.strokeRect(10, 10, 470, 820);
        ctx.shadowBlur = 0;

        // Avatar Handling
        const avatarUrl = `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa059ef6e40a7d7d563931e233`;
        let img;
        try { img = await loadImage(avatarUrl); } catch { img = await loadImage("https://i.imgur.com/I3VsBEt.png"); }

        ctx.save();
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#ff00ff';
        ctx.strokeStyle = '#ff00ff';
        ctx.lineWidth = 5;
        drawHex(ctx, 245, 150, 95);
        ctx.stroke();
        ctx.clip();
        ctx.drawImage(img, 150, 55, 190, 190);
        ctx.restore();

        // Name
        ctx.font = 'bold 30px SpyFont';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ff00ff';
        ctx.fillText(userData.name || "User", 245, 310);

        // Info Boxes Style
        const details = [
            ["🆔 UID", targetID],
            ["🌐 Username", userData.vanity || "No Username"],
            ["🚻 Gender", userData.gender == 1 ? "Boy" : userData.gender == 2 ? "Girl" : "Unknown"],
            ["🎓 Type", "User"],
            ["🎂 Birthday", userData.birthday || "Private"],
            ["💬 Nickname", userData.name || "None"],
            ["🌍 Location", userData.location || "Private"],
            ["💰 Money", "$" + formatMoney(moneyData.money || 0)],
            ["📈 XP Rank", "#" + rank],
            ["🏦 Money Rank", "#" + mRank]
        ];

        let y = 360;
        details.forEach(([label, value], i) => {
            // Box Background
            ctx.fillStyle = 'rgba(20, 0, 40, 0.8)';
            ctx.shadowBlur = 5;
            ctx.shadowColor = '#00ffff';
            ctx.fillRect(40, y, 410, 38);
            
            // Neon Box Border (Bottom)
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 1;
            ctx.strokeRect(40, y, 410, 38);

            // Text
            ctx.shadowBlur = 0;
            ctx.textAlign = 'left';
            ctx.font = '18px SpyFont';
            ctx.fillStyle = '#fff';
            ctx.fillText(label + ":", 55, y + 25);
            
            ctx.fillStyle = '#00ffff';
            ctx.fillText(value, 180, y + 25);
            y += 45;
        });

        // Footer
        ctx.font = '14px SpyFont';
        ctx.fillStyle = '#aaa';
        ctx.textAlign = 'center';
        ctx.fillText("© Saimx69x", 245, 825);

        const tempPath = path.join(cacheDir, `spy_${targetID}.png`);
        fs.writeFileSync(tempPath, canvas.toBuffer());

        api.unsendMessage(waitMsg.messageID);
        return api.sendMessage({ attachment: fs.createReadStream(tempPath) }, threadID, () => fs.unlinkSync(tempPath), messageID);

    } catch (err) {
        console.error(err);
        return api.sendMessage("❌ Failed to generate spy card. Make sure 'canvas' is installed.", threadID);
    }
};
