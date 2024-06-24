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
          content: "You are a helpful assistant that provides text suggestions for autocompleting sentences or phrases in a text-editor. only provide text to complete the remaining sentence after the part already written, do not repeat it again. make sure the suggestion is no more than 6 words long. do not use any quotations or anything."
        },
        {
          role: "user",
          content: text,
        }
      ],
    });
    console.log('Response from OpenAI:', response.choices[0].message.content);
    let suggestions = response.choices[0].message.content;
    res.json({ suggestions });
  } catch (error) {
    console.error('Error fetching suggestions:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/modify', async (req, res) => {
  const { text, prompt } = req.body;
  console.log('Received text:', text);
  console.log('Received prompt:', prompt);
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that modifies text based on user input. The user will provide a text to modify and a prompt for how to modify it."
        },
        {
          role: "user",
          content: `Text: ${text}\nPrompt: ${prompt}`,
        }
      ],
    });
    console.log('Response from OpenAI:', response.choices[0].message.content);
    let modifiedText = response.choices[0].message.content;
    res.json({ modifiedText });
  } catch (error) {
    console.error('Error modifying text:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auto-title', async (req, res) => {
  const { text } = req.body;
  console.log('Received text:', text);
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that generates a title for a document based on its content. The user will provide the content of the document. The title should be 4 words or less, and your output should be only the title and nothing else, no quotations or anything."
        },
        {
          role: "user",
          content: text +'\n\n\nonly out the sole title. 1-4 words only. only the title, no quotations, nothing',
        }
      ],
    });
    console.log('Response from OpenAI:', response.choices[0].message.content);
    let title = response.choices[0].message.content;
    res.json({ title });
  } catch (error) {
    console.error('Error generating title:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/generate-paragraph', async (req, res) => {
  const { prompt } = req.body;
  console.log('Received prompt');
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that generates a paragraph based on user input. The user will provide a prompt for the paragraph."
        },
        {
          role: "user",
          content: prompt,
        }
      ],
    });
    console.log('Response from OpenAI:', response.choices[0].message.content);
    let paragraph = response.choices[0].message.content;
    res.json({ paragraph });
  } catch (error) {
    console.error('Error generating paragraph:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
