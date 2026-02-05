const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

module.exports.config = {
    name: "uidcard",
    version: "1.1.0",
    hasPermssion: 0,
    credits: "MD HAMIM",
    description: "ইউজারের UID দিয়ে লাইটিং ইফেক্ট কার্ড তৈরি করুন (Fixed Layout)।",
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

        api.sendMessage("✨ UID কার্ডটি ফিক্স করা হচ্ছে...", threadID, messageID);

        // ক্যানভাস সাইজ একটু বড় করা হলো যাতে লেখা না কাটে
        const canvas = createCanvas(1000, 450);
        const ctx = canvas.getContext("2d");

        // --- ব্যাকগ্রাউন্ড ---
        ctx.fillStyle = "#050505";
        ctx.fillRect(0, 0, 1000, 450);

        // ব্লু এমবিয়েন্ট লাইট
        const ambientGrad = ctx.createRadialGradient(500, 225, 50, 500, 225, 500);
        ambientGrad.addColorStop(0, "rgba(0, 102, 255, 0.1)");
        ambientGrad.addColorStop(1, "transparent");
        ctx.fillStyle = ambientGrad;
        ctx.fillRect(0, 0, 1000, 450);

        // --- প্রোফাইল পিকচার ---
        const avatarUrl = `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
        let avatar;
        try { avatar = await loadImage(avatarUrl); } 
        catch (e) { avatar = await loadImage("https://i.imgur.com/I3VsBEt.png"); }

        ctx.save();
        ctx.shadowBlur = 25;
        ctx.shadowColor = "#0066ff";
        ctx.beginPath();
        ctx.arc(180, 225, 110, 0, Math.PI * 2);
        ctx.strokeStyle = "#0066ff";
        ctx.lineWidth = 6;
        ctx.stroke();
        ctx.clip();
        ctx.drawImage(avatar, 70, 115, 220, 220);
        ctx.restore();

        // --- UID টেক্সট এবং লাইটিং ইফেক্ট ---
        const uidText = `UID: ${targetID}`;
        
        // সিস্টেম টেক্সট
        ctx.shadowBlur = 0;
        ctx.font = "22px monospace";
        ctx.fillStyle = "rgba(0, 204, 255, 0.7)";
        ctx.fillText("SYSTEM SCANNING COMPLETED...", 340, 160);

        // মেইন হাইলাইটেড UID
        ctx.shadowBlur = 20;
        ctx.shadowColor = "#00ccff";
        ctx.fillStyle = "#00ccff";
        ctx.font = "bold 55px Arial"; // ফন্ট সাইজ একটু কমানো হয়েছে যাতে ফিট হয়
        ctx.textAlign = "left";
        ctx.fillText(uidText, 340, 235);

        // নিওন আন্ডারলাইন (ডাইনামিক লেন্থ)
        ctx.beginPath();
        ctx.moveTo(340, 255);
        ctx.lineTo(950, 255); // লাইনটি বাড়িয়ে দেওয়া হয়েছে
        ctx.lineWidth = 4;
        ctx.strokeStyle = "#00ccff";
        ctx.stroke();

        // ফুটার ডিজাইন
        ctx.shadowBlur = 0;
        ctx.font = "18px Arial";
        ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
        ctx.fillText("SECURE DATABASE ACCESS // GRANTED", 340, 300);

        const pathImg = path.join(__dirname, "cache", `uid_fixed_${targetID}.png`);
        fs.writeFileSync(pathImg, canvas.toBuffer());

        return api.sendMessage({
            body: `✅ UID কার্ড ফিক্স করা হয়েছে!\n🆔 UID: ${targetID}`,
            attachment: fs.createReadStream(pathImg)
        }, threadID, () => fs.unlinkSync(pathImg), messageID);

    } catch (e) {
        console.error(e);
        return api.sendMessage("❌ ফিক্স করার সময় সমস্যা হয়েছে।", threadID, messageID);
    }
};
