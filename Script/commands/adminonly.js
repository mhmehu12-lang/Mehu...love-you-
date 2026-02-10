const fs = require("fs-extra");
const path = __dirname + "/../../config.json";

module.exports.config = {
    name: "adminonly",
    version: "1.5.0",
    hasPermssion: 2, // Sudhu Bot Admin-ra eita on/off korte parbe
    credits: "Hamim",
    description: "Bot sudhu admin-ra use korbe naki sobai seta control korar jonno",
    commandCategory: "Owner",
    usages: "[on/off] ba [noti on/off]",
    cooldowns: 5
};

module.exports.run = async function({ api, event, args, client }) {
    const { threadID, messageID } = event;
    const config = JSON.parse(fs.readFileSync(path, "utf-8"));

    if (args[0] == "noti") {
        if (args[1] == "on") {
            config.adminOnly = true; // Mirai-te onek somoy adminOnly property thake
            // Note: Mirai-er version bhed-e config key change hote pare
            return api.sendMessage("✅ Admin-only mode-er notification on kora hoyeche.", threadID, messageID);
        } else if (args[1] == "off") {
            // Notification logic custom handle korte hoy Mirai-te
            return api.sendMessage("❌ Notification off kora hoyeche.", threadID, messageID);
        }
    }

    if (args[0] == "on") {
        config.adminOnly = true;
        fs.writeFileSync(path, JSON.stringify(config, null, 4));
        return api.sendMessage("✅ Mode: [ON] - Ekhon theke sudhu Admin-ra bot use korte parbe.", threadID, messageID);
    } 
    else if (args[0] == "off") {
        config.adminOnly = false;
        fs.writeFileSync(path, JSON.stringify(config, null, 4));
        return api.sendMessage("✅ Mode: [OFF] - Ekhon theke sobai bot use korte parbe.", threadID, messageID);
    } 
    else {
        return api.sendMessage("Syantax bhul! Use koro: adminonly [on/off]", threadID, messageID);
    }
};
