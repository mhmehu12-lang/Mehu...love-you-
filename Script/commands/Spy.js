const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage, registerFont } = require("canvas");

module.exports.config = {
    name: "spy",
    version: "2.7.0",
    hasPermssion: 0,
    credits: "Saim / Modified by Gemini",
    description: "নিয়ন বক্স এবং লাইটিং ইফেক্ট সহ প্রিমিয়াম হ্যাকার কার্ড।",
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

        api.sendMessage("🛰️ ডাটাবেস স্ক্যান করা হচ্ছে, দয়া করে অপেক্ষা করুন...", threadID, messageID);

        const userInfo = await api.getUserInfo(targetID);
        const money = (await Currencies.getData(targetID)).money || 0;
        const name = userInfo[targetID].name;
        const gender = userInfo[targetID].gender == 2 ? "Male" : userInfo[targetID].gender == 1 ? "Female" : "Unknown";
        const fbUrl = `fb.com/${targetID}`;

        // Landscape Canvas (যাতে মেসেঞ্জারে বাইরে থেকে ফুল দেখা যায়)
        const canvas = createCanvas(850, 550); 
        const ctx = canvas.getContext("2d");

        // ব্যাকগ্রাউন্ড
        ctx.fillStyle = "#010a01"; 
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // RGB মেইন মোটা বর্ডার
        const grad = ctx.createLinearGradient(0, 0, 850, 550);
        grad.addColorStop(0, "#00ffff");
        grad.addColorStop(0.5, "#ff00ff");
        grad.addColorStop(1, "#ffff00");

        ctx.lineWidth = 15;
        ctx.strokeStyle = grad;
        ctx.strokeRect(10, 10, 830, 530);

        // প্রোফাইল পিকচার (Hexagon Design)
        const avatarUrl = `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
        let avatar;
        try {
            avatar = await loadImage(avatarUrl);
        } catch (e) {
            avatar = await loadImage("https://i.imgur.com/I3VsBEt.png");
        }

        function drawHexagon(x, y, size) {
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                ctx.lineTo(x + size * Math.cos(i * Math.PI / 3), y + size * Math.sin(i * Math.PI / 3));
            }
            ctx.closePath();
        }

        // প্রোফাইল গ্লো
        ctx.save();
        ctx.shadowBlur = 35;
        ctx.shadowColor = "#00ffff";
        ctx.strokeStyle = "#00ffff";
        ctx.lineWidth = 10;
        drawHexagon(220, 275, 150);
        ctx.stroke();
        ctx.clip();
        ctx.drawImage(avatar, 70, 125, 300, 300);
        ctx.restore();

        // --- টেক্সট বক্স ডিজাইন ফাংশন ---
        function drawNeonBox(x, y, width, height, text, color) {
            ctx.save();
            // বক্স লাইটিং ইফেক্ট (Glow)
            ctx.shadowBlur = 15;
            ctx.shadowColor = color;
            ctx.strokeStyle = color;
            ctx.lineWidth = 3;
            
            // বক্স আঁকা
            ctx.strokeRect(x, y, width, height);
            
            // হালকা ব্যাকগ্রাউন্ড বক্সের ভেতর
            ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
            ctx.fillRect(x, y, width, height);
            
            // টেক্সট বসানো
            ctx.shadowBlur = 10; // টেক্সট গ্লো
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 22px Courier New";
            ctx.fillText(text, x + 20, y + 32);
            ctx.restore();
        }

        // ডিটেইলস বক্স বসানো
        const startX = 400;
        const startY = 100;
        const boxWidth = 400;
        const boxHeight = 50;
        const gap = 65;

        // নাম বড় বক্সে
        drawNeonBox(startX, 60, boxWidth, 65, `NAME: ${name.toUpperCase()}`, "#00ff00");
        
        // অন্যান্য ডিটেইলস আলাদা আলাদা লাইটিং বক্সে
        drawNeonBox(startX, startY + gap, boxWidth, boxHeight, `ID    : ${targetID}`, "#00ffff");
        drawNeonBox(startX, startY + gap * 2, boxWidth, boxHeight, `GENDER: ${gender}`, "#ff00ff");
        drawNeonBox(startX, startY + gap * 3, boxWidth, boxHeight, `MONEY : $${money.toLocaleString()}`, "#ffff00");
        drawNeonBox(startX, startY + gap * 4, boxWidth, boxHeight, `SOURCE: FB_DATABASE`, "#ff0000");
        drawNeonBox(startX, startY + gap * 5, boxWidth, boxHeight, `STATUS: COMPLETED`, "#00ff00");

        // নিচে ছোট ফুটনোট
        ctx.font = "14px Courier New";
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.fillText("SYSTEM SECURED BY SPY-AI // ENCRYPTED ACCESS", 450, 520);

        const pathImg = path.join(__dirname, "cache", `spy_${targetID}.png`);
        const buffer = canvas.toBuffer();
        fs.writeFileSync(pathImg, buffer);

        return api.sendMessage({
            body: `🛡️ **SPY CARD GENERATED**\nUser: ${name}`,
            attachment: fs.createReadStream(pathImg)
        }, threadID, () => fs.unlinkSync(pathImg), messageID);

    } catch (e) {
        console.log(e);
        return api.sendMessage("❌ এরর: ডাটা প্রসেস করা সম্ভব হয়নি!", threadID, messageID);
    }
};
