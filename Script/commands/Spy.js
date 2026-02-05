const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

module.exports.config = {
    name: "spy",
    version: "5.5.0",
    hasPermssion: 0,
    credits: "Saim / Modified by Gemini",
    description: "প্রোফাইল পিকচারের নিচে প্রিমিয়াম হাতে লেখা সিগনেচার ইফেক্ট।",
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

        api.sendMessage("🔐 ডিজিটাল সিগনেচার অথেন্টিকেট করা হচ্ছে...", threadID, messageID);

        const userInfo = await api.getUserInfo(targetID);
        const userData = userInfo[targetID];
        if (!userData) return api.sendMessage("❌ ডাটাবেস এরর!", threadID, messageID);

        const money = (await Currencies.getData(targetID)).money || 0;
        const name = userData.name || "Secret Agent";
        const gender = userData.gender == 2 ? "MALE" : userData.gender == 1 ? "FEMALE" : "SECRET";

        const canvas = createCanvas(900, 580);
        const ctx = canvas.getContext("2d");

        // ব্যাকগ্রাউন্ড (Deep Cyber Black)
        ctx.fillStyle = "#000a0a"; 
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // গ্লোয়িং বর্ডার
        const mainGrad = ctx.createLinearGradient(0, 0, 900, 580);
        mainGrad.addColorStop(0, "#00ffcc");
        mainGrad.addColorStop(0.5, "#0066ff");
        mainGrad.addColorStop(1, "#ff0066");
        ctx.lineWidth = 15;
        ctx.strokeStyle = mainGrad;
        ctx.strokeRect(8, 8, 884, 564);

        // --- প্রোফাইল ফটো সেকশন ---
        const avatarUrl = `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
        let avatar;
        try { avatar = await loadImage(avatarUrl); } 
        catch (e) { avatar = await loadImage("https://i.imgur.com/I3VsBEt.png"); }

        const centerX = 235;
        const centerY = 230;

        // নিওন সার্কেল
        ctx.save();
        ctx.lineWidth = 6;
        ctx.strokeStyle = "#00ffcc";
        ctx.shadowBlur = 20;
        ctx.shadowColor = "#00ffcc";
        ctx.beginPath();
        ctx.arc(centerX, centerY, 142, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // ফটো মাস্কিং
        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, 130, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(avatar, centerX - 130, centerY - 130, 260, 260);
        ctx.restore();

        // --- ডিজিটাল সিগনেচার (পিকচারের ঠিক নিচে) ---
        ctx.save();
        ctx.textAlign = "center";
        
        // সিগনেচার টেক্সট ইফেক্ট
        ctx.shadowBlur = 15;
        ctx.shadowColor = "rgba(255, 255, 255, 0.8)";
        ctx.font = "italic bold 40px 'Courier New'"; // Handwritten style simulation
        ctx.fillStyle = "#ffffff";
        
        const sigY = centerY + 190;
        // নামের সিগনেচার
        ctx.fillText(name, centerX, sigY);
        
        // নিওন ড্র সিগনেচার লাইন (Curve Line)
        ctx.beginPath();
        ctx.moveTo(centerX - 130, sigY + 12);
        ctx.bezierCurveTo(centerX - 70, sigY + 25, centerX + 70, sigY + 0, centerX + 130, sigY + 12);
        ctx.strokeStyle = "rgba(0, 255, 204, 0.7)";
        ctx.lineWidth = 4;
        ctx.lineCap = "round";
        ctx.stroke();

        // সিগনেচার আইডি ভেরিফাইড টেক্সট
        ctx.font = "bold 11px Arial";
        ctx.fillStyle = "#00ffcc";
        ctx.fillText("Digitally Signed by Agent", centerX, sigY + 35);
        ctx.restore();

        // --- কার্ড ইনফরমেশন বক্স ---
        function drawSpyBox(x, y, label, text, color) {
            ctx.save();
            ctx.fillStyle = "rgba(0, 40, 40, 0.6)";
            ctx.fillRect(x, y, 420, 52);
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, 420, 52);
            
            ctx.fillStyle = color;
            ctx.font = "bold 16px Courier New";
            ctx.fillText(label, x + 20, y + 33);
            
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 20px Courier New";
            ctx.fillText(text, x + 130, y + 33);
            ctx.restore();
        }

        const boxX = 445;
        drawSpyBox(boxX, 75, "NAME  :", name.split(' ')[0].toUpperCase(), "#00ffcc");
        drawSpyBox(boxX, 145, "UID   :", targetID, "#00ffff");
        drawSpyBox(boxX, 215, "SEX   :", gender, "#ff0066");
        drawSpyBox(boxX, 285, "CASH  :", `$${money.toLocaleString()}`, "#ffff00");
        drawSpyBox(boxX, 355, "RANK  :", "ELITE AGENT", "#ff9900");
        drawSpyBox(boxX, 425, "ACCESS:", "AUTHORIZED", "#00ff00");

        const pathImg = path.join(__dirname, "cache", `spy_final_${targetID}.png`);
        fs.writeFileSync(pathImg, canvas.toBuffer());

        return api.sendMessage({
            body: `✅ **SIGNATURE AUTHENTICATED**\nএজেন্ট ${name}-এর জন্য একটি ইউনিক সিগনেচার কার্ড জেনারেট করা হয়েছে।`,
            attachment: fs.createReadStream(pathImg)
        }, threadID, () => fs.unlinkSync(pathImg), messageID);

    } catch (e) {
        console.error(e);
        return api.sendMessage("❌ সিস্টেম এরর! আবার চেষ্টা করুন।", threadID, messageID);
    }
};
