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

// Moralis GetNFTs
const getWalletNfts = async (req, res) => {
  const { chain, address } = req.query;

  let resolvedAddress = address;

  resolvedAddress = await resolveDomain(address);

  const response = await axios
    .get(
      `${process.env.MORALIS_API_URL}/${resolvedAddress}/nft?chain=${chain}&format=decimal`,
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

      //const mimeType = mime.lookup(metadata.image);
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
            default_image: DEFAULT_CLOUDINARY_IMG,
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
            default_image: DEFAULT_CLOUDINARY_IMG,
          });

          // ImageKit
          //metadata.image = `https://ik.imagekit.io/glad/tr:w-400,h-300/${metadata.image}`
        } else if (
          !metadata.image.endsWith('.glb') &&
          !metadata.image.endsWith('.gitf')
        ) {
          // Cloudinary
          metadata.image = cloudinary.url(metadata.image, {
            type: 'fetch',
            transformation: [
              { width: 250, height: 250 },
              { fetch_format: 'auto' },
            ],
            quality: 'auto',
            default_image: DEFAULT_CLOUDINARY_IMG,
          });

          // ImageKit
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

  await Promise.allSettled(nfts).then((responses) => {
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

module.exports = getWalletNfts;
