const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

module.exports.config = {
    name: "bekar",
    version: "3.0.0",
    hasPermssion: 0,
    credits: "MD HAMIM",
    description: "সম্পূর্ণ বাংলায় রিয়ালিস্টিক বেকার আইডি কার্ড।",
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

        api.sendMessage("⌛ তথ্য যাচাই করা হচ্ছে... বাংলায় কার্ড তৈরি হচ্ছে।", threadID, messageID);

        const userInfo = await api.getUserInfo(targetID);
        const userData = userInfo[targetID];
        const name = userData.name || "অজানা বেকার";
        
        // লিঙ্গ অনুযায়ী বৈবাহিক অবস্থা নির্ধারণ (ঐচ্ছিক মজা)
        const relationStatus = "সিঙ্গেল (বেকার)";

        const canvas = createCanvas(1000, 600);
        const ctx = canvas.getContext("2d");

        // --- কার্ড ব্যাকগ্রাউন্ড ---
        ctx.fillStyle = "#112e5a";
        ctx.fillRect(0, 0, 1000, 600);

        // টেক্সচার গ্রিড
        ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
        for (let i = 0; i < 1000; i += 15) {
            ctx.beginPath();
            ctx.moveTo(i, 0); ctx.lineTo(i, 600);
            ctx.stroke();
        }

        // --- রিয়ালিস্টিক সীল (Top Left) ---
        const logoX = 150;
        const logoY = 130;
        const radius = 80;

        ctx.beginPath();
        ctx.arc(logoX, logoY, radius, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.lineWidth = 5;
        ctx.strokeStyle = "#8b0000";
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(logoX, logoY, radius - 15, 0, Math.PI * 2);
        ctx.fillStyle = "#8b0000";
        ctx.fill();

        ctx.fillStyle = "#f1c40f";
        ctx.beginPath();
        ctx.arc(logoX, logoY, 30, 0, Math.PI * 2); 
        ctx.fill();

        ctx.save();
        ctx.translate(logoX, logoY);
        ctx.font = "bold 14px Arial";
        ctx.fillStyle = "#8b0000";
        ctx.textAlign = "center";
        const sealText = "গণপ্রজাতন্ত্রী বেকার সমাজ * সমবায় * ";
        for (let n = 0; n < sealText.length; n++) {
            ctx.rotate(Math.PI / 10);
            ctx.fillText(sealText[n], 0, -radius + 10);
        }
        ctx.restore();

        // --- শিরোনাম (বাংলায়) ---
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;
        ctx.shadowColor = "rgba(0,0,0,0.5)";
        ctx.fillStyle = "#d4af37";
        ctx.font = "bold 90px 'Arial'"; // সার্ভারে বাংলা ফন্ট থাকলে আরও ভালো দেখাবে
        ctx.textAlign = "right";
        ctx.fillText("বেকার কার্ড", 930, 140);
        ctx.shadowColor = "transparent";

        // --- ইউজার ফটো ---
        const avatarUrl = `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
        let avatar;
        try { avatar = await loadImage(avatarUrl); } 
        catch (e) { avatar = await loadImage("https://i.imgur.com/I3VsBEt.png"); }

        ctx.drawImage(avatar, 45, 200, 310, 310);
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 6;
        ctx.strokeRect(45, 200, 310, 310);

        // --- বাংলায় তথ্য (Labels in Bengali) ---
        ctx.textAlign = "left";
        ctx.fillStyle = "white";
        
        ctx.font = "bold 40px 'Arial'";
        ctx.fillText(`নাম: ${name}`, 385, 260);
        
        ctx.font = "35px 'Arial'";
        ctx.fillText(`অবস্থা: ${relationStatus}`, 385, 330);
        
        ctx.font = "35px 'Arial'";
        ctx.fillText("ভোটার: ⚖️ (যোগ্য)", 385, 400);

        // --- গোল্ডেন চিপ ---
        const chipX = 800, chipY = 350;
        ctx.fillStyle = "#e5b80b";
        ctx.roundRect(chipX, chipY, 150, 100, 15).fill();
        ctx.strokeStyle = "rgba(0,0,0,0.3)";
        ctx.lineWidth = 2;
        for(let l=1; l<3; l++) {
            ctx.strokeRect(chipX + 10, chipY + (l*30), 130, 1);
            ctx.strokeRect(chipX + (l*50), chipY + 10, 1, 80);
        }

        // --- নম্বর এবং বারকোড ---
        ctx.font = "bold 50px 'Courier New'";
        ctx.fillText("১১০১   ৪৫৬৮   ১২৩৪   ৪৫৬৮", 385, 510);
        
        ctx.fillStyle = "white";
        ctx.fillRect(385, 535, 560, 45);
        for(let i=0; i<560; i+=8) {
            ctx.fillStyle = "black";
            ctx.fillRect(385 + i, 535, Math.random()*5, 45);
        }

        // --- স্বাক্ষর (বাংলায়) ---
        ctx.font = "bold 30px 'Arial'";
        ctx.fillText("স্বাক্ষর:", 45, 570);
        ctx.font = "italic 38px 'Arial'"; 
        ctx.fillStyle = "#00ffff";
        ctx.fillText(name.split(" ")[0], 160, 575);

        const pathImg = path.join(__dirname, "cache", `bengali_bekar_${targetID}.png`);
        fs.writeFileSync(pathImg, canvas.toBuffer());

        return api.sendMessage({
            body: `💳 **ডিজিটাল বেকার কার্ড (বাংলা সংস্করণ)**\n\nনাম: ${name}\nঅবস্থা: ${relationStatus}\n\n© ক্রেডিট: এমডি হামিম`,
            attachment: fs.createReadStream(pathImg)
        }, threadID, () => fs.unlinkSync(pathImg), messageID);

    } catch (e) {
        console.error(e);
        return api.sendMessage("❌ এরর: কার্ডটি বাংলায় রূপান্তর করা যায়নি।", threadID, messageID);
    }
};

// RoundRect Helper
CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
    this.beginPath();
    this.moveTo(x + r, y);
    this.arcTo(x + w, y, x + w, y + h, r);
    this.arcTo(x + w, y + h, x, y + h, r);
    this.arcTo(x, y + h, x, y, r);
    this.arcTo(x, y, x + w, y, r);
    this.closePath();
    return this;
};
