const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

module.exports.config = {
    name: "uidcard",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "MD HAMIM",
    description: "ইউজারের UID দিয়ে লাইটিং ইফেক্ট কার্ড তৈরি করুন।",
    commandCategory: "fun",
    usages: "[mention/reply/uid]",
    cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
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

        api.sendMessage("✨ আপনার UID হাইলাইট কার্ড তৈরি হচ্ছে...", threadID, messageID);

        const canvas = createCanvas(800, 400);
        const ctx = canvas.getContext("2d");

        // --- ব্যাকগ্রাউন্ড (ডার্ক থিম) ---
        ctx.fillStyle = "#050505";
        ctx.fillRect(0, 0, 800, 400);

        // একটু নীলচে আভা (Ambient Light)
        const ambientGrad = ctx.createRadialGradient(400, 200, 50, 400, 200, 400);
        ambientGrad.addColorStop(0, "rgba(0, 102, 255, 0.15)");
        ambientGrad.addColorStop(1, "transparent");
        ctx.fillStyle = ambientGrad;
        ctx.fillRect(0, 0, 800, 400);

        // --- প্রোফাইল পিকচার ---
        const avatarUrl = `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
        let avatar;
        try { avatar = await loadImage(avatarUrl); } 
        catch (e) { avatar = await loadImage("https://i.imgur.com/I3VsBEt.png"); }

        // গোল প্রোফাইল ফ্রেম উইথ গ্লো
        ctx.save();
        ctx.shadowBlur = 20;
        ctx.shadowColor = "#0066ff";
        ctx.beginPath();
        ctx.arc(150, 200, 100, 0, Math.PI * 2);
        ctx.closePath();
        ctx.lineWidth = 5;
        ctx.strokeStyle = "#0066ff";
        ctx.stroke();
        ctx.clip();
        ctx.drawImage(avatar, 50, 100, 200, 200);
        ctx.restore();

        // --- UID টেক্সট এবং লাইটিং ইফেক্ট ---
        const uidText = `UID: ${targetID}`;
        
        // টেক্সটের পেছনে গ্লো (Highlight)
        ctx.shadowBlur = 30;
        ctx.shadowColor = "#00ccff";
        ctx.fillStyle = "#00ccff";
        ctx.font = "bold 60px Arial";
        ctx.textAlign = "left";

        // মেইন হাইলাইটেড টেক্সট
        ctx.fillText(uidText, 300, 220);

        // টেক্সটের নিচে একটি নিওন লাইন
        ctx.beginPath();
        ctx.moveTo(300, 240);
        ctx.lineTo(700, 240);
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#00ccff";
        ctx.stroke();

        // ছোট ডেকোরেশন টেক্সট
        ctx.shadowBlur = 0;
        ctx.font = "20px monospace";
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.fillText("SYSTEM SCANNING COMPLETED...", 300, 150);

        const pathImg = path.join(__dirname, "cache", `uid_glow_${targetID}.png`);
        fs.writeFileSync(pathImg, canvas.toBuffer());

        return api.sendMessage({
            body: `🆔 ইউজার UID হাইলাইটেড সম্পন্ন!\n👤 টার্গেট: ${targetID}`,
            attachment: fs.createReadStream(pathImg)
        }, threadID, () => fs.unlinkSync(pathImg), messageID);

    } catch (e) {
        console.error(e);
        return api.sendMessage("❌ ইমেজ তৈরি করতে ব্যর্থ হয়েছি।", threadID, messageID);
    }
};
