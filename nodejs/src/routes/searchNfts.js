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

// Moralis SearchNFTs
const searchNfts = async (req, res) => {
  const { chain, q, filter, limit, offset } = req.query;

  const response = await axios
    .get(
      `${process.env.MORALIS_API_URL}/nft/search?chain=${chain}&format=decimal&q=${q}&filter=${filter}&limit=${limit}&offset=${offset}`,
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

  //console.log('search', response.data.result);

  const nfts = response.data.result.map(async (item) => {
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
          //
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
            default_image: DEFAULT_CLOUDINARY_IMG,
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

  await Promise.allSettled(nfts).then((responses) => {
    //console.log('responses', responses[0]);
    const data = responses.map((item) => {
      return item.value;
    });

    console.log(`${chain} nfts`, data);

    /* group NFTs by collection
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
    }, Object.create(null)); */

    res.send(data);
  });
};

module.exports = searchNfts;
