module.exports.config = {
  name: "bestie",
  version: "7.3.2",
  hasPermssion: 0,
  credits: "Priyansh Rajput + Fix by GPT",
  description: "Get Pair From Mention",
  commandCategory: "png",
  usages: "[@mention]",
  cooldowns: 5,
  dependencies: {
    "axios": "",
    "fs-extra": "",
    "path": "",i
    "jimp": ""
  }
};

module.exports.onLoad = async function () {
  const fs = global.nodemodule["fs-extra"];
  const path = global.nodemodule["path"];

  const dir = path.join(__dirname, "cache", "canvas");
  const file = path.join(dir, "bestie.png");

  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  if (!fs.existsSync(file)) {
    const axios = global.nodemodule["axios"];
    const img = (await axios.get("https://i.imgur.com/dAxBwKy.jpg", {
      responseType: "arraybuffer"
    })).data;

    fs.writeFileSync(file, Buffer.from(img));
  }
};

async function makeImage({ one, two }) {
  const fs = global.nodemodule["fs-extra"];
  const path = global.nodemodule["path"];
  const axios = global.nodemodule["axios"];
  const jimp = global.nodemodule["jimp"];

  const dir = path.join(__dirname, "cache", "canvas");

  let bg = await jimp.read(path.join(dir, "bestie.png"));

  let out = path.join(dir, `bestie_${one}_${two}.png`);
  let av1 = path.join(dir, `avt1_${one}.png`);
  let av2 = path.join(dir, `avt2_${two}.png`);

  // ⚠️ FIXED: removed broken access token
  let img1 = (await axios.get(`https://graph.facebook.com/${one}/picture?width=512&height=512`, {
    responseType: "arraybuffer"
  })).data;

  let img2 = (await axios.get(`https://graph.facebook.com/${two}/picture?width=512&height=512`, {
    responseType: "arraybuffer"
  })).data;

  fs.writeFileSync(av1, Buffer.from(img1));
  fs.writeFileSync(av2, Buffer.from(img2));

  let c1 = await jimp.read(await circle(av1));
  let c2 = await jimp.read(await circle(av2));

  bg.composite(c1.resize(190, 190), 93, 111);
  bg.composite(c2.resize(190, 190), 434, 107);

  let buffer = await bg.getBufferAsync("image/png");
  fs.writeFileSync(out, buffer);

  fs.unlinkSync(av1);
  fs.unlinkSync(av2);

  return out;
}

async function circle(img) {
  const jimp = require("jimp");
  img = await jimp.read(img);
  img.circle();
  return await img.getBufferAsync("image/png");
}

module.exports.run = async function ({ event, api }) {
  const fs = global.nodemodule["fs-extra"];
  const mention = Object.keys(event.mentions);

  if (!mention[0]) {
    return api.sendMessage("⚠️ Please mention someone!", event.threadID, event.messageID);
  }

  const one = event.senderID;
  const two = mention[0];

  try {
    let imgPath = await makeImage({ one, two });

    api.sendMessage(
      {
        body: "💞 Bestie Pair Created Successfully!",
        attachment: fs.createReadStream(imgPath)
      },
      event.threadID,
      () => fs.unlinkSync(imgPath),
      event.messageID
    );
  } catch (e) {
    console.log(e);
    api.sendMessage("❌ Image create failed!", event.threadID, event.messageID);
  }
};
