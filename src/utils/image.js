import ImageKit from 'imagekit-javascript';

export const imagekit = new ImageKit({
  publicKey: process.env.REACT_APP_IMAGEKIT_API_PUBLIC_KEY,
  urlEndpoint: process.env.REACT_APP_IMAGEKIT_API_URL,
});

export const DEFAULT_IMAGEKIT_IMG = 'no-image_QdqJhXtxF.png';

import { Cloudinary } from '@cloudinary/url-gen';

export const cloudinary = new Cloudinary({
  cloud: {
    cloudName: 'gladius',
  },
  url: {
    secure: true,
  },
});

export const DEFAULT_CLOUDINARY_IMG = 'no-image_lmfa1g.png';
