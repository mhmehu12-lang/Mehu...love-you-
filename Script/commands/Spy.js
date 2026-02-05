const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

module.exports.config = {
    name: "spy",
    version: "4.5.0",
    hasPermssion: 0,
    credits: "Saim / Modified by Gemini",
    description: "ইউনিক লাইটিং পোর্টাল ইফেক্ট সহ প্রিমিয়াম স্পাই কার্ড।",
    commandCategory: "utility",
    usages: "[mention/reply/uid]",
    cooldowns: 5
};

module.exports.run = async function ({ api, event, args, Users, Currencies }) {
    const { threadID, messageID, senderID, mentions, type, messageReply } = event;

    try {
        let targetID;
        if (type == "message_reply") {
            targetID = messageReply.senderID;
        } else if (Object.keys(mentions).length > 0) {
            targetID = Object.keys(mentions)[0];
        } else if (args.length > 0 && !isNaN(args[0])) {
            targetID = args[0];
        } else {
            targetID = senderID;
        }

        api.sendMessage("🔐 এনক্রিপ্টিং প্রোফাইল ডাটা... লাইটিং ইফেক্ট রেন্ডার হচ্ছে।", threadID, messageID);

        const userInfo = await api.getUserInfo(targetID);
        const userData = userInfo[targetID];
        if (!userData) return api.sendMessage("❌ ইউজার ইনফরমেশন পাওয়া যায়নি!", threadID, messageID);

        const money = (await Currencies.getData(targetID)).money || 0;
        const name = userData.name || "Unknown User";
        const gender = userData.gender == 2 ? "MALE" : userData.gender == 1 ? "FEMALE" : "SECRET";

        const canvas = createCanvas(900, 580);
        const ctx = canvas.getContext("2d");

        // ব্যাকগ্রাউন্ড
        ctx.fillStyle = "#000808"; 
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // মেইন নিওন বর্ডার
        const mainGrad = ctx.createLinearGradient(0, 0, 900, 580);
        mainGrad.addColorStop(0, "#00ffcc");
        mainGrad.addColorStop(1, "#3300ff");
        ctx.lineWidth = 12;
        ctx.strokeStyle = mainGrad;
        ctx.strokeRect(10, 10, 880, 560);

        // --- প্রোফাইল পিকচার (Unique Lighting Effect) ---
        const avatarUrl = `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
        let avatar;
        try { avatar = await loadImage(avatarUrl); } 
        catch (e) { avatar = await loadImage("https://i.imgur.com/I3VsBEt.png"); }

        const centerX = 230;
        const centerY = 240;

        // ১. আউটার গ্লো (Pulse Light Effect)
        ctx.save();
        const outerGlow = ctx.createRadialGradient(centerX, centerY, 130, centerX, centerY, 170);
        outerGlow.addColorStop(0, "rgba(0, 255, 204, 0.4)");
        outerGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = outerGlow;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 175, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // ২. ডাবল পোর্টাল রিং (Lighting Ring)
        ctx.save();
        ctx.lineWidth = 4;
        ctx.shadowBlur = 20;
        ctx.shadowColor = "#00ffcc";
        
        // প্রথম রিং (Solid)
        ctx.strokeStyle = "#00ffcc";
        ctx.beginPath();
        ctx.arc(centerX, centerY, 145, 0, Math.PI * 2);
        ctx.stroke();

        // দ্বিতীয় রিং (Dashed Lighting)
        ctx.setLineDash([15, 10]);
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 152, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // ৩. ইমেজ ক্লিপিং
        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, 130, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(avatar, centerX - 130, centerY - 130, 260, 260);
        ctx.restore();

        // --- ডিজিটাল সিগনেচার ---
        ctx.save();
        ctx.textAlign = "center";
        ctx.shadowBlur = 15;
        ctx.shadowColor = "#ffffff";
        ctx.font = "italic bold 32px 'Courier New'";
        ctx.fillStyle = "white";
        ctx.fillText(name, centerX, centerY + 195);
        
        // সিগনেচার আন্ডারলাইন গ্লো
        ctx.beginPath();
        ctx.moveTo(centerX - 120, centerY + 205);
        ctx.lineTo(centerX + 120, centerY + 205);
        ctx.strokeStyle = "#00ffcc";
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();

        // --- টেক্সট বক্স ডিজাইন ---
        function drawAdvancedBox(x, y, width, height, label, value, color) {
            ctx.save();
            ctx.shadowBlur = 10;
            ctx.shadowColor = color;
            ctx.fillStyle = "rgba(0, 20, 20, 0.8)";
            ctx.fillRect(x, y, width, height);
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, width, height);
            
            ctx.fillStyle = color;
            ctx.font = "bold 16px Courier New";
            ctx.fillText(label, x + 20, y + 32);
            
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 18px Courier New";
            ctx.fillText(value, x + 130, y + 32);
            ctx.restore();
        }

        const startX = 435;
        const boxW = 420;
        const bH = 50;

        drawAdvancedBox(startX, 60, boxW, 60, "TARGET:", name.toUpperCase(), "#00ffcc");
        drawAdvancedBox(startX, 135, boxW, bH, "UID   :", targetID, "#00ffff");
        drawAdvancedBox(startX, 200, boxW, bH, "SEX   :", gender, "#ff0066");
        drawAdvancedBox(startX, 265, boxW, bH, "CASH  :", `$${money.toLocaleString()}`, "#ffff00");
        drawAdvancedBox(startX, 330, boxW, bH, "LEVEL :", "ULTIMATE AGENT", "#ff9900");
        drawAdvancedBox(startX, 395, boxW, bH, "ACCESS:", "AUTHORIZED", "#00ff00");

        const pathImg = path.join(__dirname, "cache", `spy_glow_${targetID}.png`);
        fs.writeFileSync(pathImg, canvas.toBuffer());

        return api.sendMessage({
            body: `✨ **ENCRYPTED ID GENERATED**\nএজেন্ট ${name}-এর প্রোফাইলে ইউনিক লাইটিং ইফেক্ট যুক্ত করা হয়েছে।`,
            attachment: fs.createReadStream(pathImg)
        }, threadID, () => fs.unlinkSync(pathImg), messageID);

    } catch (e) {
        console.error(e);
        return api.sendMessage("❌ এরর: ডাটা প্রসেস করা সম্ভব হয়নি!", threadID, messageID);
    }
};
