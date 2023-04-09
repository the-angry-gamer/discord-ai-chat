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
  "Let me think about that",
  "The audacity to ask such a question, let me think",
  "Yea Yea Yea let me find it",
  "That is, by far, one of the most ridiculous things I have ever been asked",
];

// Load in bot
client.on("ready", () => {
  console.log("Chat bot is loaded in");
});

client.on("messageCreate", (msg) => {
  if (msg.author.bot) return;
  handleMessage(msg).catch((_) => {
    console.log("fail", _);
    msg.reply(failureMessage);
  });
});

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
    if (message) msg.reply(message);
  }
};

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
    return "I have failed :(";
  }
  return data.choices;
};

client.login(process.env.DISCORD_TOKEN);
