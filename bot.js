require("dotenv").config();
const { Configuration, OpenAIApi } = require("openai");

const { Client, GatewayIntentBits } = require("discord.js");
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
  ],
});

const chatGTPKey = process.env.CHAT_GPT_KEY;
const chatGPTModel = process.env.CHAT_GPT_MODEL;
const failureMessage = "Something has gone wrong, I have failed you";

const repliesOnThinking = [
  "Let me think about that.",
  "The audacity to ask such a question, let me think.",
  "Yea Yea Yea let me find it.",
  "That is, by far, one of the most ridiculous things I have ever been asked,.",
  "We will file that one away where the FBI can't find it.",
  "Damn...",
];

// Load in bot
client.on("ready", () => {
  console.log("Chat bot is loaded in");
});

// When there is a discord message
client.on("messageCreate", (msg) => {
  if (msg.author.bot) return;
  handleMessage(msg).catch((_) => {
    msg.reply(failureMessage);
  });
});

// Handle something writing to the discord server
const handleMessage = async (msg) => {
  if (msg.content.toLowerCase() === "hello there") {
    msg.reply("General Kenobi");
    return;
  } else if (msg.mentions.has(client.user.id)) {
    const getReponse =
      repliesOnThinking[Math.floor(Math.random() * repliesOnThinking.length)];

    msg.reply(getReponse);

    // remove mentions from request
    let request = msg.content;
    msg.mentions.users.forEach((mention) => {
      request = request.replace(`<@${mention.id}> `, "");
    });

    const answer = await askChatGPT([{ role: "user", content: request }]).catch(
      (err) => {
        throw err;
      }
    );

    const message = answer[0].message;
    // There is a length limit of 2000 on discord replies
    const lengthLimit = 1500;
    if (message?.length >= 1999) {
      const x = message.length / lengthLimit;
      for (let i = 0; i < x; i = i + 1500) {
        msg.reply(message.subString(i, i * lengthLimit));
      }
    } else {
      if (message) msg.reply(message);
    }
  }
};

// Run the command on Chat GPT
askChatGPT = async (aiRequest) => {
  const openAI = new OpenAIApi(
    new Configuration({
      apiKey: chatGTPKey,
    })
  );

  const { data } = await openAI.createChatCompletion({
    model: chatGPTModel,
    messages: aiRequest,
  });

  if (!data) {
    return "I have failed to acquire results :(";
  }
  return data.choices;
};

// Log into the discord server
client.login(process.env.DISCORD_TOKEN);

// https://www.youtube.com/watch?v=qv24S2L1N0k
