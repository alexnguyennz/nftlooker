// IMPORTS
const axios = require('axios');
require('dotenv').config();

// UTILITIES
const {
  cloudinary,
  imagekit,
  DEFAULT_CLOUDINARY_IMG,
  DEFAULT_IMAGEKIT_IMG,
} = require('../utils/image.js');
const changeIpfsUrl = require('../utils/changeIpfsUrl.js');
const resolveDomain = require('../utils/resolve.js');

const getRandomWallet = async (req, res) => {
  const now = Math.floor(Date.now());

  // Moralis getDateToBlock
  // get latest Ethereum block
  let response = await axios
    .get(`${process.env.MORALIS_API_URL}/dateToBlock?chain=eth&date=${now}`, {
      headers: {
        accept: 'application/json',
        'X-API-KEY': process.env.MORALIS_API_KEY,
      },
    })
    .catch((err) => {
      console.log(err);
    });

  const latestBlock = response.data.block;

  // get a list of NFT transactions
  // Moralis GetNFTTransfersByBlock
  response = await axios
    .get(
      `${process.env.MORALIS_API_URL}/block/${latestBlock}/nft/transfers?chain=eth&limit=250`,
      {
        headers: {
          accept: 'application/json',
          'X-API-KEY': process.env.MORALIS_API_KEY,
        },
      }
    )
    .catch((err) => {
      console.log(err);
    });

  const transactions = response.data.result;

  const rand = Math.floor(Math.random() * transactions.length);

  try {
    if (
      transactions[rand].to_address &&
      transactions[rand].to_address !=
        '0x0000000000000000000000000000000000000000'
    ) {
      res.send(transactions[rand].to_address);
    } else {
      res.send(transactions[rand].from_address);
    }
  } catch (err) {
    console.log(err);
  }
};

module.exports = getRandomWallet;
