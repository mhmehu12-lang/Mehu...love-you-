const axios = require("axios");
const fs = require('fs-extra');
const path = require('path');
const MiraiStor = "https://goatstore.vercel.app"; // Market API

module.exports.config = {
    name: "miraistore",
    aliases: ["ms", "market", "cmdstore"],
    version: "1.0.0",
    hasPermssion: 2, // Admin only for safety
    credits: "Md Hamim",
    description: "Mirai Marketplace - Browse & Upload Commands",
    commandCategory: "Market",
    usages: "[page/search/show/upload/status/like]",
    cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
    const { threadID, messageID } = event;

    const sendBeautifulMessage = (content) => {
        const header = "╭──『 🏪 MiraiStore 』──╮\n";
        const footer = "\n╰──────────────╯";
        return api.sendMessage(header + content + footer, threadID, messageID);
    };

    try {
        if (!args[0]) {
            return sendBeautifulMessage(
                "\n" +
                `╭─❯ show <ID>\n├ 📦 Get command code\n\n` +
                `╭─❯ page <number>\n├ 📄 Browse commands\n\n` +
                `╭─❯ search <query>\n├ 🔍 Search commands\n\n` +
                `╭─❯ trending\n├ 🔥 View trending\n\n` +
                `╭─❯ status\n├ 📊 View statistics\n\n` +
                `╭─❯ like <ID>\n├ 💝 Like a command\n\n` +
                `╭─❯ upload <filename>\n├ ⬆️ Upload your file\n\n` +
                "💫 𝗧𝗶𝗽: `miraistore page 1` diye shuru korun"
            );
        }

        const command = args[0].toLowerCase();

        switch (command) {
            case "show": {
                const itemID = parseInt(args[1]);
                if (isNaN(itemID)) return sendBeautifulMessage("\n[⚠️] Valid ID din.");
                const response = await axios.get(`${MiraiStor}/api/item/${itemID}`);
                const item = response.data;
                const time = new Date(item.createdAt).toLocaleString('en-US', { timeZone: 'Asia/Dhaka' });

                return sendBeautifulMessage(
                    `\n👑 Name: ${item.itemName}\n🆔 ID: ${item.itemID}\n⚙️ Type: ${item.type || 'JS'}\n📝 Desc: ${item.description}\n👨‍💻 Author: ${item.authorName}\n📅 Added: ${time}\n👀 Views: ${item.views}\n💝 Likes: ${item.likes}\n🔗 Link: ${MiraiStor}/raw/${item.rawID}`
                );
            }

            case "page": {
                const page = parseInt(args[1]) || 1;
                const { data: { items, total } } = await axios.get(`${MiraiStor}/api/items?page=${page}&limit=5`);
                const totalPages = Math.ceil(total / 5);
                const itemsList = items.map((item, index) =>
                    `${index + 1}. 📦 ${item.itemName} (ID: ${item.itemID})\n👨‍💻 Author: ${item.authorName}\n`
                ).join("\n");
                return sendBeautifulMessage(`📄 Page ${page}/${totalPages}\n\n${itemsList}`);
            }

            case "search": {
                const query = args.slice(1).join(" ");
                if (!query) return sendBeautifulMessage("\n[⚠️] Search query din.");
                const { data } = await axios.get(`${MiraiStor}/api/items?search=${encodeURIComponent(query)}`);
                const results = data.items;
                if (!results.length) return sendBeautifulMessage("\n❌ Kichu pawa jayni.");
                const searchList = results.slice(0, 5).map((item, index) =>
                    `${index + 1}. 📦 ${item.itemName} (ID: ${item.itemID})`
                ).join("\n");
                return sendBeautifulMessage(`🔍 Search Result:\n\n${searchList}`);
            }

            case "status": {
                const { data: stats } = await axios.get(`${MiraiStor}/api/stats`);
                return sendBeautifulMessage(
                    `\n📦 Total Cmds: ${stats.totalCommands}\n💝 Total Likes: ${stats.totalLikes}\n👥 Daily Users: ${stats.dailyActiveUsers}\n\n💻 Node: ${stats.hosting.system.nodeVersion}\n🖥️ Platform: ${stats.hosting.system.platform}`
                );
            }

            case "upload": {
                const fileName = args[1];
                if (!fileName) return sendBeautifulMessage("\n[⚠️] File name din (e.g: lyrics)");
                const filePath = path.join(__dirname, `${fileName}.js`);
                if (!fs.existsSync(filePath)) return sendBeautifulMessage(`\n❌ File '${fileName}.js' pawa jayni.`);
                
                const code = fs.readFileSync(filePath, 'utf8');
                const uploadData = {
                    itemName: fileName,
                    description: "Uploaded from MiraiBot",
                    type: "Mirai",
                    code,
                    authorName: "Md Hamim"
                };
                const response = await axios.post(`${MiraiStor}/v1/paste`, uploadData);
                if (response.data.success) {
                    return sendBeautifulMessage(`✅ Uploaded!\n🆔 ID: ${response.data.itemID}\n🔗 Raw: ${response.data.link}`);
                }
                return sendBeautifulMessage("\n❌ Upload failed.");
            }

            default:
                return sendBeautifulMessage("\n[⚠️] Bhul command!");
        }
    } catch (err) {
        return sendBeautifulMessage("\n[⚠️] Server busy ba error!");
    }
};
