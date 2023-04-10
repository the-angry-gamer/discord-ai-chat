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
