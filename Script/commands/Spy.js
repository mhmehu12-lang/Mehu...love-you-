const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage, registerFont } = require("canvas");

module.exports.config = {
    name: "spy",
    version: "3.0.0",
    hasPermssion: 0,
    credits: "Saim / Stylish Spy Card",
    description: "ইউজারের বিস্তারিত তথ্য সহ একটি প্রিমিয়াম নিয়ন স্পাই কার্ড তৈরি করে।",
    commandCategory: "utility",
    usages: "[mention/reply/uid]",
    cooldowns: 5
};

// টাকার ফরম্যাট (K, M, B) করার জন্য
function formatMoney(n) {
    if (n >= 1e12) return (n / 1e12).toFixed(1) + 'T';
    if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
    if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
    return n.toLocaleString();
}

// ষষ্ঠভুজ (Hexagon) আঁকার ফাংশন
function drawHex(ctx, x, y, size) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        const angle = Math.PI / 3 * i - Math.PI / 6;
        ctx.lineTo(x + size * Math.cos(angle), y + size * Math.sin(angle));
    }
    ctx.closePath();
}

module.exports.run = async function ({ api, event, args, Users, Currencies }) {
    const { threadID, messageID, senderID, mentions, type, messageReply } = event;

    try {
        let targetID;
        if (Object.keys(mentions).length > 0) targetID = Object.keys(mentions)[0];
        else if (type == "message_reply") targetID = messageReply.senderID;
        else targetID = args[0] && !isNaN(args[0]) ? args[0] : senderID;

        const waitMsg = await api.sendMessage("⚡ প্রো-লেভেল স্পাই কার্ড তৈরি হচ্ছে...", threadID);

        // ডাটা সংগ্রহ
        const userInfo = await api.getUserInfo(targetID);
        const userData = await Users.getData(targetID) || {};
        const money = (await Currencies.getData(targetID)).money || 0;
        
        const allUsers = await Users.getAll(['userID', 'exp']);
        const rank = allUsers.sort((a, b) => (b.exp || 0) - (a.exp || 0)).findIndex(u => u.userID == targetID) + 1;

        const name = userInfo[targetID].name || "User";
        const gender = userInfo[targetID].gender == 2 ? "Boy 👦" : userInfo[targetID].gender == 1 ? "Girl 👧" : "Unknown 🤷";
        const username = userInfo[targetID].vanity || "No Username";

        // ক্যানভাস সাইজ
        const canvas = createCanvas(500, 850);
        const ctx = canvas.getContext("2d");

        // ১. ডার্ক ব্যাকগ্রাউন্ড
        ctx.fillStyle = "#0d001a";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // ২. মেইন নিয়ন বর্ডার
        ctx.strokeStyle = "#ff00ff";
        ctx.lineWidth = 10;
        ctx.shadowBlur = 20;
        ctx.shadowColor = "#ff00ff";
        ctx.strokeRect(15, 15, 470, 820);
        ctx.shadowBlur = 0;

        // ৩. প্রোফাইল পিকচার (Hexagon Frame)
        const avatarUrl = `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa059ef6e40a7d7d563931e233`;
        let avatarImg;
        try { avatarImg = await loadImage(avatarUrl); } 
        catch (e) { avatarImg = await loadImage("https://i.imgur.com/I3VsBEt.png"); }

        ctx.save();
        ctx.shadowBlur = 15;
        ctx.shadowColor = "#00ffff";
        ctx.strokeStyle = "#00ffff";
        ctx.lineWidth = 5;
        drawHex(ctx, 250, 150, 100);
        ctx.stroke();
        ctx.clip();
        ctx.drawImage(avatarImg, 150, 50, 200, 200);
        ctx.restore();

        // ৪. নাম (Neon Glowing Text)
        ctx.fillStyle = "#fff";
        ctx.font = "bold 35px Arial";
        ctx.textAlign = "center";
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#ff00ff";
        ctx.fillText(name, 250, 310);
        ctx.shadowBlur = 0;

        // ৫. ইনফরমেশন বক্স লেআউট
        const infoList = [
            ["🆔 UID", targetID],
            ["🌐 Username", "@" + username],
            ["🚻 Gender", gender],
            ["💰 Money", "$" + formatMoney(money)],
            ["📈 XP Rank", "#" + rank],
            ["🌍 Profile", `fb.com/${targetID}`]
        ];

        let yPos = 380;
        infoList.forEach(([label, value]) => {
            // বক্স ব্যাকগ্রাউন্ড
            ctx.fillStyle = "rgba(255, 0, 255, 0.1)";
            ctx.fillRect(40, yPos, 420, 45);
            
            // বক্স বর্ডার
            ctx.strokeStyle = "#00ffff";
            ctx.lineWidth = 1;
            ctx.strokeRect(40, yPos, 420, 45);

            // টেক্সট
            ctx.textAlign = "left";
            ctx.font = "bold 20px Arial";
            ctx.fillStyle = "#fff";
            ctx.fillText(label + ":", 55, yPos + 30);
            
            ctx.fillStyle = "#00ffff";
            ctx.font = "20px Arial";
            ctx.fillText(value, 180, yPos + 30);
            
            yPos += 60;
        });

        // ৬. ফুটার
        ctx.font = "italic 16px Arial";
        ctx.fillStyle = "#aaaaaa";
        ctx.textAlign = "center";
        ctx.fillText("©️ Saimx69x | Spy AI", 250, 810);

        // ফাইল সেভ ও সেন্ড
        const cacheDir = path.join(__dirname, "cache");
        if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);
        const pathImg = path.join(cacheDir, `spy_${targetID}.png`);
        
        fs.writeFileSync(pathImg, canvas.toBuffer());
        api.unsendMessage(waitMsg.messageID);

        return api.sendMessage({
            attachment: fs.createReadStream(pathImg)
        }, threadID, () => fs.unlinkSync(pathImg), messageID);

    } catch (e) {
        console.error(e);
        return api.sendMessage("❌ এরর: ক্যানভাস মডিউল ঠিকমতো কাজ করছে না।", threadID, messageID);
    }
};
