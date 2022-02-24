const axios = require('axios');

// i is not function error
// const axiosRetry = require('axios-retry');
// axiosRetry(axios, {
//   retries: 1,
//   retryDelay: axiosRetry.exponentialDelay,
//   retryCondition: axiosRetry.isRetryableError, // retry on Network Error & 5xx responses
// });

require('dotenv').config();

const mime = require('mime-types');
const contentType = require('content-type');

var cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const DEFAULT_IMG = '404_cnciyv.webp';

const changeIpfsUrl = require('./utils/changeIpfsUrl.js');

// ENS resolve
const ethers = require('ethers');
const web3Provider = new ethers.providers.InfuraProvider('homestead', {
  projectId: process.env.INFURA_API_ID,
  projectSecret: process.env.INFURA_API_SECRET,
});

// Unstoppable resolve
const { default: Resolution } = require('@unstoppabledomains/resolution');
const resolution = new Resolution();

require('dotenv').config();

async function resolveAddress(address) {
  let resolvedAddress = address;

  // resolve domains
  if (address.startsWith('0x')) {
    return await resolvedAddress;
  } else if (address.endsWith('.eth')) {
    // ENS
    resolvedAddress = await web3Provider.resolveName(address);
    return await resolvedAddress;
  } else {
    // Unstoppable Domains
    return await resolution
      .addr(address, 'eth')
      .then((address) => {
        resolvedAddress = address;
        return resolvedAddress;
      })
      .catch(console.error);
  }
}

async function getContentType(image) {
  const response = await axios.get(image).catch((err) => console.log(err));

  const type = contentType.parse(response);

  return type.type;
}

const getRandomWallet = async (req, res) => {
  // `https://deep-index.moralis.io/api/v2/dateToBlock?chain=eth&date=1645560375063`,

  // get latest block based on time Etherscan
  /*let response = await axios
      .get(
        `https://api.etherscan.io/api?module=block&action=getblocknobytime&timestamp=${now}&closest=before&apikey=1HDZ2TTTSB2A2P5P1YHSPVUMVDM64UWIWH`
      )
      .catch((err) => {
        console.log(err);
      }); */

  // Get Internal Transactions by Block Range Etherscan
  /*response = await axios
      .get(
        `https://api.etherscan.io/api?module=account&action=txlistinternal&startblock=${
          latestBlock - 10000
        }&endblock=${latestBlock}&page=1&offset=250&sort=asc&apikey=1HDZ2TTTSB2A2P5P1YHSPVUMVDM64UWIWH`
      )
      .catch((err) => {
        console.log(err);
      }); */
  const now = Math.floor(Date.now());

  // get latest Ethereum block
  let response = await axios
    .get(
      `https://deep-index.moralis.io/api/v2/dateToBlock?chain=eth&date=${now}`,
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

  const latestBlock = response.data.block;

  // get a list of NFT transactions
  response = await axios(
    `https://deep-index.moralis.io/api/v2/block/${latestBlock}/nft/transfers?chain=eth&limit=250`,
    {
      headers: {
        accept: 'application/json',
        'X-API-KEY': process.env.MORALIS_API_KEY,
      },
    }
  ).catch((err) => {
    console.log(err);
  });

  const transactions = response.data.result;

  console.log(transactions);

  const rand = Math.floor(Math.random() * transactions.length);

  try {
    if (transactions[rand].to_address) {
      res.send(transactions[rand].to_address);
    } else {
      res.send(transactions[rand].from_address);
    }
  } catch (err) {
    console.log(err);
  }
};

const getNfts = async (req, res) => {
  const { chain, address } = req.query;

  let resolvedAddress = address;

  resolvedAddress = await resolveAddress(address);

  const response = await axios.get(
    `https://deep-index.moralis.io/api/v2/${resolvedAddress}/nft?chain=${chain}&format=decimal`,
    {
      headers: {
        accept: 'application/json',
        'X-API-KEY': process.env.MORALIS_API_KEY,
      },
    }
  );

  //console.log('response', response.data);

  const nfts = response.data.result.map(async (item) => {
    // no null token_uri e.g. with tokenized tweets

    const response = await axios.get(item.token_uri).catch((err) => {
      //if (err.code == 'ENOTFOUND') console.log(err);
      console.log(err.code);
    });

    // if metadata is encoded
    let metadata;

    if (item.token_uri.startsWith('data:application/json')) {
      const json = Buffer.from(
        item.token_uri.substring(29), // strip out identifier
        'base64'
      ).toString();
      const decoded = JSON.parse(json);
      //console.log('decoded', decoded);

      metadata = decoded;
    } else {
      metadata = response.data; // store normal JSON
    }

    console.log(response.data);

    // check if returned metadata JSON was successfully parsed into an object
    if (typeof metadata === 'object' && metadata !== null) {
      // format IPFS links

      if (!metadata.image.startsWith('data:image')) {
        changeIpfsUrl(metadata);
      }

      //getContentType(metadata.image).then((response) => console.log(response));
      //console.log('contenType', contentType);

      const mimeType = mime.lookup(metadata.image);
      //console.log('mime', mimeType);

      if (metadata.image) {
        if (metadata.image.startsWith('data:image')) {
          metadata.image = encodeURIComponent(metadata.image);
        } else if (metadata.image.endsWith('.gif')) {
          metadata.image = cloudinary.url(metadata.image, {
            type: 'fetch',
            transformation: [
              { height: 300, width: 300 },
              { fetch_format: 'mp4' },
            ],
            default_image: DEFAULT_IMG,
          });
        } else if (metadata.image.endsWith('.mp4')) {
          const stripped = metadata.image.replace(/^.*:\/\//i, '');
          metadata.image = cloudinary.url(`remote_https_media/${stripped}`, {
            resource_type: 'video',
            eager: [{ width: 400, height: 300, crop: 'pad' }],
            eager_async: true,
            default_image: DEFAULT_IMG,
          });
        } else if (!metadata.image.endsWith('.mp4')) {
          metadata.image = cloudinary.url(metadata.image, {
            type: 'fetch',
            transformation: [
              { height: 300, width: 300 },
              { fetch_format: 'auto' },
            ],
            default_image: DEFAULT_IMG,
          });
        }
      }

      return {
        ...item,
        metadata,
      };
    } else {
      return null;
    }
  });

  Promise.allSettled(nfts).then((responses) => {
    const data = responses.map((item) => {
      return item.value;
    });

    // console.log(`${chain} nfts`, data);

    // group NFTs by collection
    const grouped = data.reduce((acc, element) => {
      // make array if key value doesn't already exist
      try {
        if (element.token_address) {
          acc[element.token_address] = acc[element.token_address] || [];

          acc[element.token_address].push(element);
        }
      } catch (err) {
        // Cannot read properties of undefined (reading 'token_address')
        // console.log(err);
      }

      return acc;
    }, Object.create(null));

    //console.log('grouped', grouped);

    res.send(grouped);
  });
};

const getNft = async (req, res) => {
  const { chain, address, tokenId } = req.query;

  const response = await axios(
    `https://deep-index.moralis.io/api/v2/nft/${address}/${tokenId}?chain=${chain}&format=decimal`,
    {
      headers: {
        accept: 'application/json',
        'X-API-KEY': process.env.MORALIS_API_KEY,
      },
    }
  );

  const metadataResponse = await axios(response.data.token_uri);

  const metadata = metadataResponse.data;

  if (typeof metadata === 'object' && metadata !== null) {
    // format IPFS links

    changeIpfsUrl(metadata);

    if (metadata.image && !metadata.image.endsWith('.mp4')) {
      metadata.image = cloudinary.url(metadata.image, {
        type: 'fetch',
        // serve larger image for bigger view
        transformation: [
          { height: 1000, width: 1000 },
          { fetch_format: 'auto' },
        ],
        default_image: DEFAULT_IMG,
      });
    }

    const nft = {
      ...response.data,
      metadata,
    };

    console.log('metadata', nft);

    res.send(nft);
  } else {
    return null;
  }
};

const getCollectionMetadata = async (req, res) => {
  const { chain, address } = req.query;

  const response = await axios(
    `https://deep-index.moralis.io/api/v2/nft/${address}/metadata?chain=${chain}`,
    {
      headers: {
        accept: 'application/json',
        'X-API-KEY': process.env.MORALIS_API_KEY,
      },
    }
  );

  res.json(response.data);
};

const getCollectionNfts = async (req, res) => {
  const { address, chain, limit } = req.query;

  const response = await axios(
    `https://deep-index.moralis.io/api/v2/nft/${address}?chain=${chain}&format=decimal&limit=${limit}`,
    {
      headers: {
        accept: 'application/json',
        'X-API-KEY': process.env.MORALIS_API_KEY,
      },
    }
  );

  const nfts = response.data.result.map(async (item) => {
    const response = await axios(item.token_uri);

    const metadata = response.data;

    if (typeof metadata === 'object' && metadata !== null) {
      // format IPFS links

      changeIpfsUrl(metadata);

      if (metadata.image && !metadata.image.endsWith('.mp4')) {
        metadata.image = cloudinary.url(metadata.image, {
          type: 'fetch',
          // serve larger image for bigger view
          transformation: [
            { height: 300, width: 300 },
            { fetch_format: 'auto' },
          ],
          default_image: DEFAULT_IMG,
        });
      }

      console.log('metadata', metadata);

      return {
        ...item,
        metadata,
      };
    } else {
      return null;
    }
  });

  Promise.allSettled(nfts).then((responses) => {
    console.log('response', responses);

    const data = responses.map((item) => {
      return item.value;
    });

    res.json(data);
  });
};

module.exports.getNfts = getNfts;
module.exports.getNft = getNft;
module.exports.getCollectionMetadata = getCollectionMetadata;
module.exports.getCollectionNfts = getCollectionNfts;
module.exports.getRandomWallet = getRandomWallet;

/*
Promise.allSettled(nfts).then((responses) => {
    const data = responses.map((item) => {
      return item.value;
    });

    // console.log(`${chain} nfts`, data);

    // group NFTs by collection
    const groupedData = data.reduce((acc, element) => {
      // make array if key value doesn't already exist
      acc[element.token_address] = acc[element.token_address] || [];

      acc[element.token_address].push(element);

      return acc;
    }, Object.create(null));

    //console.log('grouped', grouped);

    res.json(groupedData);
    */
