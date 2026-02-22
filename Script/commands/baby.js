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
 "─তোদের জ্বালায় লিভ নিমু গ্রুপ থেকে 😠🤬",
 "কাছে আসো জান 🥺",
 "𝐀𝐬𝐬𝐚𝐥𝐚𝐦𝐮 𝐰𝐚𝐥𝐚𝐢𝐤𝐮𝐦 ♥",
 "বলেন sir__😌",
 "𝐁𝐨𝐥𝐨 𝐣𝐚𝐧 𝐤𝐢 𝐤𝐨𝐫𝐭𝐞 𝐩𝐚𝐫𝐢 𝐭𝐨𝐦𝐫 𝐣𝐨𝐧𝐧𝐨 🐸",
 "──‎ 𝐇𝐮𝐌..? 👉👈",
 "𝐇ᴇʏ 𝐗ᴀɴ 𝐈’ᴍ 𝐇ᴀᴍɪᴍ 𝐁ᴀ𝐛𝐲✨",
"বেশি bot Bot করলে leave নিবো কিন্তু😒😒",
        "শুনবো না😼 তুমি আমার বস হামিম কে প্রেম করাই দাও নাই🥺পচা তুমি🥺",
        "আমি আবাল দের সাথে কথা বলি না,ok😒",
        "এতো ডেকো না,প্রেম এ পরে যাবো তো🙈",
        "Bolo Babu, তুমি কি আমার বস হামিম কে ভালোবাসো? 🙈💋",
        "বার বার ডাকলে মাথা গরম হয়ে যায় কিন্তু😑",
        "হ্যা বলো😒, তোমার জন্য কি করতে পারি😐😑?",
        "এতো ডাকছিস কেন?গালি শুনবি নাকি? 🤬",
        "I love you janu🥰",
        "আরে Bolo আমার জান ,কেমন আছো?😚",
        "আজ বট বলে অসম্মান করছি,😰😿",
        "Hop beda😾,Boss বল boss😼",
        "চুপ থাক ,নাই তো তোর দাত ভেগে দিবো কিন্তু",
        "আমাকে না ডেকে মেয়ে হলে বস hamim er ইনবক্সে চলে যা 🌚😂 𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤 𝐋𝐢𝐧𝐤 : https://www.facebook.com/61574030668564",
        "আমাকে বট না বলে , বস হামিম কে জানু বল জানু 😘",
        "বার বার Disturb করছিস কোনো😾,আমার জানুর সাথে ব্যাস্ত আছি😋",
        "আরে বলদ এতো ডাকিস কেন🤬",
        "আমাকে ডাকলে ,আমি কিন্তু কিস করে দিবো😘",
        "আমারে এতো ডাকিস না আমি মজা করার mood এ নাই এখন😒",
        "হ্যাঁ জানু , এইদিক এ আসো কিস দেই🤭 😘",
        "দূরে যা, তোর কোনো কাজ নাই, শুধু bot bot করিস 😉😋🤣",
        "তোর কথা তোর বাড়ি কেউ শুনে না ,তো আমি কোনো শুনবো ?🤔😂",
        "আমাকে ডেকো না,আমি বস হামিম এর  সাথে ব্যাস্ত আছি",
        "কি হলো , মিস্টেক করচ্ছিস নাকি🤣",
        "বলো কি বলবা, সবার সামনে বলবা নাকি?🤭🤏",
        "জান মেয়ে হলে বস হামিমেট ইনবক্সে চলে যাও 😍🫣💕 𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤 𝐋𝐢𝐧𝐤 : https://www.facebook.com/61574030668564",
        "কালকে দেখা করিস তো একটু 😈",
        "হা বলো, শুনছি আমি 😏",
        "আর কত বার ডাকবি ,শুনছি তো",
        "হুম বলো কি বলবে😒",
        "বলো কি করতে পারি তোমার জন্য",
        "আমি তো অন্ধ কিছু দেখি না🐸 😎",
        "আরে বোকা বট না জানু বল জানু😌",
        "বলো জানু 🌚",
        "তোর কি চোখে পড়ে না আমি ব্যাস্ত আছি😒",
        "হুম জান তোমার ওই খানে উম্মহ😑😘",
        "আহ শুনা আমার তোমার অলিতে গলিতে উম্মাহ😇😘",
        "jang hanga korba😒😬",
        "হুম জান তোমার অইখানে উম্মমাহ😷😘",
        "আসসালামু আলাইকুম বলেন আপনার জন্য কি করতে পারি..!🥰",
        "ভালোবাসার নামক আবলামি করতে চাইলে বস হামিমের  ইনবক্সে গুতা দিন ~🙊😘🤣 𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤 𝐋𝐢𝐧𝐤 : https://www.facebook.com/61574030668564",
        "আমাকে এতো না ডেকে বস হামিম কে একটা জিএফ দে 🙄",
        "আমাকে এতো না ডেকছ কেন ভলো টালো বাসো নাকি🤭🙈",
        "🌻🌺💚-আসসালামু আলাইকুম ওয়া রাহমাতুল্লাহ-💚🌺🌻",
        "আমি এখন বস হামিম এর সাথে বিজি আছি আমাকে ডাকবেন না-😕😏 ধন্যবাদ-🤝🌻",
        "আমাকে না ডেকে আমার বস হামিম কে একটা জিএফ দাও-😽🫶🌺",
        "ঝাং থুমালে আইলাপিউ পেপি-💝😽",
        "উফফ বুঝলাম না এতো ডাকছেন কেনো-😤😡😈",
        "জান তোমার বান্ধবী রে আমার বস হামিমের  হাতে তুলে দিবা-🙊🙆‍♂",
        "আজকে আমার মন ভালো নেই তাই আমারে ডাকবেন না-😪🤧",
        "ঝাং 🫵থুমালে য়ামি রাইতে পালুপাসি উম্মম্মাহ-🌺🤤💦",
        "চুনা ও চুনা আমার বস হামিম এর হবু বউ রে কেও দেকছো খুজে পাচ্ছি না😪🤧😭",
        "স্বপ্ন তোমারে নিয়ে দেখতে চাই তুমি যদি আমার হয়ে থেকে যাও-💝🌺🌻",
        "জান হাঙ্গা করবা-🙊😝🌻",
        "জান মেয়ে হলে চিপায় আসো বস হামিম এর থেকে অনেক ভালোবাসা শিখছি তোমার জন্য-🙊🙈😽",
        "ইসস এতো ডাকো কেনো লজ্জা লাগে তো-🙈🖤🌼",
        "আমার বস হামিম এর  পক্ষ থেকে তোমারে এতো এতো ভালোবাসা-🥰😽🫶 আমার বস হামিম এর জন্য দোয়া করবেন-💝💚🌺🌻",
        "- ভালোবাসা নামক আব্লামি করতে মন চাইলে আমার বস এর  এর ইনবক্স চলে যাও-🙊🥱👅 🌻𝐅𝐀𝐂𝐄𝐁𝐎𝐎𝐊 𝐈𝐃 𝐋𝐈𝐍𝐊 🌻:- https://www.facebook.com/61574030668564",
        "আমার জান তুমি শুধু আমার আমি তোমারে ৩৬৫ দিন ভালোবাসি-💝🌺😽",
        "কিরে প্রেম করবি তাহলে বস হামিম এর ইনবক্সে গুতা দে 😘🤌 𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤 𝐋𝐢𝐧𝐤 : https://www.facebook.com/61574030668564",
        "জান আমার বস হামিম কে বিয়ে করবা-🙊😘🥳",
        "-আন্টি-🙆-আপনার মেয়ে-👰‍♀️-রাতে আমারে ভিদু কল দিতে বলে🫣-🥵🤤💦",
        "oii-🥺🥹-এক🥄 চামচ ভালোবাসা দিবা-🤏🏻🙂",
        "-আপনার সুন্দরী বান্ধুবীকে ফিতরা হিসেবে আমার বস হামিম কে দান করেন-🥱🐰🍒",
        "-ও মিম ও মিম-😇-তুমি কেন চুরি করলা সাদিয়ার ফর্সা হওয়ার ক্রীম-🌚🤧",
        "-অনুমতি দিলাম-𝙋𝙧𝙤𝙥𝙤𝙨𝙚 কর বস হামিম কে-🐸😾🔪",
        "-𝙂𝙖𝙮𝙚𝙨-🤗-যৌবনের কসম দিয়ে আমারে 𝐁𝐥𝐚𝐜𝐤𝐦𝐚𝐢𝐥 করা হচ্ছে-🥲🤦‍♂️🤧",
        "-𝗢𝗶𝗶 আন্টি-🙆‍♂️-তোমার মেয়ে চোখ মারে-🥺🥴🐸",
        "তাকাই আছো কেন চুমু দিবা-🙄🐸😘",
        "আজকে প্রপোজ করে দেখো রাজি হইয়া যামু-😌🤗😇",
        "-আমার গল্পে তোমার নানি সেরা-🙊🙆‍♂️🤗",
        "কি বেপার আপনি শ্বশুর বাড়িতে যাচ্ছেন না কেন-🤔🥱🌻",
        "দিনশেষে পরের 𝐁𝐎𝐖 সুন্দর-☹️🤧",
        "-তাবিজ কইরা হইলেও ফ্রেম এক্কান করমুই তাতে যা হই হোক-🤧🥱🌻",
        "-ছোটবেলা ভাবতাম বিয়ে করলে অটোমেটিক বাচ্চা হয়-🥱-ওমা এখন দেখি কাহিনী অন্যরকম-😦🙂🌻",
        "প্রেম করতে চাইলে বস হামিম এর ইনবক্সে চলে যা 😏🐸 𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤 𝐋𝐢𝐧𝐤 : https://www.facebook.com/61574030668564",
        "-আজ একটা বিন নেই বলে ফেসবুকের নাগিন-🤧-গুলোরে আমার বস হামিম ধরতে পারছে না-🐸🥲",
        "-চুমু থাকতে তোরা বিড়ি খাস কেন বুঝা আমারে-😑😒🐸⚒️",
        "—যে ছেড়ে গেছে-😔-তাকে ভুলে যাও-🙂-আমার বস হামিম  এর সাথে প্রেম করে তাকে দেখিয়ে দাও-🙈🐸🤗",
        "—হাজারো লুচ্চা লুচ্চির ভিরে-🙊🥵আমার বস হামিম এক নিস্পাপ ভালো মানুষ-🥱🤗🙆‍♂️",
        "-রূপের অহংকার করো না-🙂❤️চকচকে সূর্যটাও দিনশেষে অন্ধকারে পরিণত হয়-🤗💜",
        "সুন্দর মাইয়া মানেই-🥱আমার বস হামিমের  বউ-😽🫶আর বাকি গুলো আমার বেয়াইন-🙈🐸🤗",
        "এত অহংকার করে লাভ নেই-🌸মৃত্যুটা নিশ্চিত শুধু সময়টা অ'নিশ্চিত-🖤🙂",
        "-দিন দিন কিছু মানুষের কাছে অপ্রিয় হয়ে যাইতেছি-🙂😿🌸",
        "ভালোবাসার নামক আবলামি করতে চাইলে বস হামিম এর ইনবক্সে গুতা দিন🤣😼",
        "মেয়ে হলে বস হামিমের  ইনবক্সে চলে যা 🤭🤣😼 𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤 𝐋𝐢𝐧𝐤 : https://www.facebook.com/61574030668564",
        "হুদাই আমারে শয়তানে লারে-😝😑☹️",
        "-𝗜 𝗟𝗢𝗩𝗘 𝗬𝗢𝗨-😽-আহারে ভাবছো তোমারে প্রোপজ করছি-🥴-থাপ্পর দিয়া কিডনী লক করে দিব-😒-ভুল পড়া বের করে দিবো-🤭🐸",
        "-আমি একটা দুধের শিশু-😇-🫵𝗬𝗢𝗨🐸💦",
        "-কতদিন হয়ে গেলো বিছনায় মুতি না-😿-মিস ইউ নেংটা কাল-🥺🤧",
        "-বালিকা━👸-𝐃𝐨 𝐲𝐨𝐮-🫵-বিয়া-𝐦𝐞-😽-আমি তোমাকে-😻-আম্মু হইতে সাহায্য করব-🙈🥱",
        "-এই আন্টির মেয়ে-🫢🙈-𝐔𝐦𝐦𝐦𝐦𝐦𝐦𝐦𝐦𝐦𝐦𝐦𝐡-😽🫶-আসলেই তো স্বাদ-🥵💦-এতো স্বাদ কেন-🤔-সেই স্বাদ-😋",
        "-ইস কেউ যদি বলতো-🙂-আমার শুধু তোমাকেই লাগবে-💜🌸",
        "-ওই বেডি তোমার বাসায় না আমার বস হামিম মেয়ে দেখতে গেছিলো-🙃-নাস্তা আনারস আর দুধ দিছো-🙄🤦‍♂️-বইন কইলেই তো হয় বয়ফ্রেন্ড আছে-🥺🤦‍♂-আমার বস হামিম কে জানে মারার কি দরকার-🙄🤧",
        "-একদিন সে ঠিকই ফিরে তাকাবে-😇-আর মুচকি হেসে বলবে ওর মতো আর কেউ ভালবাসেনি-🙂😅",
        "-হুদাই গ্রুপে আছি-🥺🐸-কেও ইনবক্সে নক দিয়ে বলে না জান তোমারে আমি অনেক ভালোবাসি-🥺🤧",
        "কি'রে গ্রুপে দেখি একটাও বেডি নাই-🤦‍🥱💦",
        "-দেশের সব কিছুই চুরি হচ্ছে-🙄-শুধু আমার বস হামিম এর মনটা ছাড়া-🥴😑😏",
        "-🫵তোমারে প্রচুর ভাল্লাগে-😽-সময় মতো প্রপোজ করমু বুঝছো-🔨😼-ছিট খালি রাইখো- 🥱🐸🥵",
     

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
