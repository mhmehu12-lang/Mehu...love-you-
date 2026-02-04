-install syp.js const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage, registerFont } = require("canvas");

module.exports.config = {
    name: "spy",
    version: "5.0.0",
    hasPermssion: 0,
    credits: "Saim / Ultra Unique Spy Card",
    description: "আল্ট্রা ইউনিক ৩ডি সাইবারপাংক স্পাই কার্ড।",
    commandCategory: "utility",
    usages: "[mention/reply/uid]",
    cooldowns: 5
};

function drawHexagon(ctx, x, y, size) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        ctx.lineTo(x + size * Math.cos(i * Math.PI / 3 - Math.PI / 6), 
                   y + size * Math.sin(i * Math.PI / 3 - Math.PI / 6));
    }
    ctx.closePath();
}

module.exports.run = async function ({ api, event, args, Users, Currencies }) {
    const { threadID, messageID, senderID, mentions, type, messageReply } = event;

    try {
        let targetID;
        if (Object.keys(mentions).length > 0) targetID = Object.keys(mentions)[0];
        else if (type == "message_reply") targetID = messageReply.senderID;
        else targetID = args[0] && !isNaN(args[0]) ? args[0] : senderID;

        api.sendMessage("🛰️ কানেক্টিং টু স্যাটেলাইট... ইউনিক কার্ড জেনারেট হচ্ছে!", threadID, messageID);

        const userInfo = await api.getUserInfo(targetID);
        const money = (await Currencies.getData(targetID)).money || 0;
        const name = userInfo[targetID].name;

        const canvas = createCanvas(550, 900);
        const ctx = canvas.getContext("2d");

        // ১. টেকনোলজিক্যাল ব্যাকগ্রাউন্ড
        ctx.fillStyle = "#020005";
        ctx.fillRect(0, 0, 550, 900);
        
        // ডায়াগোনাল লাইন ইফেক্ট (Cyber Grid)
        ctx.strokeStyle = "rgba(0, 255, 255, 0.05)";
        ctx.lineWidth = 1;
        for (let i = 0; i < 900; i += 10) {
            ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(550, i + 200); ctx.stroke();
        }

        // ২. ডাবল লাইটিং ৩ডি ফ্রেম
        ctx.shadowBlur = 40;
        ctx.shadowColor = "#00ffff";
        ctx.strokeStyle = "#00ffff";
        ctx.lineWidth = 4;
        ctx.strokeRect(30, 30, 490, 840);
        
        ctx.shadowBlur = 20;
        ctx.shadowColor = "#ff00ff";
        ctx.strokeStyle = "#ff00ff";
        ctx.strokeRect(40, 40, 470, 820);

        // ৩. সাইবারনেটিক প্রোফাইল ফ্রেম (Triple Glow)
        const avatarUrl = `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa059ef6e40a7d7d563931e233`;
        let avatar;
        try { avatar = await loadImage(avatarUrl); } catch (e) { avatar = await loadImage("https://i.imgur.com/I3VsBEt.png"); }

        ctx.save();
        ctx.shadowBlur = 30;
        ctx.shadowColor = "#ff00ff";
        drawHexagon(ctx, 275, 180, 115);
        ctx.fillStyle = "#ff00ff";
        ctx.fill();
        ctx.clip();
        ctx.drawImage(avatar, 160, 65, 230, 230);
        ctx.restore();

        // ৪. নাম (Glitch Style Text)
        ctx.font = "bold 45px sans-serif";
        ctx.textAlign = "center";
        ctx.fillStyle = "#00ffff";
        ctx.fillText(name, 275, 360);
        ctx.fillStyle = "#fff";
        ctx.fillText(name, 272, 357); // Offset for 3D look

        // ৫. ইউনিক ডেটা স্লট (Future Boxes)
        const details = [
            ["USER ID", targetID, "#00ffff"],
            ["STATUS", "ACTIVE AGENT", "#00ff00"],
            ["CREDITS", "$" + money.toLocaleString(), "#ffaa00"],
            ["GENDER", userInfo[targetID].gender == 2 ? "MALE" : "FEMALE", "#ff00ff"]
        ];

        let yBase = 430;
        details.forEach(([label, value, color]) => {
            // স্ল্যাশ ডিজাইন বক্স
            ctx.fillStyle = "rgba(0, 255, 255, 0.1)";
            ctx.beginPath();
            ctx.moveTo(60, yBase);
            ctx.lineTo(490, yBase);
            ctx.lineTo(470, yBase + 60);
            ctx.lineTo(40, yBase + 60);
            ctx.closePath();
            ctx.fill();
            
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.textAlign = "left";
            ctx.font = "bold 18px sans-serif";
            ctx.fillStyle = color;
            ctx.fillText(label, 75, yBase + 35);

            ctx.textAlign = "right";
            ctx.font = "bold 22px sans-serif";
            ctx.fillStyle = "#fff";
            ctx.fillText(value, 450, yBase + 35);
            yBase += 85;
        });

        // ৬. স্ক্যানার বার কোড স্টাইল
        ctx.fillStyle = "#00ffff";
        for(let i=0; i<30; i++) {
            let h = Math.random() * 40;
            ctx.fillRect(60 + (i*14), 780, 8, h);
        }

        ctx.font = "bold 14px monospace";
        ctx.fillStyle = "#fff";
        ctx.textAlign = "center";
        ctx.fillText("ENCRYPTED ACCESS ONLY - SYSTEM V.5.0", 275, 850);

        const cacheDir = path.join(__dirname, "cache");
        if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);
        const pathImg = path.join(cacheDir, `spy_ultra_${targetID}.png`);
        
        fs.writeFileSync(pathImg, canvas.toBuffer());
        return api.sendMessage({ attachment: fs.createReadStream(pathImg) }, threadID, () => fs.unlinkSync(pathImg), messageID);

    } catch (e) {
        console.error(e);
        return api.sendMessage("❌ আল্ট্রা রেন্ডারিং এরর! মডিউল চেক করুন।", threadID, messageID);
    }
};
