const axios = require('axios');

// i is not function error
// const axiosRetry = require('axios-retry');
// axiosRetry(axios, {
//   retries: 1,
//   retryDelay: axiosRetry.exponentialDelay,
//   retryCondition: axiosRetry.isRetryableError, // retry on Network Error & 5xx responses
// });

require('dotenv').config();

const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

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

// http://localhost:7777/.netlify/functions/server/api/nfts?address=0x2aea6d8220b61950f30674606faaa01c23465299&chain=eth
const getNfts = async (req, res) => {
  const { chain, address } = req.query;

  /*let resolvedAddress = address;

  if (!address.startsWith('0x')) {
    resolvedAddress = await resolveAddress(address);
  } */

  const response = await axios.get(
    `https://deep-index.moralis.io/api/v2/${address}/nft?chain=${chain}&format=decimal`,
    {
      headers: {
        accept: 'application/json',
        'X-API-KEY': process.env.MORALIS_API_KEY,
      },
    }
  );

  const nfts = response.data.result.map(async (item) => {
    const metadataResponse = await axios
      .get(item.token_uri, {
        validateStatus: function (status) {
          return status < 500; // Resolve only if the status code is less than 400
        },
      })
      .catch((err) => console.log(err.toJSON()));

    let metadata = metadataResponse.data;

    changeIpfsUrl(metadata);

    try {
      if (metadata.image && !metadata.image.endsWith('.mp4')) {
        metadata.image = cloudinary.url(metadata.image, {
          type: 'fetch',
          transformation: [
            { height: 300, width: 300 },
            { fetch_format: 'auto' },
          ],
        });
      } else if (metadata.image_url && !metadata.image_url.endsWith('.mp4')) {
        metadata.image_url = cloudinary.url(metadata.image_url, {
          type: 'fetch',
          transformation: [
            { height: 300, width: 300 },
            { fetch_format: 'auto' },
          ],
        });
      }

      return {
        ...item,
        metadata,
      };
    } catch (err) {
      console.log(err);
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
        acc[element.token_address] = acc[element.token_address] || [];

        acc[element.token_address].push(element);
      } catch (err) {
        //console.log('Broken NFT', err);
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

  changeIpfsUrl(metadata);

  const nft = {
    ...response.data,
    metadata,
  };

  console.log('metadata', nft);

  res.send(nft);
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

    changeIpfsUrl(metadata);

    console.log('metadata', metadata);

    return {
      ...item,
      metadata,
    };
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
