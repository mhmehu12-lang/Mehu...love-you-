const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

module.exports.config = {
    name: "spy",
    version: "4.8.0",
    hasPermssion: 0,
    credits: "Saim / Modified by Gemini",
    description: "প্রোফাইল পিকচারের নিচে উন্নত ডিজিটাল সিগনেচার ইফেক্ট সহ স্পাই কার্ড।",
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

        api.sendMessage("🔐 প্রোফাইল ডাটা ডিকোড হচ্ছে... সিগনেচার জেনারেট করা হচ্ছে।", threadID, messageID);

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

        // --- প্রোফাইল পিকচার ডিজাইন ---
        const avatarUrl = `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
        let avatar;
        try { avatar = await loadImage(avatarUrl); } 
        catch (e) { avatar = await loadImage("https://i.imgur.com/I3VsBEt.png"); }

        const centerX = 230;
        const centerY = 240;

        // আউটার গ্লো
        ctx.save();
        const outerGlow = ctx.createRadialGradient(centerX, centerY, 130, centerX, centerY, 160);
        outerGlow.addColorStop(0, "rgba(0, 255, 204, 0.3)");
        outerGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = outerGlow;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 170, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // লাইটিং রিং
        ctx.save();
        ctx.lineWidth = 5;
        ctx.strokeStyle = "#00ffcc";
        ctx.shadowBlur = 15;
        ctx.shadowColor = "#00ffcc";
        ctx.beginPath();
        ctx.arc(centerX, centerY, 145, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // ইমেজ ক্লিপিং
        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, 130, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(avatar, centerX - 130, centerY - 130, 260, 260);
        ctx.restore();

        // --- ডিজিটাল সিগনেচার স্টাইল (পিকচারের নিচে নাম) ---
        ctx.save();
        ctx.textAlign = "center";
        
        // সিগনেচার গ্লো
        ctx.shadowBlur = 12;
        ctx.shadowColor = "#ffffff";
        
        // নামের ফন্ট (হাতের লেখার মতো স্টাইল দিতে 'italic bold' ব্যবহার করা হয়েছে)
        ctx.font = "italic bold 35px 'Courier New'"; 
        ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
        ctx.fillText(name, centerX, centerY + 195);
        
        // সিগনেচারের নিচের স্টাইলিশ লাইন
        ctx.shadowBlur = 8;
        ctx.shadowColor = "#00ffcc";
        ctx.beginPath();
        ctx.moveTo(centerX - 110, centerY + 208);
        ctx.bezierCurveTo(centerX - 50, centerY + 215, centerX + 50, centerY + 200, centerX + 110, centerY + 208); // একটু বাঁকানো লাইন
        ctx.strokeStyle = "#00ffcc";
        ctx.lineWidth = 3;
        ctx.stroke();

        // ছোট টেক্সট
        ctx.font = "bold 10px Arial";
        ctx.fillStyle = "rgba(0, 255, 204, 0.8)";
        ctx.fillText("DIGITAL SIGNATURE VERIFIED", centerX, centerY + 225);
        ctx.restore();

        // --- তথ্য বক্স ---
        function drawInfoBox(x, y, label, text, color) {
            ctx.save();
            ctx.fillStyle = "rgba(0, 25, 25, 0.8)";
            ctx.fillRect(x, y, 420, 50);
            ctx.strokeStyle = color;
            ctx.lineWidth = 1.5;
            ctx.strokeRect(x, y, 420, 50);
            
            ctx.fillStyle = color;
            ctx.font = "bold 15px Courier New";
            ctx.fillText(label, x + 20, y + 30);
            
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 18px Courier New";
            ctx.fillText(text, x + 120, y + 30);
            ctx.restore();
        }

        const infoX = 440;
        drawInfoBox(infoX, 70, "AGENT:", name.toUpperCase(), "#00ffcc");
        drawInfoBox(infoX, 140, "UID  :", targetID, "#00ffff");
        drawInfoBox(infoX, 210, "SEX  :", gender, "#ff0066");
        drawInfoBox(infoX, 280, "CASH :", `$${money.toLocaleString()}`, "#ffff00");
        drawInfoBox(infoX, 350, "RANK :", "ULTIMATE AGENT", "#ff9900");
        drawInfoBox(infoX, 420, "STATUS:", "AUTHORIZED", "#00ff00");

        const pathImg = path.join(__dirname, "cache", `spy_sig_${targetID}.png`);
        fs.writeFileSync(pathImg, canvas.toBuffer());

        return api.sendMessage({
            body: `✅ **SIGNATURE VERIFIED**\nএজেন্ট ${name}-এর সিগনেচার কার্ড প্রস্তুত।`,
            attachment: fs.createReadStream(pathImg)
        }, threadID, () => fs.unlinkSync(pathImg), messageID);

    } catch (e) {
        console.error(e);
        return api.sendMessage("❌ এরর: ডাটা প্রসেস করা সম্ভব হয়নি!", threadID, messageID);
    }
};
