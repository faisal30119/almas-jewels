const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: 'niagn9pn',
  api_key: '738543779546239',
  api_secret: 'wVRhdaov4Fg4urDDuN6LnaX7P4A'
});
cloudinary.api.ping(function(error, result) {
  console.log(result, error);
});
