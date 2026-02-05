const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

module.exports.config = {
    name: "bekar",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "MD HAMIM",
    description: "ইউনিক বেকার আইডি কার্ড জেনারেটর (ফটো ফ্রেমসহ)।",
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

        api.sendMessage("⌛ আপনার বেকার কার্ড প্রসেস করা হচ্ছে...", threadID, messageID);

        const userInfo = await api.getUserInfo(targetID);
        const userData = userInfo[targetID];
        const name = userData.name || "Unknown";

        // ক্যানভাস সাইজ
        const canvas = createCanvas(1000, 600);
        const ctx = canvas.getContext("2d");

        // ১. ব্যাকগ্রাউন্ড ডিজাইন (ছবির মতো নেভি ব্লু গ্রেডিয়েন্ট)
        const bgGrad = ctx.createLinearGradient(0, 0, 0, 600);
        bgGrad.addColorStop(0, "#102a54");
        bgGrad.addColorStop(1, "#1c498c");
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, 1000, 600);

        // ২. ডেকোরেশন লাইন এবং টেক্সচার
        ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
        ctx.lineWidth = 1;
        for (let i = 0; i < 1000; i += 20) {
            ctx.beginPath();
            ctx.moveTo(i, 0); ctx.lineTo(i, 600);
            ctx.stroke();
        }

        // ৩. প্রধান শিরোনাম "বেকার কার্ড" (গোল্ডেন ইফেক্ট)
        ctx.fillStyle = "#e5b80b";
        ctx.font = "bold 90px 'Arial'";
        ctx.textAlign = "right";
        ctx.shadowColor = "black";
        ctx.shadowBlur = 10;
        ctx.fillText("বেকার কার্ড", 930, 130);
        ctx.shadowBlur = 0; // রিসেট শ্যাডো

        // ৪. ইউজার প্রোফাইল ফটো (বাম পাশে বড় করে)
        const avatarUrl = `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
        let avatar;
        try { avatar = await loadImage(avatarUrl); } 
        catch (e) { avatar = await loadImage("https://i.imgur.com/I3VsBEt.png"); }

        ctx.drawImage(avatar, 40, 180, 320, 320);
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 8;
        ctx.strokeRect(40, 180, 320, 320);

        // ৫. ইনফরমেশন টেক্সট (ছবির মতো সাজানো)
        ctx.textAlign = "left";
        ctx.fillStyle = "#ffffff";
        
        ctx.font = "bold 45px 'Segoe UI'";
        ctx.fillText(`Name: ${name}`, 390, 240);
        
        ctx.font = "40px 'Segoe UI'";
        ctx.fillText("Relationship: Single", 390, 310);
        
        ctx.font = "40px 'Segoe UI'";
        ctx.fillText("Voter: ⚖️", 390, 380);

        // ৬. স্মার্ট চিপ (Gold Chip)
        ctx.fillStyle = "#ccac00";
        ctx.fillRect(810, 340, 140, 100);
        ctx.strokeStyle = "#000"; ctx.lineWidth = 2;
        ctx.strokeRect(820, 350, 120, 80);

        // ৭. কার্ড নম্বর এবং বারকোড
        ctx.font = "bold 55px 'Courier New'";
        ctx.fillStyle = "white";
        ctx.fillText("1254   4568   1234   4568", 390, 500);

        // বারকোড ড্রয়িং
        ctx.fillStyle = "white";
        ctx.fillRect(390, 530, 560, 50);
        for(let i=0; i<560; i+=10) {
            ctx.fillStyle = "black";
            ctx.fillRect(390 + i, 530, Math.random()*6, 50);
        }

        // ৮. স্বাক্ষর (আপনার স্যাম্পল ছবির মতো নিচে)
        ctx.fillStyle = "white";
        ctx.font = "bold 35px 'Arial'";
        ctx.fillText("স্বাক্ষর:", 30, 570);
        ctx.font = "italic 40px 'Brush Script MT', cursive"; // স্টাইলিশ স্বাক্ষর
        ctx.fillStyle = "#00ffff";
        ctx.fillText(name.split(" ")[0], 150, 575);

        const pathImg = path.join(__dirname, "cache", `bekar_card_${targetID}.png`);
        fs.writeFileSync(pathImg, canvas.toBuffer());

        return api.sendMessage({
            body: `✅ **ডিজিটাল বেকার আইডি কার্ড সম্পন্ন**\nএজেন্ট ${name}, আপনার কার্ডটি সংগ্রহ করুন।\n\n© Credits: MD HAMIM`,
            attachment: fs.createReadStream(pathImg)
        }, threadID, () => fs.unlinkSync(pathImg), messageID);

    } catch (e) {
        console.error(e);
        return api.sendMessage("❌ এরর: ফাইল লোড করতে সমস্যা হয়েছে। প্যাকেজ চেক করুন!", threadID, messageID);
    }
};
