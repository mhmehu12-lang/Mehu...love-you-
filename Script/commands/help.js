const fs = require("fs-extra");

module.exports.config = {
    name: "help",
    version: "1.18",
    hasPermssion: 0,
    credits: "Md Hamim",
    description: "View all command list at once",
    commandCategory: "info",
    usages: "[empty | command name]",
    cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const { commands } = global.client;
    const prefix = global.config.PREFIX;
    const doNotDelete = "〲MAYBE NX ";

    const commandName = (args[0] || "").toLowerCase();

    // ———————————————— SHOW ALL COMMANDS AT ONCE ——————————————— //
    if (!commandName) {
        const categories = {};
        
        // কমান্ডগুলো ক্যাটাগরি অনুযায়ী সাজানো
        for (const [name, value] of commands) {
            const cat = value.config.commandCategory.toLowerCase() || "no category";
            if (!categories[cat]) categories[cat] = [];
            categories[cat].push(name);
        }

        let helpMsg = `╭───────────⦿\n`;
        helpMsg += `│ 𝐓𝐨𝐭𝐚𝐥 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬: ${commands.size}\n`;
        helpMsg += `╰─────────────⦿\n`;

        const allCategories = Object.keys(categories).sort();

        for (const cat of allCategories) {
            helpMsg += `╭──⦿ 【 ${cat.toUpperCase()} 】\n`;
            // কমান্ডগুলোর আগে স্টার সিম্বল যোগ করা
            helpMsg += `│ ✧ ${categories[cat].join(" ✧ ")}\n`;
            helpMsg += `╰────────⦿\n`;
        }

        helpMsg += `\n✪ 𝐔𝐬𝐚𝐠𝐞: ${prefix}help <cmd name>`;
        helpMsg += `\n✪ 𝐂𝐫𝐞𝐝𝐢𝐭: ${this.config.credits}`;
        helpMsg += `\n✪──────⦿\n✪ ${doNotDelete}\n╰─────────────⦿`;

        return api.sendMessage(helpMsg, threadID, messageID);
    }

    // ————————————————— INFO SINGLE COMMAND ————————————————— //
    const command = commands.get(commandName);
    if (!command) {
        return api.sendMessage(`❌ Command "${commandName}" does not exist.`, threadID, messageID);
    }

    const config = command.config;
    const roleText = config.hasPermssion == 0 ? "All users" : config.hasPermssion == 1 ? "Group administrators" : "Bot Admin";

    const detailMsg = `⦿────── NAME ──────⦿` +
        `\n✪ ${config.name.toUpperCase()}` +
        `\n✪▫INFO▫` +
        `\n✪ Description: ${config.description || "No description"}` +
        `\n✪ Category: ${config.commandCategory}` +
        `\n✪ Version: ${config.version || "1.0.0"}` +
        `\n✪ Role: ${roleText}` +
        `\n✪ Cooldown: ${config.cooldowns || 1}s` +
        `\n✪ Author: ${config.credits}` +
        `\n✪▫USAGE▫` +
        `\n» ${prefix}${config.name} ${config.usages || ""}` +
        `\n⦿─────────────────⦿`;

    return api.sendMessage(detailMsg, threadID, messageID);
};
