const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

module.exports.config = {
    name: "bekar",
    version: "6.0.0",
    hasPermssion: 0,
    credits: "MD HAMIM",
    description: "Premium Identity Card Generator",
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

        api.sendMessage("⚙️ [ SYSTEM ] Processing your ID Card...", threadID, messageID);

        const userInfo = await api.getUserInfo(targetID);
        const userData = userInfo[targetID];
        const name = userData.name || "Unknown Agent";

        const canvas = createCanvas(1000, 600);
        const ctx = canvas.getContext("2d");

        // --- Card Background (Deep Professional Blue) ---
        ctx.fillStyle = "#0c2340"; 
        ctx.fillRect(0, 0, 1000, 600);

        // Grid lines for high-tech look
        ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
        ctx.lineWidth = 1;
        for (let i = 0; i < 1000; i += 25) {
            ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 600); ctx.stroke();
        }

        // --- Realistic Red/Gold Seal ---
        const logoX = 140, logoY = 120;
        ctx.beginPath();
        ctx.arc(logoX, logoY, 75, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff"; ctx.fill();
        ctx.lineWidth = 4; ctx.strokeStyle = "#8b0000"; ctx.stroke();

        ctx.beginPath();
        ctx.arc(logoX, logoY, 60, 0, Math.PI * 2);
        ctx.fillStyle = "#8b0000"; ctx.fill();

        ctx.fillStyle = "#ffd700";
        ctx.beginPath(); ctx.arc(logoX, logoY, 20, 0, Math.PI * 2); ctx.fill();

        // --- Title (English to prevent box rendering issues) ---
        ctx.fillStyle = "#ffd700";
        ctx.font = "bold 85px sans-serif";
        ctx.textAlign = "right";
        ctx.fillText("BEKAR CARD", 950, 130);

        // --- User Avatar (With Border) ---
        const avatarUrl = `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
        let avatar;
        try { avatar = await loadImage(avatarUrl); } 
        catch (e) { avatar = await loadImage("https://i.imgur.com/I3VsBEt.png"); }

        ctx.drawImage(avatar, 40, 200, 310, 310);
        ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 6;
        ctx.strokeRect(40, 200, 310, 310);

        // --- Information Display ---
        ctx.textAlign = "left"; ctx.fillStyle = "white";
        ctx.font = "bold 42px sans-serif";
        ctx.fillText(`NAME: ${name.toUpperCase()}`, 390, 260);
        
        ctx.font = "38px sans-serif";
        ctx.fillText("STATUS: SINGLE (GHOST)", 390, 335);
        ctx.fillText("VOTER: ELIGIBLE (YES)", 390, 410);

        // --- Realistic Gold IC Chip ---
        const chipX = 810, chipY = 350;
        ctx.fillStyle = "#d4af37";
        ctx.fillRect(chipX, chipY, 140, 100);
        ctx.strokeStyle = "rgba(0,0,0,0.5)";
        ctx.strokeRect(chipX + 10, chipY + 10, 120, 80);

        // --- Card Serial and Barcode ---
        ctx.font = "bold 50px Courier New";
        ctx.fillText("1101   4568   1234   4568", 390, 520);
        
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(390, 545, 560, 40);
        for(let i=0; i<560; i+=10) {
            ctx.fillStyle = "#000000";
            ctx.fillRect(390 + i, 545, Math.random()*6, 40);
        }

        // --- Signature Area ---
        ctx.font = "bold 30px sans-serif";
        ctx.fillText("SIGNATURE:", 40, 580);
        ctx.font = "italic 40px sans-serif";
        ctx.fillStyle = "#00ffff";
        ctx.fillText(name.split(" ")[0], 215, 585);

        const pathImg = path.join(__dirname, "cache", `final_card_${targetID}.png`);
        fs.writeFileSync(pathImg, canvas.toBuffer());

        return api.sendMessage({
            body: `✅ **ID CARD GENERATED**\n👤 Operative: ${name}\n\n© Credits: MD HAMIM`,
            attachment: fs.createReadStream(pathImg)
        }, threadID, () => fs.unlinkSync(pathImg), messageID);

    } catch (e) {
        console.error(e);
        return api.sendMessage("❌ Critical Error: Unable to load dependencies.", threadID, messageID);
    }
};
