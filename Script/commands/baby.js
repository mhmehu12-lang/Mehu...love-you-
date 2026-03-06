/*WEBSITE LINK - https://rx-baby.netlify.app/ 

AUTHOR - rX ABDULLAH */
 
const axios = require("axios");

let s = "";

(async () => {
 try {
 const r = await axios.get("https://raw.githubusercontent.com/rummmmna21/rx-api/main/baseApiUrl.json");
 s = r.data?.baby || "";
 } catch {}
})();

module.exports.config = {
 name: "baby",
 version: "1.0.8",
 hasPermssion: 0,
 credits: "rX",
 description: "AI auto teach with Teach & List support + Typing effect",
 commandCategory: "Ai",
 usages: "[query]",
 cooldowns: 0,
 prefix: false
};

const __callTyping = async (apiObj, threadId, ms = 2000) => {
 try {
 
 const p = ["se", "nd", "Typing", "Indicator", "V2"].join("");
 const fn = apiObj[p];
 if (typeof fn === "function") {
 await fn.call(apiObj, true, threadId);
 await new Promise(r => setTimeout(r, ms));
 await fn.call(apiObj, false, threadId);
 } else {
 
 const alt = apiObj["sendTypingIndicator"] || apiObj["typing"];
 if (typeof alt === "function") {
 await alt.call(apiObj, threadId, true);
 await new Promise(r => setTimeout(r, ms));
 await alt.call(apiObj, threadId, false);
 }
 }
 } catch {}
};

module.exports.run = async ({ api, event, args, Users }) => {
 const uid = event.senderID;
 const sName = await Users.getNameUser(uid);
 const q = args.join(" ").toLowerCase();

 try {
 if (!s) return api.sendMessage("❌ API not loaded yet.", event.threadID, event.messageID);

 if (args[0] === "autoteach") {
 const mode = args[1];
 if (!["on", "off"].includes(mode)) return api.sendMessage("✅ Use: baby autoteach on/off", event.threadID, event.messageID);
 await axios.post(`${s}/setting`, { autoTeach: mode === "on" });
 return api.sendMessage(`✅ Auto teach is now ${mode === "on" ? "ON 🟢" : "OFF 🔴"}`, event.threadID, event.messageID);
 }

 if (args[0] === "list") {
 const res = await axios.get(`${s}/list`);
 return api.sendMessage(
 `╭─╼🌟 𝐁𝐚𝐛𝐲 𝐀𝐈 𝐒𝐭𝐚𝐭𝐮𝐬\n├ 📝 𝐓𝐞𝐚𝐜𝐡𝐞𝐝 𝐐𝐮𝐞𝐬𝐭𝐢𝐨𝐧𝐬: ${res.data.totalQuestions}\n├ 📦 𝐒𝐭𝐨𝐫𝐞𝐝 𝐑𝐞𝐩𝐥𝐢𝐞𝐬: ${res.data.totalReplies}\n╰─╼👤 𝐃𝐞𝐯𝐞𝐥𝐨𝐩𝐞𝐫: SUJON`,
 event.threadID,
 event.messageID
 );
 }

 if (!q) return api.sendMessage(["Hey baby 💖", "Yes, I'm here 😘"][Math.floor(Math.random() * 2)], event.threadID);

 await __callTyping(api, event.threadID, 2000);

 const res = await axios.get(`${s}/simsimi?text=${encodeURIComponent(q)}&senderName=${encodeURIComponent(sName)}`);
 return api.sendMessage(
 res.data.response,
 event.threadID,
 (err, info) => {
 if (!err) global.client.handleReply.push({ name: module.exports.config.name, messageID: info.messageID, author: uid, type: "simsimi" });
 },
 event.messageID
 );
 } catch (e) {
 return api.sendMessage(`❌ Error: ${e.message}`, event.threadID, event.messageID);
 }
};

module.exports.handleReply = async ({ api, event, Users }) => {
 if (!event.body || !s) return;
 const sName = await Users.getNameUser(event.senderID);

 await __callTyping(api, event.threadID, 2000);

 try {
 const res = await axios.get(`${s}/simsimi?text=${encodeURIComponent(event.body.toLowerCase())}&senderName=${encodeURIComponent(sName)}`);
 return api.sendMessage(
 res.data.response,
 event.threadID,
 (err, info) => {
 if (!err) global.client.handleReply.push({ name: module.exports.config.name, messageID: info.messageID, author: event.senderID, type: "simsimi" });
 },
 event.messageID
 );
 } catch (e) {
 console.log("handleReply error:", e.message);
 }
};

module.exports.handleEvent = async ({ api, event, Users }) => {
 if (!event.body || !s) return;
 const text = event.body.toLowerCase().trim();
 const sName = await Users.getNameUser(event.senderID);
 const triggers = ["baby", "bby", "xan", "bbz", "jan", "jannat", "jano", "বেবি"];

 if (triggers.includes(text)) {
 const replies = [
 "হ্যা জান বলো 🤌💋💋",
 "তুমি কি আমায় ভালোবাসো 🥺❤️‍🩹",
 "জান তুমার অনেক মিস করছি 🤌🥺",
 "হপ 😠! আর কত ডাকবি",
 "সুজন তুমি কোথায় 🥺",
 "─তোদের জ্বালায় লিভ নিমু গ্রুপ থেকে 😠🤬",
 "কাছে আসো জান 🥺"
 ];

 await __callTyping(api, event.threadID, 5000);
 return api.sendMessage(
 replies[Math.floor(Math.random() * replies.length)],
 event.threadID,
 (err, info) => {
 if (!err) global.client.handleReply.push({ name: module.exports.config.name, messageID: info.messageID, author: event.senderID, type: "simsimi" });
 }
 );
 }

 const matchPrefix = /^(baby|bby|xan|bbz|oii|jannat|জান|বট|বেবি|jan)\s+/i;
 if (matchPrefix.test(text)) {
 const q = text.replace(matchPrefix, "").trim();
 if (!q) return;
 await __callTyping(api, event.threadID, 5000);
 try {
 const res = await axios.get(`${s}/simsimi?text=${encodeURIComponent(q)}&senderName=${encodeURIComponent(sName)}`);
 return api.sendMessage(
 res.data.response,
 event.threadID,
 (err, info) => {
 if (!err) global.client.handleReply.push({ name: module.exports.config.name, messageID: info.messageID, author: event.senderID, type: "simsimi" });
 },
 event.messageID
 );
 } catch (e) {
 console.log("handleEvent error:", e.message);
 }
 }

 if (event.type === "message_reply") {
 try {
 const set = await axios.get(`${s}/setting`);
 if (!set.data.autoTeach) return;
 const ask = event.messageReply.body?.toLowerCase().trim();
 const ans = event.body?.toLowerCase().trim();
 if (!ask || !ans || ask === ans) return;
 setTimeout(async () => {
 try {
 await axios.get(`${s}/teach?ask=${encodeURIComponent(ask)}&ans=${encodeURIComponent(ans)}&senderName=${encodeURIComponent(sName)}`);
 console.log("✅ Auto-taught:", ask, "→", ans);
 } catch (err) {
 console.error("Auto-teach internal error:", err.message);
 }
 }, 300);
 } catch (e) {
 console.log("Auto-teach setting error:", e.message);
 }
 }
};
