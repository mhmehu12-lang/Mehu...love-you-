const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

module.exports.config = {
    name: "spy",
    version: "5.0.0",
    hasPermssion: 0,
    credits: "MD HAMIM",
    description: "আল্ট্রা-নিওন গ্লো এবং সাইবারপঙ্ক স্পাই কার্ড ইন্টারফেস।",
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

        api.sendMessage("🛰️ [ SCANNING ] থ্রি-ডি মেটাডাটা অ্যানালাইজ করা হচ্ছে...", threadID, messageID);

        const userInfo = await api.getUserInfo(targetID);
        const userData = userInfo[targetID];
        if (!userData) return api.sendMessage("❌ [ ERROR ] ইউজার ডাটা ডিক্রিপ্ট করা সম্ভব হয়নি!", threadID, messageID);

        const money = (await Currencies.getData(targetID)).money || 0;
        const name = userData.name || "Unknown Agent";
        const gender = userData.gender == 2 ? "MALE" : userData.gender == 1 ? "FEMALE" : "SECRET";

        const canvas = createCanvas(900, 600);
        const ctx = canvas.getContext("2d");

        // --- আল্ট্রা ব্যাকগ্রাউন্ড (Dark Cyber Abyss) ---
        ctx.fillStyle = "#000505"; 
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // ডায়নামিক নিওন গ্রিড
        ctx.strokeStyle = "rgba(0, 255, 204, 0.1)";
        ctx.lineWidth = 0.5;
        for (let i = 0; i < canvas.width; i += 25) {
            ctx.beginPath();
            ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height);
            ctx.stroke();
        }
        for (let j = 0; j < canvas.height; j += 25) {
            ctx.beginPath();
            ctx.moveTo(0, j); ctx.lineTo(canvas.width, j);
            ctx.stroke();
        }

        // --- এনিমেশন ইফেক্ট (Digital Wave) ---
        ctx.strokeStyle = "rgba(0, 51, 255, 0.2)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = 0; x < canvas.width; x += 10) {
            let y = 300 + Math.sin(x * 0.02) * 50;
            ctx.lineTo(x, y);
        }
        ctx.stroke();

        // মাল্টি-লেয়ার নিওন বর্ডার
        const colors = ["#00ffcc", "#0033ff", "#ff0066"];
        ctx.lineWidth = 4;
        for (let i = 0; i < 3; i++) {
            ctx.shadowBlur = 15 + (i * 5);
            ctx.shadowColor = colors[i];
            ctx.strokeStyle = colors[i];
            ctx.strokeRect(20 + (i * 3), 20 + (i * 3), 860 - (i * 6), 560 - (i * 6));
        }
        ctx.shadowBlur = 0;

        // --- হেক্সাগন এনার্জি কোর (Avatar Section) ---
        const centerX = 230;
        const centerY = 270;
        
        const avatarUrl = `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
        let avatar;
        try { avatar = await loadImage(avatarUrl); } 
        catch (e) { avatar = await loadImage("https://i.imgur.com/I3VsBEt.png"); }

        function drawHexagon(x, y, size) {
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                ctx.lineTo(x + size * Math.cos(i * Math.PI / 3), y + size * Math.sin(i * Math.PI / 3));
            }
            ctx.closePath();
        }

        // আউটার গ্লোয়িং রিংস
        for (let r = 0; r < 3; r++) {
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate((Math.PI / 6) + (r * 0.2)); 
            ctx.lineWidth = 3 - r;
            ctx.strokeStyle = r % 2 == 0 ? "#00ffcc" : "#0033ff";
            ctx.shadowBlur = 20;
            ctx.shadowColor = ctx.strokeStyle;
            drawHexagon(0, 0, 160 + (r * 8));
            ctx.stroke();
            ctx.restore();
        }

        // প্রোফাইল মাস্ক
        ctx.save();
        drawHexagon(centerX, centerY, 145);
        ctx.clip();
        ctx.drawImage(avatar, centerX - 145, centerY - 145, 290, 290);
        ctx.restore();

        // --- সাইবার টেক্সট হাইলাইটস ---
        ctx.textAlign = "center";
        
        // নেম প্লেট (Neon Glassmorphism)
        ctx.fillStyle = "rgba(0, 255, 204, 0.2)";
        ctx.fillRect(centerX - 150, centerY + 185, 300, 45);
        ctx.strokeStyle = "#00ffcc";
        ctx.strokeRect(centerX - 150, centerY + 185, 300, 45);

        ctx.font = "bold 32px 'Courier New'";
        ctx.fillStyle = "#ffffff";
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#00ffcc";
        ctx.fillText(name.toUpperCase(), centerX, centerY + 220);

        ctx.font = "bold 14px sans-serif";
        ctx.fillStyle = "#00ffcc";
        ctx.fillText("SYSTΞM OPΞRATIVΞ", centerX, centerY + 250);
        ctx.shadowBlur = 0;

        // --- ইনফরমেশন প্যানেল (Glowing Nodes) ---
        function drawPremiumInfo(x, y, label, text, color) {
            // কার্ড ব্যাকগ্রাউন্ড
            const boxGrad = ctx.createLinearGradient(x, y, x + 430, y);
            boxGrad.addColorStop(0, "rgba(0, 40, 40, 0.9)");
            boxGrad.addColorStop(1, "rgba(0, 10, 20, 0.8)");
            ctx.fillStyle = boxGrad;
            ctx.fillRect(x, y, 430, 65);
            
            // লাইটিং ইফেক্ট (বর্ডার ও গ্লো)
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.shadowBlur = 8;
            ctx.shadowColor = color;
            ctx.strokeRect(x, y, 430, 65);
            
            // ডেটা টেক্সট
            ctx.textAlign = "left";
            ctx.shadowBlur = 0;
            ctx.font = "900 12px sans-serif";
            ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
            ctx.fillText(label, x + 20, y + 25);
            
            ctx.font = "bold 26px 'Consolas'";
            ctx.fillStyle = "#ffffff";
            ctx.fillText(text, x + 20, y + 52);
            
            // নিওন ইন্ডিকেটর ডট
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x + 410, y + 32, 5, 0, Math.PI * 2);
            ctx.fill();
        }

        const infoX = 435;
        drawPremiumInfo(infoX, 60, "TARGET AGENT", name.split(" ")[0], "#00ffcc");
        drawPremiumInfo(infoX, 145, "SERIAL NUMBER", `IDX-${targetID.substring(0,8)}`, "#00ffff");
        drawPremiumInfo(infoX, 230, "GENDER UNIT", gender, "#ff0066");
        drawPremiumInfo(infoX, 315, "CREDIT BALANCE", `${money.toLocaleString()} $`, "#ffff00");
        drawPremiumInfo(infoX, 400, "AUTHORITY", "S-CLASS GHOST", "#ff9900");
        drawPremiumInfo(infoX, 485, "CONNECTIVITY", "SECURE LINE", "#00ff00");

        const pathImg = path.join(__dirname, "cache", `cyber_spy_${targetID}.png`);
        fs.writeFileSync(pathImg, canvas.toBuffer());

        return api.sendMessage({
            body: `💠 𝐒𝐘𝐒𝐓𝐄𝐌 𝐀𝐂𝐂𝐄𝐒𝐒 𝐆𝐑𝐀𝐍𝐓𝐄𝐃 💠\n──────────────────\n👤 𝐀𝐠𝐞𝐧𝐭: ${name}\n🆔 𝐈𝐃: ${targetID}\n──────────────────\n© 𝐂𝐫𝐞𝐝𝐢𝐭𝐬: 𝐌𝐃 𝐇𝐀𝐌𝐈𝐌`,
            attachment: fs.createReadStream(pathImg)
        }, threadID, () => fs.unlinkSync(pathImg), messageID);

    } catch (e) {
        console.error(e);
        return api.sendMessage("❌ [ FATAL ERROR ] সিস্টেম ক্র্যাশ করেছে!", threadID, messageID);
    }
};
