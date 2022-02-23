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
  getRandomWallet,
} = require('../src/routes.js');

const corsOptions = {
  origin: '*',
  methods: 'GET',
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

const router = express.Router();

// API CALLS
router.get('/nfts', getNfts);
router.get('/nft', getNft);
router.get('/collection/metadata', getCollectionMetadata);
router.get('/collection/nfts', getCollectionNfts);
router.get('/randomWallet', getRandomWallet);

app.use('/api', router);

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
      console.error(err);
      return process.exit(1);
    }

    console.log(`Server running on ${PORT}`);
  });
