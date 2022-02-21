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

// LAMBDA
module.exports = app;
