const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

module.exports.config = {
    name: "bekar",
    version: "5.0.0",
    hasPermssion: 0,
    credits: "MD HAMIM",
    description: "Premium Real ID Card Generator",
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

        api.sendMessage("⌛ Processing Your Card...", threadID, messageID);

        const userInfo = await api.getUserInfo(targetID);
        const userData = userInfo[targetID];
        const name = userData.name || "Unknown User";

        const canvas = createCanvas(1000, 600);
        const ctx = canvas.getContext("2d");

        // --- Background Design ---
        ctx.fillStyle = "#112e5a";
        ctx.fillRect(0, 0, 1000, 600);

        // Grid lines for texture
        ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
        ctx.lineWidth = 1;
        for (let i = 0; i < 1000; i += 20) {
            ctx.beginPath();
            ctx.moveTo(i, 0); ctx.lineTo(i, 600);
            ctx.stroke();
        }

        // --- Realistic Seal ---
        const logoX = 140, logoY = 120, radius = 75;
        ctx.beginPath();
        ctx.arc(logoX, logoY, radius, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff"; ctx.fill();
        ctx.lineWidth = 4; ctx.strokeStyle = "#a00000"; ctx.stroke();

        ctx.beginPath();
        ctx.arc(logoX, logoY, radius - 15, 0, Math.PI * 2);
        ctx.fillStyle = "#a00000"; ctx.fill();

        ctx.fillStyle = "#f1c40f";
        ctx.beginPath();
        ctx.arc(logoX, logoY, 25, 0, Math.PI * 2); ctx.fill();

        // --- Heading (English to avoid box issue) ---
        ctx.fillStyle = "#d4af37";
        ctx.font = "bold 90px Arial";
        ctx.textAlign = "right";
        ctx.fillText("BEKAR CARD", 940, 130);

        // --- User Photo ---
        const avatarUrl = `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
        let avatar;
        try { avatar = await loadImage(avatarUrl); } 
        catch (e) { avatar = await loadImage("https://i.imgur.com/I3VsBEt.png"); }

        ctx.drawImage(avatar, 40, 200, 310, 310);
        ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 6;
        ctx.strokeRect(40, 200, 310, 310);

        // --- Info Section ---
        ctx.textAlign = "left"; ctx.fillStyle = "white";
        ctx.font = "bold 40px Arial";
        ctx.fillText(`NAME: ${name.toUpperCase()}`, 385, 260);
        
        ctx.font = "35px Arial";
        ctx.fillText("STATUS: SINGLE (UNEMPLOYED)", 385, 330);
        ctx.fillText("VOTER: ELIGIBLE (⚖️)", 385, 400);

        // --- Realistic Chip ---
        const chipX = 810, chipY = 350;
        ctx.fillStyle = "#e5b80b";
        ctx.roundRect(chipX, chipY, 150, 100, 15).fill();
        ctx.strokeStyle = "rgba(0,0,0,0.3)";
        ctx.lineWidth = 2;
        for(let l=1; l<3; l++) {
            ctx.strokeRect(chipX + 10, chipY + (l*30), 130, 1);
            ctx.strokeRect(chipX + (l*50), chipY + 10, 1, 80);
        }

        // --- Number and Barcode ---
        ctx.font = "bold 50px Courier New";
        ctx.fillText("1254   4568   1234   4568", 385, 510);
        
        ctx.fillStyle = "white";
        ctx.fillRect(385, 535, 560, 45);
        for(let i=0; i<560; i+=8) {
            ctx.fillStyle = "black";
            ctx.fillRect(385 + i, 535, Math.random()*5, 45);
        }

        // --- Signature ---
        ctx.font = "bold 30px Arial";
        ctx.fillText("SIGNATURE:", 40, 575);
        ctx.font = "italic 40px Arial";
        ctx.fillStyle = "#00ffff";
        ctx.fillText(name.split(" ")[0], 215, 580);

        const pathImg = path.join(__dirname, "cache", `card_${targetID}.png`);
        fs.writeFileSync(pathImg, canvas.toBuffer());

        return api.sendMessage({
            body: `✅ BEKAR CARD GENERATED\n👤 Agent: ${name}\n\n© Credits: MD HAMIM`,
            attachment: fs.createReadStream(pathImg)
        }, threadID, () => fs.unlinkSync(pathImg), messageID);

    } catch (e) {
        console.error(e);
        return api.sendMessage("❌ Error: System Fault!", threadID, messageID);
    }
};

// Canvas Helper
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
