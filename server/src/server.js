const fs = require('fs');

const router = require('fastify')({
  // local HTTPS
  https: {
    allowHTTP1: true, // fallback support for HTTP1
    key: fs.readFileSync('cert/server.key'),
    cert: fs.readFileSync('cert/server.crt'),
  },
  logger: true,
});

// ROUTE METHODS
const getRandomWallet = require('./routes/getRandomWallet.js');
const getWalletNfts = require('./routes/getWalletNfts.js');
const getNft = require('./routes/getNft.js');
const getCollectionMetadata = require('./routes/getCollectionMetadata.js');
const getCollectionNfts = require('./routes/getCollectionNfts.js');
const searchNfts = require('./routes/searchNfts.js');

// API CALLS
router.get('/api/nfts', getWalletNfts);
router.get('/api/nft', getNft);
router.get('/api/collection/metadata', getCollectionMetadata);
router.get('/api/collection/nfts', getCollectionNfts);
router.get('/api/randomWallet', getRandomWallet);
router.get('/api/search', searchNfts);

// run Fastify server
const PORT = process.env.PORT || 7777;

const main = async () => {
  try {
    await router.listen(PORT);
  } catch (err) {
    router.log.error(err);
    process.exit(1);
  }
};

main();
