module.exports.config = {
    name: "help",
    version: "1.18",
    hasPermssion: 0,
    credits: "Md Hamim",
    description: "View all commands",
    commandCategory: "info",
    usages: "[command name]",
    cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    
    // কমান্ড লিস্ট পাওয়ার সবচেয়ে নিরাপদ উপায়
    const allCommands = Array.from(global.client.commands.values());
    const prefix = global.config.PREFIX || "-";
    const botAdminName = "𝐌𝐝 𝐇𝐚𝐦𝐢𝐦";
    const doNotDelete = "〲MAYBE NX ";

    const input = (args[0] || "").toLowerCase();

    // ———————————————— ALL COMMANDS LIST ——————————————— //
    if (!input || !isNaN(input)) {
        const categories = {};
        
        allCommands.forEach(cmd => {
            const cat = (cmd.config.commandCategory || "General").toLowerCase();
            if (!categories[cat]) categories[cat] = [];
            categories[cat].push(cmd.config.name);
        });

        let helpMsg = `╭───────────⦿\n`;
        helpMsg += `│ 𝐓𝐨𝐭𝐚𝐥 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬: ${allCommands.length}\n`;
        helpMsg += `╰─────────────⦿\n`;

        const sortedCats = Object.keys(categories).sort();

        for (const cat of sortedCats) {
            helpMsg += `╭──⦿ 【 ${cat.toUpperCase()} 】\n`;
            helpMsg += `│ ✧ ${categories[cat].join(" ✧ ")}\n`;
            helpMsg += `╰────────⦿\n`;
        }

        helpMsg += `\n✪ 𝐔𝐬𝐚𝐠𝐞: ${prefix}help <cmd name>`;
        helpMsg += `\n✪ 𝐁𝐨𝐭 𝐀𝐝𝐦𝐢𝐧: ${botAdminName}`;
        helpMsg += `\n✪──────⦿\n✪ ${doNotDelete}\n╰─────────────⦿`;

        return api.sendMessage(helpMsg, threadID, messageID);
    }

    // ————————————————— SINGLE COMMAND INFO ————————————————— //
    const command = global.client.commands.get(input);
    if (!command) {
        return api.sendMessage(`❌ কমান্ডটি খুঁজে পাওয়া যায়নি!`, threadID, messageID);
    }

    const config = command.config;
    const role = config.hasPermssion == 0 ? "All users" : config.hasPermssion == 1 ? "Group Admin" : "Bot Admin";

    const detailMsg = `⦿────── NAME ──────⦿` +
        `\n✪ ${config.name.toUpperCase()}` +
        `\n✪▫INFO▫` +
        `\n✪ Description: ${config.description || "No info"}` +
        `\n✪ Category: ${config.commandCategory}` +
        `\n✪ Role: ${role}` +
        `\n✪ Cooldown: ${config.cooldowns || 5}s` +
        `\n✪ Bot Admin: ${botAdminName}` +
        `\n✪▫USAGE▫` +
        `\n» ${prefix}${config.name} ${config.usages || ""}` +
        `\n⦿─────────────────⦿`;

    return api.sendMessage(detailMsg, threadID, messageID);
};
