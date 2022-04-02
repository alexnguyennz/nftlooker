import ImageKit from 'imagekit-javascript';

export var imagekit = new ImageKit({
  publicKey: process.env.REACT_APP_IMAGEKIT_API_PUBLIC_KEY,
  urlEndpoint: process.env.REACT_APP_IMAGEKIT_API_URL,
});

export const DEFAULT_IMAGEKIT_IMG = 'no-image_QdqJhXtxF.png';
