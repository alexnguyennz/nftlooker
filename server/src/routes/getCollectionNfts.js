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

// Moralis GetAllTokenIds
const getCollectionNfts = async (req, res) => {
  const { address, chain, limit, offset } = req.query;

  const response = await axios.get(
    `${process.env.MORALIS_API_URL}/nft/${address}?chain=${chain}&format=decimal&limit=${limit}&offset=${offset}`,
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
      const response = await axios.get(item.token_uri);
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

  await Promise.allSettled(nfts).then((responses) => {
    //console.log('response', responses);

    const data = responses.map((item) => {
      return item.value;
    });

    res.send(data);
  });
};

module.exports = getCollectionNfts;
