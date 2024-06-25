const express = require('express');
const axios = require('axios');
const app = express();
const port = 5000;

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.get('/proxy', async (req, res) => {
  const imageUrl = req.query.url;
  try {
    const response = await axios({
      url: imageUrl,
      method: 'GET',
      responseType: 'stream'
    });
    response.data.pipe(res);
  } catch (error) {
    res.status(500).send('Error fetching the image');
  }
});

app.listen(port, () => {
  console.log(`Proxy server is running on port ${port}`);
});
