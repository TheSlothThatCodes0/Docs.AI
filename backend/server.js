const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');
const { OpenAI } = require('openai');
const app = express();
const PORT = process.env.PORT || 5001;
const openai = new OpenAI({
  apiKey: "sk-proj-byNj6VE2A1uHi0MOD1ZTT3BlbkFJU2r3EXhIpPBVmmcKNcDm",
});
app.use(bodyParser.json());
app.use(cors());
app.post('/api/suggestions', async (req, res) => {
  const { text } = req.body;
  console.log('Received text:', text);
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that provides text suggestions for autocompleting sentences or phrases in a text-editor. only provide text to complete the remaining sentence after the part already written, do not repeat it again. do not use any quotations or anything."
        },
        {
          role: "user",
          content: text,
        }
      ],
    });
    console.log('Response from OpenAI:', response.choices[0].message.content);
    let suggestions = response.choices[0].message.content.split('\n').slice(1); 
    suggestions = suggestions.map(suggestion => suggestion.replace(/<\/?[^>]+(>|$)/g, "").replace(/['"]/g, "").trim()); 
    suggestions = suggestions.filter(suggestion => suggestion.length < 50); 
    console.log('Filtered Suggestions:', suggestions);
    res.json({ suggestions });
  } catch (error) {
    console.error('Error fetching suggestions:', error.response ? error.response.data : error.message); 
    res.status(500).json({ error: error.message });
  }
});
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
