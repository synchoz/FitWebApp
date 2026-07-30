const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

// Return "https" URLs by setting secure: true
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_APIKEY,
    api_secret: process.env.CLOUDINARY_SECRET,
    secure: true
});

async function uploadImageBuffer(file) {
    return new Promise((resolve, reject) => {
        const cld_upload_stream = cloudinary.uploader.upload_stream(
            {
                folder: "foo"
            },
            (error, result) => {
                if (result) {
                    resolve(result);
                } else {
                    reject(error);
                }
            }
        );

        streamifier.createReadStream(file.buffer).pipe(cld_upload_stream);
    });
}

module.exports = { uploadImageBuffer };