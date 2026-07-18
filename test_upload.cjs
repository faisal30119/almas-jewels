const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: 'niagn9pn',
  api_key: '738543779546239',
  api_secret: 'wVRhdaov4Fg4urDDuN6LnaX7P4A'
});
const b64 = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64').toString("base64");
const dataURI = "data:image/png;base64," + b64;
cloudinary.uploader.upload(dataURI, {
  folder: "almas_bridal",
  resource_type: "auto"
}).then(res => console.log(res)).catch(err => console.error(err));
