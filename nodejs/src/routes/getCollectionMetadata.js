// IMPORTS
const axios = require('axios');
require('dotenv').config();

// Moralis GETNFTMetadata
const getCollectionMetadata = async (req, res) => {
  const { chain, address } = req.query;

  const response = await axios.get(
    `${process.env.MORALIS_API_URL}/nft/${address}/metadata?chain=${chain}`,
    {
      headers: {
        accept: 'application/json',
        'X-API-KEY': process.env.MORALIS_API_KEY,
      },
    }
  );

  res.send(response.data);
};

module.exports = getCollectionMetadata;
