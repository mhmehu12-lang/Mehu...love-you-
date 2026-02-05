const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage, registerFont } = require("canvas");

module.exports.config = {
    name: "spy",
    version: "2.5.0",
    hasPermssion: 0,
    credits: "Saim / Modified by Gemini",
    description: "ইউজারের বিস্তারিত তথ্য সহ একটি হ্যাকার স্টাইল RGB স্পাই কার্ড তৈরি করে।",
    commandCategory: "utility",
    usages: "[mention/reply/uid]",
    cooldowns: 5
};

module.exports.run = async function ({ api, event, args, Users, Currencies }) {
    const { threadID, messageID, senderID, mentions, type, messageReply } = event;

    try {
        let targetID;
        if (Object.keys(mentions).length > 0) targetID = Object.keys(mentions)[0];
        else if (type == "message_reply") targetID = messageReply.senderID;
        else targetID = args[0] && !isNaN(args[0]) ? args[0] : senderID;

        api.sendMessage("⚡ হ্যাকার ডাটাবেস থেকে তথ্য সংগ্রহ করা হচ্ছে...", threadID, messageID);

        const userInfo = await api.getUserInfo(targetID);
        const money = (await Currencies.getData(targetID)).money || 0;
        
        const name = userInfo[targetID].name;
        const gender = userInfo[targetID].gender == 2 ? "Male" : userInfo[targetID].gender == 1 ? "Female" : "Unknown";
        const username = userInfo[targetID].vanity || "hidden_user";
        const fbUrl = `facebook.com/${targetID}`;

        const canvas = createCanvas(500, 750);
        const ctx = canvas.getContext("2d");

        // --- ব্যাকগ্রাউন্ড ডিজাইন ---
        ctx.fillStyle = "#050505"; // Deep Dark
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // হ্যাকার গ্রিড ইফেক্ট (Background Grid)
        ctx.strokeStyle = "rgba(0, 255, 255, 0.1)";
        ctx.lineWidth = 1;
        for (let i = 0; i < canvas.width; i += 20) {
            ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
        }
        for (let i = 0; i < canvas.height; i += 20) {
            ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke();
        }

        // --- মোটা RGB বর্ডার ---
        const gradient = ctx.createLinearGradient(0, 0, 500, 750);
        gradient.addColorStop(0, "#ff0000"); // Red
        gradient.addColorStop(0.5, "#00ff00"); // Green
        gradient.addColorStop(1, "#00ffff"); // Cyan
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 15; // বর্ডার মোটা করা হয়েছে
        ctx.strokeRect(7, 7, 486, 736);

        // --- প্রোফাইল পিকচার প্রসেসিং ---
        const avatarUrl = `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
        let avatar;
        try {
            avatar = await loadImage(avatarUrl);
        } catch (e) {
            avatar = await loadImage("https://i.imgur.com/I3VsBEt.png");
        }

        // প্রোফাইল পিকচারের পেছনে গ্লোয়িং সার্কেল (Hacker look)
        ctx.save();
        ctx.shadowBlur = 20;
        ctx.shadowColor = "#00ffff";
        ctx.beginPath();
        ctx.arc(250, 160, 105, 0, Math.PI * 2, true);
        ctx.lineWidth = 5;
        ctx.strokeStyle = "#00ffff";
        ctx.stroke();
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, 145, 55, 210, 210);
        ctx.restore();

        // --- টেক্সট কন্টেন্ট ---
        ctx.textAlign = "center";
        
        // নাম (Neon Glow)
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#00ffff";
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 35px Courier New"; // Hacker style font
        ctx.fillText(name.toUpperCase(), 250, 320);
        ctx.shadowBlur = 0;

        // ইনফরমেশন বক্স
        ctx.textAlign = "left";
        ctx.font = "20px Courier New";
        ctx.fillStyle = "#00ff00"; // Matrix Green

        const startY = 400;
        const spacing = 45;

        const info = [
            `> ID: ${targetID}`,
            `> USER: ${username}`,
            `> SEX: ${gender}`,
            `> CASH: $${money.toLocaleString()}`,
            `> STATUS: EXPOSED`
        ];

        info.forEach((text, index) => {
            ctx.fillText(text, 60, startY + (index * spacing));
        });

        // প্রোফাইল ইউআরএল ছোট করে নিচে
        ctx.font = "14px Arial";
        ctx.fillStyle = "rgba(0, 255, 255, 0.7)";
        ctx.fillText(`URL: ${fbUrl}`, 60, 630);

        // নিচে ফুটনোট
        ctx.textAlign = "center";
        ctx.font = "italic 16px Courier New";
        ctx.fillStyle = "#ff0000";
        ctx.fillText("--- SYSTEM BREACHED BY SPY-AI ---", 250, 700);

        const pathImg = path.join(__dirname, "cache", `spy_${targetID}.png`);
        const buffer = canvas.toBuffer();
        fs.writeFileSync(pathImg, buffer);

        return api.sendMessage({
            body: `🔥 | সিস্টেম হ্যাকড! এখানে ${name}-এর গোপন ফাইল:`,
            attachment: fs.createReadStream(pathImg)
        }, threadID, () => fs.unlinkSync(pathImg), messageID);

    } catch (e) {
        console.log(e);
        return api.sendMessage("❌ এরর: ডাটাবেস এক্সেস ডিনাইড!", threadID, messageID);
    }
};
