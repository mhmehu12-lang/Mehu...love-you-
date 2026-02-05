const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

module.exports.config = {
    name: "fbcard",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "MD HAMIM",
    description: "ফেসবুক প্রোফাইল ইনফো দিয়ে আইডি কার্ড তৈরি করুন।",
    commandCategory: "fun",
    usages: "[mention/reply/uid]",
    cooldowns: 5
};

module.exports.run = async function ({ api, event, args, Users }) {
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

        api.sendMessage("📥 আপনার ফেসবুক আইডি কার্ডটি তৈরি করা হচ্ছে...", threadID, messageID);

        const userInfo = await api.getUserInfo(targetID);
        const userData = userInfo[targetID];
        const name = userData.name || "FB User";

        const canvas = createCanvas(1000, 600);
        const ctx = canvas.getContext("2d");

        // --- কার্ড ব্যাকগ্রাউন্ড (Facebook Blue Gradient) ---
        const grad = ctx.createLinearGradient(0, 0, 1000, 600);
        grad.addColorStop(0, "#1877F2"); // Facebook Blue
        grad.addColorStop(1, "#0a3d82");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1000, 600);

        // স্টাইলিশ সাইড ডিজাইন
        ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
        ctx.beginPath();
        ctx.moveTo(700, 0);
        ctx.lineTo(1000, 0);
        ctx.lineTo(1000, 600);
        ctx.lineTo(850, 600);
        ctx.closePath();
        ctx.fill();

        // --- ফেসবুক লোগো (Top Right) ---
        ctx.fillStyle = "white";
        ctx.font = "bold 60px Arial";
        ctx.textAlign = "right";
        ctx.fillText("facebook", 950, 80);

        // --- প্রোফাইল ফটো ---
        const avatarUrl = `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
        let avatar;
        try { avatar = await loadImage(avatarUrl); } 
        catch (e) { avatar = await loadImage("https://i.imgur.com/I3VsBEt.png"); }

        // ফটো ফ্রেম
        ctx.save();
        ctx.lineWidth = 10;
        ctx.strokeStyle = "white";
        ctx.strokeRect(50, 150, 320, 320);
        ctx.drawImage(avatar, 50, 150, 320, 320);
        ctx.restore();

        // --- তথ্য (Text Section) ---
        ctx.textAlign = "left";
        ctx.fillStyle = "white";

        // Name
        ctx.font = "bold 50px sans-serif";
        ctx.fillText(name.toUpperCase(), 400, 250);

        // Details
        ctx.font = "30px sans-serif";
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.fillText("STATUS: VERIFIED USER", 400, 310);
        ctx.fillText(`UID: ${targetID}`, 400, 360);
        ctx.fillText("MEMBER SINCE: 2026", 400, 410);

        // --- বারকোড ---
        ctx.fillStyle = "white";
        ctx.fillRect(400, 480, 550, 50);
        for(let i=0; i<550; i+=12) {
            ctx.fillStyle = "black";
            ctx.fillRect(400 + i, 480, Math.random()*8, 50);
        }

        // --- ক্রেডিট ও স্বাক্ষর ---
        ctx.font = "italic 25px Arial";
        ctx.fillStyle = "#ffd700";
        ctx.fillText(`Signature: ${name.split(" ")[0]}`, 50, 550);
        
        ctx.textAlign = "right";
        ctx.font = "bold 20px Arial";
        ctx.fillText("POWERED BY MD HAMIM", 950, 570);

        const pathImg = path.join(__dirname, "cache", `fb_card_${targetID}.png`);
        fs.writeFileSync(pathImg, canvas.toBuffer());

        return api.sendMessage({
            body: `✅ **FACEBOOK ID CARD READY**\n👤 User: ${name}\n🆔 ID: ${targetID}`,
            attachment: fs.createReadStream(pathImg)
        }, threadID, () => fs.unlinkSync(pathImg), messageID);

    } catch (e) {
        console.error(e);
        return api.sendMessage("❌ কার্ড তৈরি করতে সমস্যা হয়েছে!", threadID, messageID);
    }
};
