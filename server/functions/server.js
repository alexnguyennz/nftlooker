const express = require('express');
const app = express();

const { createProxyMiddleware } = require('http-proxy-middleware');

const cors = require('cors');

// global.fetch = require('node-fetch').default;

// ROUTE DATA
const {
  getNfts,
  getNft,
  getCollectionMetadata,
  getCollectionNfts,
} = require('../src/routes.js');

// Netlify Lambda
const router = express.Router();
const serverless = require('serverless-http');

const corsOptions = {
  origin: '*',
  methods: 'GET',
  optionsSuccessStatus: 200,
};

router.use(cors(corsOptions));

// API CALLS
router.get('/api/nfts', getNfts);
router.get('/api/nft', getNft);
router.get('/api/collection/metadata', getCollectionMetadata);
router.get('/api/collection/nfts', getCollectionNfts);

// MIDDLEWARE

app.use('/.netlify/functions/server', router);

//app.use('/.netlify/functions/server', );
// app.use(
//   '/.netlify/functions/server',
//   createProxyMiddleware({
//     target: 'https://nftlooker-server.netlify.app',
//     changeOrigin: true,
//   })
// );

// LAMBDA
module.exports = app;
module.exports.handler = serverless(app);
