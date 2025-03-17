"use strict";

const { makeInMemoryStore, fetchLatestBaileysVersion, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const pino = require("pino");
const fs = require("fs-extra");
const path = require("path");
const conf = require("./set");
const session = conf.session.replace(/LUCKY-MD;;;=>/g, "");
require("dotenv").config({ path: "./config.env" });

let auto_reply_message = "Hello, my owner is unavailable. Kindly leave a message.";

async function authentification() {
  try {
    if (!fs.existsSync(__dirname + "/auth/creds.json")) {
      console.log("Connected successfully...");
      await fs.writeFileSync(__dirname + "/auth/creds.json", atob(session), "utf8");
    } else if (fs.existsSync(__dirname + "/auth/creds.json") && session !== "zokk") {
      await fs.writeFileSync(__dirname + "/auth/creds.json", atob(session), "utf8");
    }
  } catch (e) {
    console.log("eyJub2lzZUtleSI6eyJwcml2YXRlIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoiR0dJdW1FcDBpc3ZWYXk4V3dvbEM5YUFVSEQrS1hHOUtzS3YrMkdCNlAybz0ifSwicHVibGljIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoiVlFUWjNiVUg2WERzU2MzbE9tNmswY2h4cE9ldHFLRENQRm5VSmFXb3lVWT0ifX0sInBhaXJpbmdFcGhlbWVyYWxLZXlQYWlyIjp7InByaXZhdGUiOnsidHlwZSI6IkJ1ZmZlciIsImRhdGEiOiJ1T1NUUEF3aDNSMndPdFVRbHQxekZqbzV0UzNKVkdXL1ZmY3ltMTZKd0U4PSJ9LCJwdWJsaWMiOnsidHlwZSI6IkJ1ZmZlciIsImRhdGEiOiJQL0g2T1VvYlVsNW1RSFBNT1FQZ0ZacVQ3b002bG5PY2V3bWxkVXZrM1N3PSJ9fSwic2lnbmVkSWRlbnRpdHlLZXkiOnsicHJpdmF0ZSI6eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6IjRBY1pXK3FpUmpPOEpHMVBVZnd0SndtUUtoMHpqZWV5NW0xbWdzWUFLMlU9In0sInB1YmxpYyI6eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6IjV0d2xxdEVscVRsMmZKTngvZ25NYm1LekpXeUhNcEVBSXVNdjlEdTB6MTg9In19LCJzaWduZWRQcmVLZXkiOnsia2V5UGFpciI6eyJwcml2YXRlIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoiRUdBSnNwL2YzUGg0K3lYWnF3TTZvZmNBaTFESU1LcDQ4VTNIZ1lIMXUwQT0ifSwicHVibGljIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoiQlR1OW5DbmtidEVEMG5wSDFjVU1aWUdCNDVPWUROZWcvaEtXdEtzNUZ5dz0ifX0sInNpZ25hdHVyZSI6eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6IlUzdFJvZytob2ZoUmMrOTlnMDFIK25VNzA3dGNLdjVFVzF4aWRaZ29Yb3pudVU3TXJXQXlwclErNWtRRkJXK251MWoyVVBQSDVvU3NNQkJGYkFGWkF3PT0ifSwia2V5SWQiOjF9LCJyZWdpc3RyYXRpb25JZCI6NTAsImFkdlNlY3JldEtleSI6ImpaME94dFlLcm9aVE81WHpwSXhjK1ZnbG5EL1ViQ1d1Y04wbXNlT1VtVVE9IiwicHJvY2Vzc2VkSGlzdG9yeU1lc3NhZ2VzIjpbXSwibmV4dFByZUtleUlkIjozMSwiZmlyc3RVbnVwbG9hZGVkUHJlS2V5SWQiOjMxLCJhY2NvdW50U3luY0NvdW50ZXIiOjAsImFjY291bnRTZXR0aW5ncyI6eyJ1bmFyY2hpdmVDaGF0cyI6ZmFsc2V9LCJkZXZpY2VJZCI6Im01b1YyUTJ3VDVhcGE4QkhrS1Q0ZXciLCJwaG9uZUlkIjoiODM1OWE2ZGUtYjM1Ny00NzA4LWI4NGMtZjJkYzhkOTMzNGUzIiwiaWRlbnRpdHlJZCI6eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6Ii9SaDhBeWNvVmVBYklBd0w2bE5wYXoxR1pnOD0ifSwicmVnaXN0ZXJlZCI6dHJ1ZSwiYmFja3VwVG9rZW4iOnsidHlwZSI6IkJ1ZmZlciIsImRhdGEiOiJjUzZoRUZQWWwvZ3FPckUrMUhocmI5aXFtdUk9In0sInJlZ2lzdHJhdGlvbiI6e30sInBhaXJpbmdDb2RlIjoiN0VSQVZUUlciLCJtZSI6eyJpZCI6IjI1NDc4Mjc2MDUwMDoxMUBzLndoYXRzYXBwLm5ldCIsIm5hbWUiOiJCYm95IEJhcm9zIn0sImFjY291bnQiOnsiZGV0YWlscyI6IkNMNlBnYzhHRU5qVzNiNEdHQWNnQUNnQSIsImFjY291bnRTaWduYXR1cmVLZXkiOiJaWXpoYVBuUnhkWDhIL2Y1WEI5ekhtUGl2TEphUHAvK0FMZjE0enl5ZWk4PSIsImFjY291bnRTaWduYXR1cmUiOiJTV2g5OGNSdFZ0K2p4ZXZCMTVyVEthMjV0SlR1QStPeURJeTJFcUNwTEh2Y2ZrcE43dENqVHlPME5SRkZITThEQVBMbGlPT282Z1FadnFDZi81OEVDUT09IiwiZGV2aWNlU2lnbmF0dXJlIjoiVHlKNDk3OUpmMm1DcWhVcXFQNHRZVWZCTU1GQVJLUjJNbHoyQjdsbEJFYnRaQmppYzlwQzNOQnFlbm53aG96OTJwTWp6ZS9pUmIxeTRlWkdGMlFHQ2c9PSJ9LCJzaWduYWxJZGVudGl0aWVzIjpbeyJpZGVudGlmaWVyIjp7Im5hbWUiOiIyNTQ3ODI3NjA1MDA6MTFAcy53aGF0c2FwcC5uZXQiLCJkZXZpY2VJZCI6MH0sImlkZW50aWZpZXJLZXkiOnsidHlwZSI6IkJ1ZmZlciIsImRhdGEiOiJCV1dNNFdqNTBjWFYvQi8zK1Z3ZmN4NWo0cnl5V2o2Zi9nQzM5ZU04c25vdiJ9fV0sInBsYXRmb3JtIjoic21iYSIsImxhc3RBY2NvdW50U3luY1RpbWVzdGFtcCI6MTc0MjE3MDk4MX0= " + e);
  }
}
authentification();

const store = makeInMemoryStore({
  logger: pino().child({ level: "silent", stream: "store" })
});

setTimeout(() => {
  async function main() {
    const { version } = await fetchLatestBaileysVersion();
    const { state, saveCreds } = await useMultiFileAuthState(__dirname + "/auth");

    const sockOptions = {
      version,
      logger: pino({ level: "silent" }),
      browser: ['LUCKY-MD', "safari", "1.0.0"],
      printQRInTerminal: true,
      fireInitQueries: false,
      shouldSyncHistoryMessage: true,
      downloadHistory: true,
      syncFullHistory: true,
      generateHighQualityLinkPreview: true,
      markOnlineOnConnect: false,
      keepAliveIntervalMs: 30_000,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, logger)
      },
      getMessage: async (key) => {
        if (store) {
          const msg = await store.loadMessage(key.remoteJid, key.id, undefined);
          return msg.message || undefined;
        }
        return { conversation: 'An Error Occurred, Repeat Command!' };
      }
    };

    const zk = require("@whiskeysockets/baileys")(sockOptions);
    store.bind(zk.ev);
    setInterval(() => {
      store.writeToFile("store.json");
    }, 3000);

    zk.ev.on("call", async (callData) => {
      if (conf.ANTI_CALL === 'yes') {
        const callId = callData[0].id;
        const callerId = callData[0].from;
        await zk.rejectCall(callId, callerId);
        await zk.sendMessage(callerId, {
          text: "❗📵I AM LUCKY MD | I REJECT THIS CALL BECAUSE MY OWNER IS NOT AVAILABLE FOR NOW. KINDLY SEND MESSAGE RIGHT NOW."
        });
      }
    });

    zk.ev.on("messages.upsert", async (m) => {
      const { messages } = m;
      const ms = messages[0];
      if (!ms.message) return;

      const messageKey = ms.key;
      const remoteJid = messageKey.remoteJid;

      if (!store.chats[remoteJid]) {
        store.chats[remoteJid] = [];
      }

      store.chats[remoteJid].push(ms);

      if (ms.message.protocolMessage && ms.message.protocolMessage.type === 0) {
        const deletedKey = ms.message.protocolMessage.key;
        const chatMessages = store.chats[remoteJid];
        const deletedMessage = chatMessages.find(msg => msg.key.id === deletedKey.id);

        if (deletedMessage) {
          const deletedBy = deletedMessage.key.participant || deletedMessage.key.remoteJid;
          let notification = `*🤦LUCKY ANTIDELETE🤦*`;
          notification += `*Time deleted🌹:* ${new Date().toLocaleString()}`;
          notification += `*Deleted by🌺:* @${deletedBy.split('@')[0]}`;

          if (deletedMessage.message.conversation) {
            await zk.sendMessage(remoteJid, {
              text: notification + `*Message:* ${deletedMessage.message.conversation}`,
              mentions: [deletedMessage.key.participant]
            });
          } else if (deletedMessage.message.imageMessage || deletedMessage.message.videoMessage || deletedMessage.message.documentMessage || deletedMessage.message.audioMessage || deletedMessage.message.stickerMessage || deletedMessage.message.voiceMessage) {
            const mediaBuffer = await downloadMedia(deletedMessage.message);
            if (mediaBuffer) {
              const mediaType = deletedMessage.message.imageMessage ? 'image' : deletedMessage.message.videoMessage ? 'video' : deletedMessage.message.documentMessage ? 'document' : deletedMessage.message.audioMessage ? 'audio' : deletedMessage.message.stickerMessage ? 'sticker' : 'audio';
              await zk.sendMessage(remoteJid, {
                [mediaType]: mediaBuffer,
                caption: notification,
                mentions: [deletedMessage.key.participant]
              });
            }
          }
        }
      }
    });

    let repliedContacts = new Set();
    zk.ev.on("messages.upsert", async (m) => {
      const { messages } = m;
      const ms = messages[0];
      if (!ms.message) return;
      const messageText = ms.message.conversation || ms.message.extendedTextMessage?.text || "";
      const remoteJid = ms.key.remoteJid;

      if (messageText.match(/^[^\w\s]/) && ms.key.fromMe) {
        const prefix = messageText[0];
        const command = messageText.slice(1).split(" ")[0];
        const newMessage = messageText.slice(prefix.length + command.length).trim();

        if (command === "setautoreply" && newMessage) {
          auto_reply_message = newMessage;
          await zk.sendMessage(remoteJid, {
            text: `Auto-reply message has been updated to:\n"${auto_reply_message}"`
          });
          return;
        }
      }

      if (conf.AUTO_REPLY === "yes" && !repliedContacts.has(remoteJid) && !ms.key.fromMe && !remoteJid.includes("@g.us")) {
        await zk.sendMessage(remoteJid, {
          text: auto_reply_message,
          mentions: [ms.key.remoteJid]
        });

        repliedContacts.add(remoteJid);
      }
    });

    if (conf.AUTO_REACT === "yes") {
      zk.ev.on("messages.upsert", async (m) => {
        const { messages } = m;
        let emojis = [];
        const emojiFilePath = path.resolve(__dirname, 'luckybase', 'like.json');

        try {
          const data = fs.readFileSync(emojiFilePath, 'utf8');
          emojis = JSON.parse(data);
        } catch (error) {
          console.error('Error reading emojis file:', error);
          return;
        }

        for (const message of messages) {
          if (!message.key.fromMe) {
            const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
            await zk.sendMessage(message.key.remoteJid, {
              react: {
                text: randomEmoji,
                key: message.key
              }
            });
          }
        }
      });
    }

    let lastReactionTime = 0;
    const loveEmojis = ["❤️", "💖", "💘", "💝", "💓", "💌", "💕", "😎", "🔥", "💥", "💯", "✨", "🌟", "🌈", "⚡", "💎", "🌀", "👑", "🎉", "🎊", "🦄", "👽", "🛸", "🚀", "🦋", "💫", "🍀", "🎶", "🎧", "🎸", "🎤", "🏆", "🏅", "🌍", "🌎", "🌏", "🎮", "🎲", "💪", "🏋️", "🥇", "👟", "🏃", "🚴", "🚶", "🏄", "⛷️", "🕶️", "🧳", "🍿", "🥂", "🍻", "🍷", "🍸", "🥃", "🍾", "🎯", "⏳", "🎁", "🎈", "🎨", "🌻", "🌸", "🌺", "🌹", "🌼", "🌞", "🌝", "🌜", "🌙", "🌚", "🍀", "🌱", "🍃", "🍂", "🌾", "🐉", "🐍", "🦓", "🦄", "🦋", "🦧", "🦘", "🦨", "🦡", "🐉", "🐅", "🐆", "🐓", "🐢", "🐊", "🐠", "🐟", "🐡", "🦑", "🐙", "🦀", "🐬", "🦕", "🦖", "🐾", "🐕", "🐈", "🐇", "🐾"];

    if (conf.AUTO_REACT_STATUS === "yes") {
      console.log("AUTO_REACT_STATUS is enabled. Listening for status updates...");
      zk.ev.on("messages.upsert", async (m) => {
        const { messages } = m;
        for (const message of messages) {
          if (message.key && message.key.remoteJid === "status@broadcast") {
            const now = Date.now();
            if (now - lastReactionTime < 5000) {
              continue;
            }

            const keith = zk.user && zk.user.id ? zk.user.id.split(":")[0] + "@s.whatsapp.net" : null;
            if (!keith) continue;

            const randomLoveEmoji = loveEmojis[Math.floor(Math.random() * loveEmojis.length)];
            await zk.sendMessage(message.key.remoteJid, {
              react: {
                key: message.key,
                text: randomLoveEmoji
              }
            });

            lastReactionTime = Date.now();
            console.log(`Successfully reacted to status update by ${message.key.remoteJid} with ${randomLoveEmoji}`);

            await delay(2000); // 2-second delay between reactions
          }
        }
      });
    }
  }

  main();
}, 0);
