const axios = require("axios");

module.exports.config = {
    name: "dp", // Ekhane nam 'dp' kore deya holo
    aliases: ["cdp", "coupledp"],
    version: "3.3",
    hasPermssion: 0,
    credits: "Md Hamim",
    description: "Get random boy & girl matching couple DP",
    commandCategory: "love",
    usages: "[list]",
    cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID } = event;

    try {
        api.setMessageReaction("⏳", messageID, () => {}, true);

        const baseRes = await axios.get(
            "https://raw.githubusercontent.com/goatbotnx/Sexy-nx2.0Updated/refs/heads/main/nx-apis.json"
        );

        const cdpBase = baseRes.data.cdp;
        if (!cdpBase) {
            return api.setMessageReaction("❌", messageID, () => {}, true);
        }

        if (args[0] && args[0].toLowerCase() === "list") {
            const res = await axios.get(`${cdpBase}/cdp/list`);
            const { total_cdp } = res.data;

            api.setMessageReaction("✅", messageID, () => {}, true);
            return api.sendMessage(
                `📂 𝐂𝐨𝐮𝐩𝐥𝐞 𝐃𝐏 𝐋𝐢𝐛𝐫𝐚𝐫𝐲\n💑 𝐓𝐨𝐭𝐚𝐥 𝐏𝐚𝐢𝐫𝐬 : ${total_cdp}\n🌬️ 𝐑𝐞𝐚𝐝𝐲 𝐓𝐨 𝐔𝐬𝐞\n\n✨ 𝐓𝐲𝐩𝐞 : cdp`,
                threadID
            );
        }

        const res = await axios.get(`${cdpBase}/cdp`);
        const pair = res.data.pair;

        if (!pair || !pair.boy || !pair.girl) {
            return api.setMessageReaction("❌", messageID, () => {}, true);
        }

        const getStream = async (url) => {
            return (await axios.get(url, {
                responseType: "stream",
                headers: {
                    "User-Agent": "Mozilla/5.0",
                    Referer: "https://imgur.com/"
                }
            })).data;
        };

        const boyStream = await getStream(pair.boy);
        const girlStream = await getStream(pair.girl);

        return api.sendMessage({
            body: `🎀 h̷e̷r̷e̷ i̷s̷ y̷o̷u̷r̷ c̷d̷p̷ 🌬️\n💞 𝐁𝐨𝐲 & 𝐆𝐢𝐫𝐥 𝐏𝐚𝐢𝐫`,
            attachment: [boyStream, girlStream]
        }, threadID, () => api.setMessageReaction("✅", messageID, () => {}, true));

    } catch (err) {
        console.error("DP Error:", err);
        api.setMessageReaction("❌", messageID, () => {}, true);
    }
};
