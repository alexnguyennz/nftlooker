const spdy = require('spdy');
const express = require('express');
const fs = require('fs');

const app = express();

const cors = require('cors');

// ROUTE DATA
const {
  getNfts,
  getNft,
  getCollectionMetadata,
  getCollectionNfts,
} = require('../src/routes.js');

const corsOptions = {
  origin: '*',
  methods: 'GET',
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// API CALLS
app.get('/api/nfts', getNfts);
app.get('/api/nft', getNft);
app.get('/api/collection/metadata', getCollectionMetadata);
app.get('/api/collection/nfts', getCollectionNfts);

const PORT = process.env.PORT || 7777;

spdy
  .createServer(
    {
      key: fs.readFileSync('cert/server.key'),
      cert: fs.readFileSync('cert/server.crt'),
    },
    app
  )
  .listen(PORT, (err) => {
    if (err) {
      throw new Error(err);
    }

    console.log(`Server running on ${PORT}`);
  });
