const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

module.exports.config = {
    name: "spy",
    version: "4.0.0",
    hasPermssion: 0,
    credits: "MD HAMIM", // আপনার নাম এখানে যুক্ত করা হয়েছে
    description: "ইউনিক হেক্সাগন গিয়ার ফ্রেম এবং প্রিমিয়াম সাইবার স্পাই কার্ড।",
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

        api.sendMessage("🔐 অ্যাক্সেস গ্র্যান্টেড... ডাটাবেস থেকে আপনার তথ্য সংগ্রহ করা হচ্ছে।", threadID, messageID);

        const userInfo = await api.getUserInfo(targetID);
        const userData = userInfo[targetID];
        if (!userData) return api.sendMessage("❌ ইউজার ডাটা পাওয়া যায়নি!", threadID, messageID);

        const money = (await Currencies.getData(targetID)).money || 0;
        const name = userData.name || "Unknown Agent";
        const gender = userData.gender == 2 ? "MALE" : userData.gender == 1 ? "FEMALE" : "SECRET";

        const canvas = createCanvas(900, 600);
        const ctx = canvas.getContext("2d");

        // --- ব্যাকগ্রাউন্ড ডিজাইন ---
        ctx.fillStyle = "#020a0a"; 
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // গ্লিচ ইফেক্ট গ্রিড
        ctx.strokeStyle = "rgba(0, 255, 204, 0.1)";
        ctx.beginPath();
        for (let i = 0; i < canvas.width; i += 40) {
            ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height);
        }
        for (let j = 0; j < canvas.height; j += 40) {
            ctx.moveTo(0, j); ctx.lineTo(canvas.width, j);
        }
        ctx.stroke();

        // মেইন বর্ডার
        const grad = ctx.createLinearGradient(0, 0, 900, 600);
        grad.addColorStop(0, "#00ffcc");
        grad.addColorStop(1, "#0033ff");
        ctx.lineWidth = 15;
        ctx.strokeStyle = grad;
        ctx.strokeRect(10, 10, 880, 580);

        // --- ইউনিক লোগো/প্রোফাইল ডিজাইন (Hexagon Style) ---
        const centerX = 230;
        const centerY = 260;
        
        const avatarUrl = `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
        let avatar;
        try { avatar = await loadImage(avatarUrl); } 
        catch (e) { avatar = await loadImage("https://i.imgur.com/I3VsBEt.png"); }

        // হেক্সাগন ফাংশন
        function drawHexagon(x, y, size) {
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                ctx.lineTo(x + size * Math.cos(i * Math.PI / 3), y + size * Math.sin(i * Math.PI / 3));
            }
            ctx.closePath();
        }

        // গিয়ার ইফেক্ট বর্ডার
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(Math.PI / 6); 
        ctx.lineWidth = 8;
        ctx.strokeStyle = "#00ffcc";
        ctx.shadowBlur = 20;
        ctx.shadowColor = "#00ffcc";
        drawHexagon(0, 0, 155);
        ctx.stroke();
        ctx.restore();

        // প্রোফাইল ফটো মাস্কিং
        ctx.save();
        drawHexagon(centerX, centerY, 140);
        ctx.clip();
        ctx.drawImage(avatar, centerX - 140, centerY - 140, 280, 280);
        ctx.restore();

        // --- সিগনেচার এরিয়া ---
        ctx.font = "italic 28px 'Courier New'";
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.fillText(name, centerX, centerY + 200);
        ctx.fillStyle = "#00ffcc";
        ctx.font = "bold 12px Arial";
        ctx.fillText("VERIFIED CYBER AGENT", centerX, centerY + 225);

        // --- ইনফরমেশন বক্স ---
        function drawInfo(x, y, label, text, color) {
            ctx.fillStyle = "rgba(0, 51, 51, 0.7)";
            ctx.fillRect(x, y, 420, 55);
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, 420, 55);
            
            ctx.fillStyle = color;
            ctx.fillRect(x, y, 10, 55);
            
            ctx.textAlign = "left";
            ctx.font = "bold 18px Courier New";
            ctx.fillStyle = "#ffffff";
            ctx.fillText(label, x + 30, y + 33);
            
            ctx.font = "bold 22px Courier New";
            ctx.fillStyle = color;
            ctx.fillText(text, x + 150, y + 33);
        }

        const infoX = 440;
        drawInfo(infoX, 80, "AGENT:", name.toUpperCase(), "#00ffcc");
        drawInfo(infoX, 155, "ID NO:", targetID, "#00ffff");
        drawInfo(infoX, 230, "GENDER:", gender, "#ff0066");
        drawInfo(infoX, 305, "CREDIT:", `${money.toLocaleString()} $`, "#ffff00");
        drawInfo(infoX, 380, "RANK:", "S-RANK ELITE", "#ff9900");
        drawInfo(infoX, 455, "STATUS:", "ENCRYPTED", "#00ff00");

        const pathImg = path.join(__dirname, "cache", `spy_card_${targetID}.png`);
        fs.writeFileSync(pathImg, canvas.toBuffer());

        return api.sendMessage({
            body: `⚡ **INTEL RECOVERED**\nএজেন্ট ${name}-এর গোপন ফাইল ডিকোড করা হয়েছে।\n\n© Credits: MD HAMIM`,
            attachment: fs.createReadStream(pathImg)
        }, threadID, () => fs.unlinkSync(pathImg), messageID);

    } catch (e) {
        console.error(e);
        return api.sendMessage("❌ সিস্টেম এরর! ডাটা এক্সেস করা যাচ্ছে না।", threadID, messageID);
    }
};
