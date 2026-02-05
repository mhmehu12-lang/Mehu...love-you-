const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage, registerFont } = require("canvas");

module.exports.config = {
    name: "fbcard",
    version: "1.5.0",
    hasPermssion: 0,
    credits: "MD HAMIM",
    description: "সাইবারপাঙ্ক স্টাইল ফেসবুক আইডি কার্ড তৈরি করুন।",
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

        api.sendMessage("📥 সাইবার আইডি কার্ড জেনারেট হচ্ছে...", threadID, messageID);

        const userInfo = await api.getUserInfo(targetID);
        const userData = userInfo[targetID];
        const name = userData.name || "Unknown User";

        const canvas = createCanvas(1000, 1000); // স্কয়ার ফরম্যাট ছবির মতো
        const ctx = canvas.getContext("2d");

        // --- ব্যাকগ্রাউন্ড (Dark Cyber Theme) ---
        ctx.fillStyle = "#020a0f";
        ctx.fillRect(0, 0, 1000, 1000);

        // গ্রিড লাইন (Background Grid)
        ctx.strokeStyle = "rgba(0, 255, 255, 0.05)";
        ctx.lineWidth = 1;
        for (let i = 0; i < 1000; i += 40) {
            ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 1000); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(1000, i); ctx.stroke();
        }

        // --- টপ টেক্সট / মেটাডেটা ---
        ctx.font = "16px monospace";
        ctx.fillStyle = "#00ffff";
        ctx.fillText(`credits: MD HAMIM`, 50, 50);
        ctx.fillText(`target: ${targetID}`, 50, 75);
        ctx.fillText(`name: ${name.toLowerCase().replace(/\s/g, '_')}`, 50, 100);

        // --- প্রোফাইল ফটো (Hexagon Frame) ---
        const avatarUrl = `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
        let avatar;
        try { avatar = await loadImage(avatarUrl); } 
        catch (e) { avatar = await loadImage("https://i.imgur.com/I3VsBEt.png"); }

        // হেক্সাগন শেপ আঁকা
        function drawHexagon(x, y, size) {
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                ctx.lineTo(x + size * Math.cos(i * Math.PI / 3), y + size * Math.sin(i * Math.PI / 3));
            }
            ctx.closePath();
        }

        // আউটার নিয়ন গ্লো
        ctx.shadowBlur = 20;
        ctx.shadowColor = "#00ffff";
        ctx.strokeStyle = "#00ffff";
        ctx.lineWidth = 8;
        drawHexagon(250, 500, 180);
        ctx.stroke();

        ctx.shadowBlur = 0; // গ্লো বন্ধ
        ctx.save();
        drawHexagon(250, 500, 170);
        ctx.clip();
        ctx.drawImage(avatar, 80, 330, 340, 340);
        ctx.restore();

        // --- মেইন কন্টেন্ট (Right Side) ---
        ctx.textAlign = "left";
        
        // ACCESS GRANTED
        ctx.font = "bold 55px sans-serif";
        ctx.fillStyle = "#00ffff";
        ctx.fillText("ACCESS GRANTED", 450, 420);

        // User Details
        ctx.font = "30px monospace";
        ctx.fillText(`USER NAME: ${name}`, 450, 480);
        ctx.fillText(`ENCRYPTED ID: targetID_${targetID.slice(0,4)}`, 450, 520);
        ctx.fillText(`STATUS: ACTIVE / STEALTH`, 450, 560);

        // INJECTING CODE
        ctx.font = "bold 45px sans-serif";
        ctx.fillText(">>> INJECTING CODE <<<", 450, 630);

        // --- বারকোড ---
        ctx.fillStyle = "white";
        ctx.fillRect(450, 660, 450, 40);
        for(let i=0; i<450; i+=10) {
            ctx.fillStyle = "black";
            ctx.fillRect(450 + i, 660, Math.random()*6, 40);
        }

        // --- ফুটনোট ---
        ctx.font = "italic 24px monospace";
        ctx.fillStyle = "#00ffff";
        ctx.fillText(`// Signature: ${name.split(" ")[0]}`, 450, 750);
        
        ctx.textAlign = "right";
        ctx.font = "18px monospace";
        ctx.fillText("POWERED BY MD HAMIM", 950, 950);

        const pathImg = path.join(__dirname, "cache", `cyber_card_${targetID}.png`);
        fs.writeFileSync(pathImg, canvas.toBuffer());

        return api.sendMessage({
            body: `🛡️ **CYBER ID GENERATED**\nUser: ${name}`,
            attachment: fs.createReadStream(pathImg)
        }, threadID, () => fs.unlinkSync(pathImg), messageID);

    } catch (e) {
        console.error(e);
        return api.sendMessage("❌ ত্রুটি: কার্ড তৈরি করা সম্ভব হয়নি।", threadID, messageID);
    }
};
