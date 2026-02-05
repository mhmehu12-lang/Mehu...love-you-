const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage, registerFont } = require("canvas");

module.exports.config = {
    name: "bekar",
    version: "3.5.0",
    hasPermssion: 0,
    credits: "MD HAMIM",
    description: "রিয়ালিস্টিক বাংলা বেকার আইডি কার্ড জেনারেটর।",
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

        api.sendMessage("⌛ আপনার বেকার কার্ডটি প্রিন্ট করা হচ্ছে...", threadID, messageID);

        const userInfo = await api.getUserInfo(targetID);
        const userData = userInfo[targetID];
        const name = userData.name || "অজানা বেকার";

        const canvas = createCanvas(1000, 600);
        const ctx = canvas.getContext("2d");

        // --- ব্যাকগ্রাউন্ড ডিজাইন ---
        ctx.fillStyle = "#143362"; 
        ctx.fillRect(0, 0, 1000, 600);

        // টেক্সচার গ্রিড
        ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
        ctx.lineWidth = 1;
        for (let i = 0; i < 1000; i += 20) {
            ctx.beginPath();
            ctx.moveTo(i, 0); ctx.lineTo(i, 600);
            ctx.stroke();
        }

        // --- রিয়ালিস্টিক সিলমোহর (Top Left) ---
        const logoX = 140, logoY = 130, radius = 75;
        ctx.beginPath();
        ctx.arc(logoX, logoY, radius, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff"; ctx.fill();
        ctx.lineWidth = 4; ctx.strokeStyle = "#a00000"; ctx.stroke();

        ctx.beginPath();
        ctx.arc(logoX, logoY, radius - 12, 0, Math.PI * 2);
        ctx.fillStyle = "#a00000"; ctx.fill();

        ctx.fillStyle = "#f1c40f";
        ctx.beginPath();
        ctx.arc(logoX, logoY, 25, 0, Math.PI * 2); ctx.fill();

        // --- শিরোনাম (বাংলা) ---
        ctx.shadowOffsetX = 3; ctx.shadowOffsetY = 3; ctx.shadowColor = "rgba(0,0,0,0.5)";
        ctx.fillStyle = "#d4af37";
        ctx.font = "bold 95px 'Arial'"; 
        ctx.textAlign = "right";
        ctx.fillText("বেকার কার্ড", 940, 140);
        ctx.shadowColor = "transparent";

        // --- ইউজার ফটো (বাম পাশে) ---
        const avatarUrl = `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
        let avatar;
        try { avatar = await loadImage(avatarUrl); } 
        catch (e) { avatar = await loadImage("https://i.imgur.com/I3VsBEt.png"); }

        ctx.drawImage(avatar, 40, 200, 310, 310);
        ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 6;
        ctx.strokeRect(40, 200, 310, 310);

        // --- বাংলায় তথ্য প্রদান ---
        ctx.textAlign = "left"; ctx.fillStyle = "white";
        ctx.font = "bold 42px 'Arial'";
        ctx.fillText(`নাম: ${name}`, 385, 260);
        ctx.font = "38px 'Arial'";
        ctx.fillText("অবস্থা: সিঙ্গেল (বেকার)", 385, 335);
        ctx.fillText("ভোটার: ⚖️ (যোগ্য)", 385, 410);

        // --- গোল্ডেন চিপ (Real Look) ---
        const chipX = 810, chipY = 350;
        ctx.fillStyle = "#e0ac00";
        ctx.fillRect(chipX, chipY, 145, 105);
        ctx.strokeStyle = "rgba(0,0,0,0.4)";
        ctx.strokeRect(chipX + 10, chipY + 10, 125, 85);

        // --- নম্বর ও বারকোড ---
        ctx.font = "bold 55px 'Courier New'";
        ctx.fillText("১১০১   ৪৫৬৮   ১২৩৪   ৪৫৬৮", 385, 520);
        
        ctx.fillStyle = "white";
        ctx.fillRect(385, 545, 565, 40);
        for(let i=0; i<565; i+=10) {
            ctx.fillStyle = "black";
            ctx.fillRect(385 + i, 545, Math.random()*7, 40);
        }

        // --- স্বাক্ষর ---
        ctx.font = "bold 32px 'Arial'";
        ctx.fillText("স্বাক্ষর:", 40, 580);
        ctx.font = "italic 42px 'Arial'";
        ctx.fillStyle = "#00ffff";
        ctx.fillText(name.split(" ")[0], 160, 585);

        const pathImg = path.join(__dirname, "cache", `final_bekar_${targetID}.png`);
        fs.writeFileSync(pathImg, canvas.toBuffer());

        return api.sendMessage({
            body: `💳 **ডিজিটাল বেকার কার্ড কার্ড সম্পন্ন**\n\nনাম: ${name}\n© ক্রেডিট: এমডি হামিম`,
            attachment: fs.createReadStream(pathImg)
        }, threadID, () => fs.unlinkSync(pathImg), messageID);

    } catch (e) {
        console.error(e);
        return api.sendMessage("❌ ফাইল লোড করতে সমস্যা হয়েছে। দয়া করে প্যাকেজগুলো চেক করুন।", threadID, messageID);
    }
};
