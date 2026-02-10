const fs = require("fs-extra");
const path = __dirname + "/../../config.json";

module.exports.config = {
    name: "adminonly",
    version: "1.6.0",
    hasPermssion: 2,
    credits: "Hamim",
    description: "Bot sudhu admin-ra use korte parbe",
    commandCategory: "Owner",
    usages: "[on/off]",
    cooldowns: 5
};

module.exports.onLoad = function () {
    const config = JSON.parse(fs.readFileSync(path, "utf-8"));
    if (typeof config.adminOnly == "undefined") {
        config.adminOnly = false;
        fs.writeFileSync(path, JSON.stringify(config, null, 4));
    }
};

module.exports.handleEvent = async function ({ api, event }) {
    const { threadID, messageID, senderID, body } = event;
    const config = JSON.parse(fs.readFileSync(path, "utf-8"));
    const adminIDs = global.config.ADMINBOT;

    // Jodi adminOnly ON thake ebong sender admin na hoy
    if (config.adminOnly && !adminIDs.includes(senderID) && body && body.startsWith(global.config.PREFIX)) {
        return api.sendMessage("⛔ Bot currently admin-only mode-e ache. Sudhu Hamim-er admin-ra command dite parbe.", threadID, messageID);
    }
};

module.exports.run = async function({ api, event, args }) {
    const { threadID, messageID } = event;
    const config = JSON.parse(fs.readFileSync(path, "utf-8"));

    if (args[0] == "on") {
        config.adminOnly = true;
        fs.writeFileSync(path, JSON.stringify(config, null, 4));
        return api.sendMessage("✅ Admin-only mode activated! Ekhon theke admin chara kew bot use korte parbe na.", threadID, messageID);
    } 
    else if (args[0] == "off") {
        config.adminOnly = false;
        fs.writeFileSync(path, JSON.stringify(config, null, 4));
        return api.sendMessage("🔓 Admin-only mode deactivated! Ekhon sobai bot use korte parbe.", threadID, messageID);
    } 
    else {
        return api.sendMessage("Syntax: adminonly [on/off]", threadID, messageID);
    }
};
