const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage, registerFont } = require('canvas');

module.exports.config = {
    name: "spy",
    version: "2.0",
    hasPermssion: 0,
    credits: "Saimx69x",
    description: "ইউজারের তথ্যসহ একটি নিয়ন থিমযুক্ত স্পাই কার্ড তৈরি করে।",
    commandCategory: "Information",
    usages: "[mention/reply/UID]",
    cooldowns: 5
};

function formatMoney(n) {
    const units = ['', 'K', 'M', 'B', 'T'];
    let index = 0;
    while (n >= 1000 && index < units.length - 1) {
        n /= 1000;
        index++;
    }
    return n.toFixed(1).replace(/\.0$/, '') + units[index];
}

async function loadFonts(cachePath) {
    const fontFolder = path.join(cachePath, 'fonts');
    if (!fs.existsSync(fontFolder)) fs.mkdirSync(fontFolder, { recursive: true });

    const fonts = [
        {
            url: 'https://github.com/Saim12678/Saim/blob/154232a4ea1ea849f1374d00800f6817416a31f8/fonts/Gen%20Jyuu%20Gothic%20Monospace%20Bold.ttf?raw=true',
            file: 'Japanese.ttf',
            family: 'JapaneseFont'
        }
    ];

    for (const font of fonts) {
        const fontPath = path.join(fontFolder, font.file);
        if (!fs.existsSync(fontPath)) {
            try {
                const response = await axios.get(font.url, { responseType: 'arraybuffer' });
                fs.writeFileSync(fontPath, Buffer.from(response.data));
            } catch (e) {
                console.error("Font download failed:", e.message);
            }
        }
        if (fs.existsSync(fontPath)) registerFont(fontPath, { family: font.family });
    }
}

function drawHex(ctx, x, y, size) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        const angle = Math.PI / 3 * i - Math.PI / 6;
        const xPos = x + size * Math.cos(angle);
        const yPos = y + size * Math.sin(angle);
        i === 0 ? ctx.moveTo(xPos, yPos) : ctx.lineTo(xPos, yPos);
    }
    ctx.closePath();
}

async function createSpyCard(data, cachePath) {
    await loadFonts(cachePath);
    const canvas = createCanvas(490, 840);
    const ctx = canvas.getContext('2d');

    // Background Gradient
    const grad = ctx.createLinearGradient(0, 0, 490, 840);
    grad.addColorStop(0, '#1a0033');
    grad.addColorStop(0.5, '#2d003f');
    grad.addColorStop(1, '#40004c');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 490, 840);

    // Avatar Logic
    let avatar;
    try { avatar = await loadImage(data.avatarUrl); } 
    catch { avatar = await loadImage("https://i.imgur.com/I3VsBEt.png"); }

    ctx.save();
    ctx.strokeStyle = "#00ffff";
    ctx.lineWidth = 20;
    drawHex(ctx, 245, 140, 96);
    ctx.stroke();
    ctx.clip();
    ctx.drawImage(avatar, 245 - 90, 140 - 90, 180, 180);
    ctx.restore();

    // Text Drawing Function
    const drawT = (text, x, y, size, color, align = "center") => {
        ctx.font = `${size}px JapaneseFont`;
        ctx.textAlign = align;
        ctx.fillStyle = color;
        ctx.fillText(text, x, y);
    };

    drawT(data.name, 245, 280, 32, "#ff99ff");

    const info = [
        ["🆔 UID", data.uid],
        ["🌐 User", data.username],
        ["🚻 Gender", data.gender],
        ["🎓 Type", data.type || "User"],
        ["🎂 B-Day", data.birthday],
        ["💬 Nick", data.nickname],
        ["🌍 Loc", data.location],
        ["💰 Money", "$" + formatMoney(data.money)],
        ["📈 XP Rank", "#" + data.rank],
        ["🏦 Bank Rank", "#" + data.moneyRank]
    ];

    let yPos = 340;
    info.forEach(([label, value], i) => {
        ctx.fillStyle = "rgba(20,10,40,0.85)";
        ctx.fillRect(30, yPos, 430, 36);
        drawT(`${label}:`, 40, yPos + 24, 18, "#fff", "left");
        drawT(value.toString(), 180, yPos + 24, 18, i % 2 === 0 ? "#ff66ff" : "#00ffff", "left");
        yPos += 48;
    });

    drawT("©️ Saimx69x", 245, 820, 16, "#AAAAAA");
    return canvas.toBuffer('image/png');
}

module.exports.run = async ({ api, event, args, Users, Currencies }) => {
    const { threadID, messageID, senderID, mentions, messageReply } = event;
    try {
        let targetID = senderID;
        if (Object.keys(mentions).length > 0) targetID = Object.keys(mentions)[0];
        if (messageReply) targetID = messageReply.senderID;
        if (args[0] && !isNaN(args[0])) targetID = args[0];

        const waitMsg = await api.sendMessage("⚡ Generating your spy card...", threadID);

        const userData = await Users.getData(targetID);
        const moneyData = await Currencies.getData(targetID);
        const allUsers = await Users.getAll(['userID', 'exp']);
        const allMoney = await Currencies.getAll(['userID', 'money']);

        const rank = allUsers.sort((a, b) => b.exp - a.exp).findIndex(u => u.userID == targetID) + 1;
        const moneyRank = allMoney.sort((a, b) => b.money - a.money).findIndex(u => u.userID == targetID) + 1;

        const avatarUrl = `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa059ef6e40a7d7d563931e233`;
        
        const cacheDir = path.join(__dirname, 'cache');
        if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

        const cardBuffer = await createSpyCard({
            avatarUrl,
            name: userData.name || "Unknown",
            uid: targetID,
            username: userData.vanity || targetID,
            gender: userData.gender == 1 ? "Boy" : userData.gender == 2 ? "Girl" : "Unknown",
            type: userData.type,
            birthday: userData.birthday || "Private",
            nickname: userData.name,
            location: userData.location || "Private",
            money: moneyData.money || 0,
            rank,
            moneyRank
        }, cacheDir);

        const tempPath = path.join(cacheDir, `spy_${targetID}.png`);
        fs.writeFileSync(tempPath, cardBuffer);

        api.unsendMessage(waitMsg.messageID);
        return api.sendMessage({
            attachment: fs.createReadStream(tempPath)
        }, threadID, () => fs.unlinkSync(tempPath), messageID);

    } catch (e) {
        console.error(e);
        return api.sendMessage("❌ Failed to generate spy card.", threadID);
    }
};
