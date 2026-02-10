const fs = require("fs-extra");
const path = __dirname + "/../../config.json";

module.exports.config = {
    name: "adminonly",
    version: "1.7.0",
    hasPermssion: 2,
    credits: "Hamim",
    description: "Bot-er jekono activity sudhu admin-er jonno simito korbe",
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
    const { threadID, messageID, senderID, body, mentions } = event;
    const config = JSON.parse(fs.readFileSync(path, "utf-8"));
    const adminIDs = global.config.ADMINBOT;

    // Jodi AdminOnly ON thake ebong sender admin na hoy
    if (config.adminOnly && !adminIDs.includes(senderID)) {
        
        const botID = api.getCurrentUserID();
        const isMentioned = Object.keys(mentions).includes(botID);
        const isCommand = body && body.startsWith(global.config.PREFIX);

        // Jodi command dey ba bot-ke mention kore (dakle)
        if (isCommand || isMentioned) {
            return api.sendMessage("⛔ Hamim-er bot ekhon Private mode-e ache. Admin chara bot kono reply dibe na.", threadID, messageID);
        }
    }
};

module.exports.run = async function({ api, event, args }) {
    const { threadID, messageID } = event;
    const config = JSON.parse(fs.readFileSync(path, "utf-8"));

    if (args[0] == "on") {
        config.adminOnly = true;
        fs.writeFileSync(path, JSON.stringify(config, null, 4));
        return api.sendMessage("✅ Strict Admin-Only mode ON! Ekhon theke dakle ba command dileo bot admin chara kauke chinbe na.", threadID, messageID);
    } 
    else if (args[0] == "off") {
        config.adminOnly = false;
        fs.writeFileSync(path, JSON.stringify(config, null, 4));
        return api.sendMessage("🔓 Admin-only mode OFF! Ekhon sobai bot-er sathe kotha bolte parbe.", threadID, messageID);
    } 
    else {
        return api.sendMessage("Syntax: adminonly [on/off]", threadID, messageID);
    }
};
