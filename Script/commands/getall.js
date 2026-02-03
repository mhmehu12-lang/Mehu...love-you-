const fs = require('fs-extra');
const path = require('path');
const AdmZip = require('adm-zip');

module.exports.config = {
    name: "getall",
    version: "1.0.0",
    hasPermssion: 2, // Shudhu Bot Admin-er jonno
    credits: "Md Hamim",
    description: "Bot-er shobgulo command file code shoho zip kore pathabe",
    commandCategory: "admin",
    usages: "",
    cooldowns: 20
};

module.exports.run = async ({ api, event }) => {
    const { threadID, messageID } = event;
    const zip = new AdmZip();
    const commandPath = path.join(__dirname); 
    const zipPath = path.join(__dirname, 'cache', 'all_commands_backup.zip');

    try {
        // Cache folder check
        if (!fs.existsSync(path.join(__dirname, 'cache'))) {
            fs.mkdirSync(path.join(__dirname, 'cache'));
        }

        api.sendMessage("⏳ Hamim, shob code pack kora hochhe... Opekkha korun.", threadID, messageID);

        // Commands folder-er shob .js file zip-e add kora
        const files = fs.readdirSync(commandPath).filter(file => file.endsWith('.js'));
        
        files.forEach(file => {
            const filePath = path.join(commandPath, file);
            zip.addLocalFile(filePath);
        });

        // Zip file-ti save kora
        zip.writeZip(zipPath);

        // Messenger-e zip file pathano
        return api.sendMessage({
            body: `✅ Md Hamim, apnar bot-er shob code ekhane ache!\n\n📂 Total Files: ${files.length}`,
            attachment: fs.createReadStream(zipPath)
        }, threadID, () => {
            // Pathano hoye gele cache file delete kora
            if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
        }, messageID);

    } catch (err) {
        console.error(err);
        return api.sendMessage("❌ Error: Code pack korte somoshya hoyeche.", threadID, messageID);
    }
};
