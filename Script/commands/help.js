const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");

module.exports.config = {
    name: "help",
    version: "1.18",
    hasPermssion: 0,
    credits: "Md Hamim",
    description: "View command usage and list",
    commandCategory: "info",
    usages: "[empty | page | command name]",
    cooldowns: 5,
    envConfig: {
        autoUnsend: true,
        delayUnsend: 60
    }
};

module.exports.run = async function ({ api, event, args, Currencies, utils, Users, Threads }) {
    const { threadID, messageID } = event;
    const { commands } = global.client;
    const prefix = global.config.PREFIX;
    const doNotDelete = "〲MAYBE NX ";

    const commandName = (args[0] || "").toLowerCase();

    // ———————————————— LIST ALL COMMANDS ——————————————— //
    if (!commandName || !isNaN(commandName)) {
        const arrayInfo = [];
        const page = parseInt(commandName) || 1;
        const numberOfOnePage = 20;
        let msg = "";

        for (const [name, value] of commands) {
            arrayInfo.push({
                name: name,
                category: value.config.commandCategory.toLowerCase() || "no category"
            });
        }

        // Group by category
        const categories = {};
        arrayInfo.forEach(cmd => {
            if (!categories[cmd.category]) categories[cmd.category] = [];
            categories[cmd.category].push(cmd.name);
        });

        const allCategories = Object.keys(categories).sort();
        
        // Pagination logic for categories
        const totalPage = Math.ceil(allCategories.length / 5); // Show 5 categories per page
        if (page > totalPage) return api.sendMessage(`Page ${page} does not exist`, threadID);

        let helpMsg = `╭───────────⦿\n`;
        const start = (page - 1) * 5;
        const end = start + 5;

        for (let i = start; i < end && i < allCategories.length; i++) {
            const cat = allCategories[i];
            helpMsg += `╭──⦿ 【 ${cat.toUpperCase()} 】\n`;
            helpMsg += `✧${categories[cat].join(" ✧")}\n`;
            helpMsg += `╰────────⦿\n`;
        }

        helpMsg += `\n✪ Page [ ${page}/${totalPage} ]`;
        helpMsg += `\n│ 𝐓𝐨𝐭𝐚𝐥 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬: ${commands.size}`;
        helpMsg += `\n│ 𝐓𝐲𝐩𝐞 ${prefix}𝐡𝐞𝐥𝐩 <𝐩𝐚𝐠𝐞> 𝐭𝐨 𝐬𝐞𝐞 𝐦𝐨𝐫𝐞`;
        helpMsg += `\n│ 𝐓𝐲𝐩𝐞 ${prefix}𝐡𝐞𝐥𝐩 <𝐜𝐦𝐝> 𝐟𝐨𝐫 𝐝𝐞𝐭𝐚𝐢𝐥𝐬`;
        helpMsg += `\n✪──────⦿\n✪ ${doNotDelete}\n╰─────────────⦿`;

        return api.sendMessage(helpMsg, threadID, messageID);
    }

    // ————————————————— INFO SINGLE COMMAND ————————————————— //
    const command = commands.get(commandName);
    if (!command) {
        return api.sendMessage(`Command "${commandName}" does not exist.`, threadID, messageID);
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
