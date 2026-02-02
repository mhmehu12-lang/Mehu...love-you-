module.exports.config = {
  name: "adminonly",
  version: "1.0.0",
  hasPermssion: 2, // Shudhu bot admin ra eta on/off korte parbe
  credits: "NTKhang",
  description: "Turn on/off admin only mode",
  commandCategory: "config",
  usages: "[on/off]",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const fs = require("fs");
  const path = require("path");

  // Mirai-er global config file path
  const configPath = path.join(__dirname, "../../config.json");
  const configData = JSON.parse(fs.readFileSync(configPath, "utf-8"));

  if (args[0] == "on") {
    configData.adminOnly = true;
    fs.writeFileSync(configPath, JSON.stringify(configData, null, 4));
    return api.sendMessage("✅ Turned on Admin Only mode. Now only admins can use the bot.", threadID, messageID);
  } 
  else if (args[0] == "off") {
    configData.adminOnly = false;
    fs.writeFileSync(configPath, JSON.stringify(configData, null, 4));
    return api.sendMessage("❌ Turned off Admin Only mode. Everyone can use the bot now.", threadID, messageID);
  } 
  else {
    return api.sendMessage("Usage: adminonly [on/off]", threadID, messageID);
  }
};
