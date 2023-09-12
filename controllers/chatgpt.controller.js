require("dotenv").config();
const {Configuration, OpenAIApi} = require("openai");
OPENAI_API_KEY= "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";

const configuration = new Configuration({
    // engine: "davinci",
    apiKey: OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const chatBot = async (req, res) => {
    try{
        const response = await openai.createCompletion({
            model: "davinci",
            prompt: "who are you?",
            maxTokens: 64,
            temperature: 0.5,
            top_p: 1.0,
            presence_penalty: 0.0,
            frequency_penalty: 0.0,
            stop: ["\n"]
        });

        return res.status(200).json({
            success: true,
            data: response.data.choices[0].text
        });
    }catch(error){
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

module.exports = {
    chatBot
}
