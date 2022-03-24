// CLOUDINARY
var cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});
const DEFAULT_CLOUDINARY_IMG = 'no-image_skjijq.png'; // change this like below

// IMAGEKIT
var ImageKit = require('imagekit');

var imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_API_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_API_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_API_URL,
});
//const DEFAULT_IMAGEKIT_IMG = 'no-image_n1v9e1LpkGh.png';
const DEFAULT_IMAGEKIT_IMG = 'no-image_QdqJhXtxF.png';

module.exports.cloudinary = cloudinary;
module.exports.imagekit = imagekit;
module.exports.DEFAULT_CLOUDINARY_IMG = DEFAULT_CLOUDINARY_IMG;
module.exports.DEFAULT_IMAGEKIT_IMG = DEFAULT_IMAGEKIT_IMG;
