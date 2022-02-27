const axios = require('axios');

// i is not function error
// const axiosRetry = require('axios-retry');
// axiosRetry(axios, {
//   retries: 1,
//   retryDelay: axiosRetry.exponentialDelay,
//   retryCondition: axiosRetry.isRetryableError, // retry on Network Error & 5xx responses
// });

require('dotenv').config();

const MORALIS_API = 'https://deep-index.moralis.io/api/v2';

const mime = require('mime-types');
const contentType = require('content-type');

var cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const DEFAULT_IMG = 'no-image_skjijq.png';
const DEFAULT_IMAGEKIT_IMG = 'no-image_70AD3Cs61xQ.png';

const changeIpfsUrl = require('./utils/changeIpfsUrl.js');

// ENS resolve
const ethers = require('ethers');
const web3Provider = new ethers.providers.InfuraProvider('homestead', {
  projectId: process.env.INFURA_API_ID,
  projectSecret: process.env.INFURA_API_SECRET,
});

// Unstoppable resolve
const { default: Resolution } = require('@unstoppabledomains/resolution');
const autoprefixer = require('autoprefixer');
const resolution = new Resolution();

require('dotenv').config();

var ImageKit = require('imagekit');
const e = require('express');

var imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_API_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_API_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_API_URL,
});

// resolve domain to 0x address
async function resolveDomain(address) {
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

async function resolveAddress(address) {
  let resolvedDomain = address;

  // ENS
  resolvedDomain = await web3Provider.lookupAddress(address);
  return resolvedDomain;
}

async function getContentType(image) {
  const response = await axios.get(image).catch((err) => console.log(err));

  const type = contentType.parse(response);

  return type.type;
}

const getRandomWallet = async (req, res) => {
  const now = Math.floor(Date.now());

  // Moralis getDateToBlock
  // get latest Ethereum block
  let response = await axios
    .get(`${MORALIS_API}/dateToBlock?chain=eth&date=${now}`, {
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
  response = await axios(
    `${MORALIS_API}/block/${latestBlock}/nft/transfers?chain=eth&limit=250`,
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

// Moralis GetNFTs
const getNfts = async (req, res) => {
  const { chain, address } = req.query;

  let resolvedAddress = address;

  resolvedAddress = await resolveDomain(address);

  const response = await axios
    .get(
      `${MORALIS_API}/${resolvedAddress}/nft?chain=${chain}&format=decimal`,
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

  //console.log('response', response.data);

  const nfts = response.data.result.map(async (item) => {
    // no null token_uri e.g. with tokenized tweets

    const response = await axios.get(item.token_uri).catch((err) => {
      if (err.code == 'ENOTFOUND') console.log(err);
      //console.log(err.code);
    });

    // if metadata is encoded
    let metadata;

    //console.log(item.token_uri);

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

    //console.log(response.data);

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
          //console.log('data:image');
          //console.log('metadata', metadata);
          /* cloudinary.v2.uploader.upload(
            'https://www.google.co.nz/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png',
            { public_id: 'nftlooker/testetse' },
            function (error, result) {
              console.log(result, error);
            }
          ); */
          //metadata.image = encodeURIComponent(metadata.image);
          /*metadata.image = cloudinary.url(
            'https://www.google.co.nz/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png',
            {
              type: 'fetch',
              transformation: [
                {
                  overlay: {
                    url: 'aHR0cHM6Ly9yZXMuY2xvdWRpbmFyeS5jb20vaG9vdmVyY2Zpc2QvaW1hZ2UvdXBsb2FkL2ZfYXV0byxxX2F1dG8vd18yMDAsaF8yMDAscl8xMC9lX2NvbG9yaXplLGNvX3JnYjo3NTQwODgvbF90ZXh0OkFyaWFsXzEwMF9ib2xkX2NlbnRlcjoxLGNvX3JnYjpGRkZGRkYvdjE1ODYxMTIyNDMvMXB4LnBuZw==',
                  },
                },
                { flags: 'layer_apply', gravity: 'north_west', x: 15, y: 15 },
              ],
            }
          ); */
          //console.log('encoded', metadata.image);
        } else if (metadata.image.endsWith('.gif')) {
          // Cloudinary
          metadata.image = cloudinary.url(metadata.image, {
            type: 'fetch',
            transformation: [
              { width: 250, height: 250 },
              { fetch_format: 'mp4' },
            ],
            default_image: DEFAULT_IMG,
          });
        } else if (
          metadata.image.endsWith('.mp4') ||
          metadata.image.endsWith('.webm')
        ) {
          const stripped = metadata.image.replace(/^.*:\/\//i, '');
          // Cloudinary
          metadata.image = cloudinary.url(`remote_https_media/${stripped}`, {
            resource_type: 'video',
            //eager: [{ width: 300, height: 250, crop: 'pad' }],
            //transformation: [{ width: 250, height: 169 }], // 16/9
            transformation: [{ width: 400, height: 300 }], // 16/9
            default_image: DEFAULT_IMG,
          });
        } else if (
          !metadata.image.endsWith('.glb') &&
          !metadata.image.endsWith('.gitf')
        ) {
          // Cloudinary
          /*metadata.image = cloudinary.url(metadata.image, {
            type: 'fetch',
            transformation: [
              { width: 250, height: 250 },
              { fetch_format: 'auto' },
            ],
            quality: 'auto',
            default_image: DEFAULT_IMG,
          }); */

          // ImageKit
          metadata.image = imagekit.url({
            src: `${process.env.IMAGEKIT_API_URL}/${metadata.image}`,
            transformation: [
              {
                height: '250',
                width: '250',
                defaultImage: DEFAULT_IMAGEKIT_IMG,
              },
            ],
            /* signed URLs to prevent modification and expire ImageKit
            signed: true,
            expireSeconds: 300, */
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

// Moralis GetTokenIdMetadata
const getNft = async (req, res) => {
  const { chain, address, tokenId } = req.query;

  const response = await axios(
    `${MORALIS_API}/nft/${address}/${tokenId}?chain=${chain}&format=decimal`,
    {
      headers: {
        accept: 'application/json',
        'X-API-KEY': process.env.MORALIS_API_KEY,
      },
    }
  );

  // try resolving
  const test = await resolveAddress(
    '0xA1b02d8c67b0FDCF4E379855868DeB470E169cfB'
  );
  //console.log('address', test);

  const metadataResponse = await axios(response.data.token_uri);

  const metadata = metadataResponse.data;

  if (typeof metadata === 'object' && metadata !== null) {
    // format IPFS links

    changeIpfsUrl(metadata);

    if (metadata.image) {
      if (metadata.image.startsWith('data:image')) {
        //console.log('data:image');
      } else if (metadata.image.endsWith('.gif')) {
        // Cloudinary
        metadata.image = cloudinary.url(metadata.image, {
          type: 'fetch',
          transformation: [
            { width: 250, height: 250 },
            { fetch_format: 'mp4' },
          ],
          default_image: DEFAULT_IMG,
        });
      } else if (
        metadata.image.endsWith('.mp4') ||
        metadata.image.endsWith('.webm')
      ) {
        const stripped = metadata.image.replace(/^.*:\/\//i, '');
        // Cloudinary
        metadata.image = cloudinary.url(`remote_https_media/${stripped}`, {
          resource_type: 'video',
          eager: [{ width: 250, height: 250, crop: 'pad' }],
          eager_async: true,
          default_image: DEFAULT_IMG,
        });
      } else if (
        !metadata.image.endsWith('.glb') &&
        !metadata.image.endsWith('.gitf')
      ) {
        // Cloudinary
        /*metadata.image = cloudinary.url(metadata.image, {
          type: 'fetch',
          transformation: [
            { width: 250, height: 250 },
            { fetch_format: 'auto' },
          ],
          quality: 'auto',
          default_image: DEFAULT_IMG,
        }); */

        // ImageKit
        metadata.image = imagekit.url({
          src: `${process.env.IMAGEKIT_API_URL}/${metadata.image}`,
          transformation: [
            {
              height: '1000',
              width: '1000',
              defaultImage: DEFAULT_IMAGEKIT_IMG,
            },
          ],
        });
      }
    }

    const nft = {
      ...response.data,
      metadata,
    };

    //console.log('metadata', nft);

    res.send(nft);
  } else {
    return null;
  }
};

// Moralis GETNFTMetadata
const getCollectionMetadata = async (req, res) => {
  const { chain, address } = req.query;

  const response = await axios(
    `${MORALIS_API}/nft/${address}/metadata?chain=${chain}`,
    {
      headers: {
        accept: 'application/json',
        'X-API-KEY': process.env.MORALIS_API_KEY,
      },
    }
  );

  res.json(response.data);
};

// Moralis GetAllTokenIds
const getCollectionNfts = async (req, res) => {
  const { address, chain, limit } = req.query;

  const response = await axios(
    `${MORALIS_API}/nft/${address}?chain=${chain}&format=decimal&limit=${limit}`,
    {
      headers: {
        accept: 'application/json',
        'X-API-KEY': process.env.MORALIS_API_KEY,
      },
    }
  );

  //console.log(response.data.result[12]);

  const nfts = response.data.result.map(async (item) => {
    if (item.token_id == '14442') {
      console.log(item);
    }

    try {
      const response = await axios(item.token_uri);
      const metadata = response.data;

      changeIpfsUrl(metadata); // format IPFS links

      if (metadata.image && !metadata.image.endsWith('.mp4')) {
        // Cloudinary
        /*metadata.image = cloudinary.url(metadata.image, {
          type: 'fetch',

          transformation: [
            { height: 250, width: 250 },
            { fetch_format: 'auto' },
          ],
          quality: 'auto',
          default_image: DEFAULT_IMG,
        }); */

        // ImageKit
        metadata.image = imagekit.url({
          src: `${process.env.IMAGEKIT_API_URL}/${metadata.image}`,
          transformation: [
            {
              height: '250',
              width: '250',
              defaultImage: DEFAULT_IMAGEKIT_IMG,
            },
          ],
        });
      }

      return {
        ...item,
        metadata,
      };
    } catch (err) {
      // return placeholders for no metadata found
      return {
        ...item,
        metadata: {
          name: 'No metadata found.',
          description: 'No metadata found.',
          image: '/img/sad-chocobo.png',
          original_image: null,
        },
      };
    }
  });

  Promise.allSettled(nfts).then((responses) => {
    //console.log('response', responses);

    const data = responses.map((item) => {
      return item.value;
    });

    res.json(data);
  });
};

// Moralis SearchNFTs
const searchNfts = async (req, res) => {
  const { chain, q, filter, limit } = req.query;

  const response = await axios(
    `${MORALIS_API}/nft/search?chain=${chain}&format=decimal&q=${q}&filter=${filter}&limit=${limit}`,
    {
      headers: {
        accept: 'application/json',
        'X-API-KEY': process.env.MORALIS_API_KEY,
      },
    }
  ).catch((err) => {
    console.log(err);
  });

  //console.log('search', response.data.result);

  const nfts = response.data.result.map(async (item) => {
    // no null token_uri e.g. with tokenized tweets

    const response = await axios.get(item.token_uri).catch((err) => {
      if (err.code == 'ENOTFOUND') console.log(err);
      //console.log(err.code);
    });

    // if metadata is encoded
    let metadata;

    //console.log(item.token_uri);

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

    //console.log(response.data);

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
          //console.log('data:image');
          //console.log('metadata', metadata);
          /* cloudinary.v2.uploader.upload(
            'https://www.google.co.nz/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png',
            { public_id: 'nftlooker/testetse' },
            function (error, result) {
              console.log(result, error);
            }
          ); */
          //metadata.image = encodeURIComponent(metadata.image);
          /*metadata.image = cloudinary.url(
            'https://www.google.co.nz/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png',
            {
              type: 'fetch',
              transformation: [
                {
                  overlay: {
                    url: 'aHR0cHM6Ly9yZXMuY2xvdWRpbmFyeS5jb20vaG9vdmVyY2Zpc2QvaW1hZ2UvdXBsb2FkL2ZfYXV0byxxX2F1dG8vd18yMDAsaF8yMDAscl8xMC9lX2NvbG9yaXplLGNvX3JnYjo3NTQwODgvbF90ZXh0OkFyaWFsXzEwMF9ib2xkX2NlbnRlcjoxLGNvX3JnYjpGRkZGRkYvdjE1ODYxMTIyNDMvMXB4LnBuZw==',
                  },
                },
                { flags: 'layer_apply', gravity: 'north_west', x: 15, y: 15 },
              ],
            }
          ); */
          //console.log('encoded', metadata.image);
        } else if (metadata.image.endsWith('.gif')) {
          // Cloudinary
          metadata.image = cloudinary.url(metadata.image, {
            type: 'fetch',
            transformation: [
              { width: 250, height: 250 },
              { fetch_format: 'mp4' },
            ],
            default_image: DEFAULT_IMG,
          });
        } else if (
          metadata.image.endsWith('.mp4') ||
          metadata.image.endsWith('.webm')
        ) {
          const stripped = metadata.image.replace(/^.*:\/\//i, '');
          // Cloudinary
          metadata.image = cloudinary.url(`remote_https_media/${stripped}`, {
            resource_type: 'video',
            //eager: [{ width: 300, height: 250, crop: 'pad' }],
            //transformation: [{ width: 250, height: 169 }], // 16/9
            transformation: [{ width: 400, height: 300 }], // 16/9
            default_image: DEFAULT_IMG,
          });
        } else if (
          !metadata.image.endsWith('.glb') &&
          !metadata.image.endsWith('.gitf')
        ) {
          // Cloudinary
          /*metadata.image = cloudinary.url(metadata.image, {
            type: 'fetch',
            transformation: [
              { width: 250, height: 250 },
              { fetch_format: 'auto' },
            ],
            quality: 'auto',
            default_image: DEFAULT_IMG,
          }); */

          // ImageKit
          metadata.image = imagekit.url({
            src: `${process.env.IMAGEKIT_API_URL}/${metadata.image}`,
            transformation: [
              {
                height: '250',
                width: '250',
                defaultImage: DEFAULT_IMAGEKIT_IMG,
              },
            ],
            /* signed URLs to prevent modification and expire ImageKit
            signed: true,
            expireSeconds: 300, */
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

// EXPORTS
module.exports.getNfts = getNfts;
module.exports.getNft = getNft;
module.exports.getCollectionMetadata = getCollectionMetadata;
module.exports.getCollectionNfts = getCollectionNfts;
module.exports.getRandomWallet = getRandomWallet;

module.exports.searchNfts = searchNfts;
