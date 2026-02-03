module.exports.config = {
    name: "help",
    version: "2.5.0",
    hasPermssion: 0,
    credits: "Md Hamim",
    description: "Shob command alada category-te premium look-e dekhabe",
    commandCategory: "system",
    usages: "[command name]",
    cooldowns: 5
};

module.exports.run = async function ({ api, event, args, Commands }) {
    const { threadID, messageID } = event;
    const prefix = "-"; // Ekhane apnar bot-er prefix check kore niben

    // 1. Shudhu /help likhle shob command category onusare dekhabe
    if (!args[0]) {
        const commandList = Array.from(Commands.values());
        const categories = {};

        // Category wise sorting
        commandList.forEach(cmd => {
            const cat = (cmd.config.commandCategory || "General").toLowerCase();
            if (!categories[cat]) categories[cat] = [];
            categories[cat].push(cmd.config.name);
        });

        let msg = "╭───『 𝐌𝐃 𝐇𝐀𝐌𝐈𝐌 𝐁𝐎𝐓 』───╮\n";
        msg += "  🛡️ Professional Security & Fun\n";
        msg += "╰───────────────────╯\n\n";
        
        for (const cat in categories) {
            msg += `💎 【 ${cat.toUpperCase()} 】\n`;
            msg += `» ${categories[cat].join(" • ")}\n\n`;
        }

        msg += `──────────────────\n`;
        msg += `📊 Total Commands: ${commandList.length}\n`;
        msg += `📝 Type "${prefix}help [command]" to know more!`;
        
        return api.sendMessage(msg, threadID, messageID);
    }

    // 2. Nirdishto command-er details (e.g: /help dp)
    const cmdName = args[0].toLowerCase();
    const command = Commands.get(cmdName);

    if (!command) return api.sendMessage(`❌ "${cmdName}" namer kono command pawa jayni!`, threadID, messageID);

    const { name, version, credits, description, usages, commandCategory, cooldowns } = command.config;

    let detailMsg = `╭───『 📋 𝐂𝐌𝐃 𝐃𝐄𝐓𝐀𝐈𝐋𝐒 』───╮\n\n`;
    detailMsg += `📌 𝐍𝐚𝐦𝐞: ${name}\n`;
    detailMsg += `📁 𝐂𝐚𝐭𝐞𝐠𝐨𝐫𝐲: ${commandCategory}\n`;
    detailMsg += `📖 𝐃𝐞𝐬𝐜: ${description}\n`;
    detailMsg += `🎮 𝐔𝐬𝐚𝐠𝐞: ${prefix}${name} ${usages}\n`;
    detailMsg += `⏳ 𝐂𝐨𝐨𝐥𝐝𝐨𝐰𝐧: ${cooldowns}s\n`;
    detailMsg += `👤 𝐂𝐫𝐞𝐝𝐢𝐭𝐬: ${credits}\n`;
    detailMsg += `✨ 𝐕𝐞𝐫𝐬𝐢𝐨𝐧: ${version}\n\n`;
    detailMsg += `╰──────────────────╯`;

    return api.sendMessage(detailMsg, threadID, messageID);
};
