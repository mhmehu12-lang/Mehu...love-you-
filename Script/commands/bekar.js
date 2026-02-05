const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

module.exports.config = {
    name: "bekar",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "MD HAMIM",
    description: "ইউনিক বেকার আইডি কার্ড জেনারেটর।",
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

        api.sendMessage("💳 আপনার বেকার কার্ডটি প্রিন্ট করা হচ্ছে... দয়া করে অপেক্ষা করুন।", threadID, messageID);

        const userInfo = await api.getUserInfo(targetID);
        const userData = userInfo[targetID];
        const name = userData.name || "অজানা বেকার";

        // ক্যানভাস সাইজ (আইডি কার্ডের স্ট্যান্ডার্ড রেশিও)
        const canvas = createCanvas(1000, 600);
        const ctx = canvas.getContext("2d");

        // --- ব্যাকগ্রাউন্ড (গাড় নীল রঙ) ---
        ctx.fillStyle = "#1a3a6d"; 
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // কার্ডের উপরে টেক্সচার বা ডিজাইন
        ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < canvas.width; i += 50) {
            ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height);
        }
        ctx.stroke();

        // --- কার্ডের শিরোনাম ---
        ctx.fillStyle = "#f1c40f"; // সোনালী রঙ
        ctx.font = "bold 80px 'Arial'";
        ctx.textAlign = "center";
        ctx.fillText("বেকার কার্ড", 650, 150);

        // --- চিপ (Gold Chip) ডিজাইন ---
        ctx.fillStyle = "#d4af37";
        ctx.roundRect(800, 320, 150, 110, 15);
        ctx.fill();
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 1;
        ctx.strokeRect(810, 330, 130, 90);

        // --- প্রোফাইল পিকচার (বাম পাশে) ---
        const avatarUrl = `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
        let avatar;
        try { avatar = await loadImage(avatarUrl); } 
        catch (e) { avatar = await loadImage("https://i.imgur.com/I3VsBEt.png"); }

        ctx.drawImage(avatar, 50, 250, 300, 300); // বামে ফটো
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 5;
        ctx.strokeRect(50, 250, 300, 300);

        // --- তথ্যাবলী (ডান পাশে) ---
        ctx.textAlign = "left";
        ctx.fillStyle = "#ffffff";
        
        // Name
        ctx.font = "bold 40px 'Arial'";
        ctx.fillText(`Name: ${name}`, 380, 280);
        
        // Relationship
        ctx.font = "35px 'Arial'";
        ctx.fillText("Relationship: Single", 380, 350);
        
        // Voter Icon (Scale)
        ctx.font = "35px 'Arial'";
        ctx.fillText("Voter: ⚖️", 380, 420);

        // --- কার্ড নম্বর (নিচে) ---
        ctx.font = "bold 50px 'Courier New'";
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.fillText("1254   4568   1234   4568", 380, 520);

        // বারকোড এরিয়া
        ctx.fillStyle = "#fff";
        ctx.fillRect(380, 540, 580, 40);
        for(let b=0; b<580; b+=10) {
            ctx.fillStyle = "#000";
            ctx.fillRect(380 + b, 540, Math.random() * 5, 40);
        }

        // স্বাক্ষর
        ctx.font = "italic 30px 'Arial'";
        ctx.fillStyle = "#00ffff";
        ctx.fillText(`স্বাক্ষর: ${name.split(' ')[0]}`, 50, 585);

        const pathImg = path.join(__dirname, "cache", `bekar_card_${targetID}.png`);
        fs.writeFileSync(pathImg, canvas.toBuffer());

        return api.sendMessage({
            body: `অভিনন্দন ${name}! 🎉\nআপনার ডিজিটাল 'বেকার কার্ড' তৈরি হয়ে গেছে।\n\n© Credits: MD HAMIM`,
            attachment: fs.createReadStream(pathImg)
        }, threadID, () => fs.unlinkSync(pathImg), messageID);

    } catch (e) {
        console.error(e);
        return api.sendMessage("❌ কার্ড জেনারেট করতে সমস্যা হয়েছে।", threadID, messageID);
    }
};

// Canvas roundRect helper for older versions
CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  this.beginPath();
  this.moveTo(x + r, y);
  this.arcTo(x + w, y, x + w, y + h, r);
  this.arcTo(x + w, y + h, x, y + h, r);
  this.arcTo(x, y + h, x, y, r);
  this.arcTo(x, y, x + w, y, r);
  this.closePath();
  return this;
}
