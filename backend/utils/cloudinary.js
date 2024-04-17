const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

// Return "https" URLs by setting secure: true
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_APIKEY,
    api_secret: process.env.CLOUDINARY_SECRET,
    secure: true
});

// Log the configuration
/* console.log(cloudinary.config()); */

let uploadImageBuffer = async (req) => {

    return new Promise((resolve, reject) => {
        let cld_upload_stream = cloudinary.uploader.upload_stream(
            {
                folder: "foo"
            },
            (error, result) => {
                if (result) {
                    resolve(result);
                } else {
                    reject(result);
                }
            }
        );

        streamifier.createReadStream(req.file.buffer).pipe(cld_upload_stream);
    })
}
/////////////////////////
// Uploads an image file from localStorage the idea...
/////////////////////////
const uploadImage = async (imagePath) => {

    // Use the uploaded file's name as the asset's public ID and 
    // allow overwriting the asset with new versions
    const options = {
        use_filename: false,
        unique_filename: false,
        overwrite: false,
    };

    try {
      // Upload the image
        const result = await cloudinary.uploader.upload(imagePath, options);
        return result.secure_url;
    } catch (error) {
        console.error(error);
    }
};

/////////////////////////////////////
// Gets details of an uploaded image
/////////////////////////////////////
const getAssetInfo = async (publicId) => {

    // Return colors in the response
    const options = {
        colors: true,
    };

    try {
        // Get details about the asset
        const result = await cloudinary.api.resource(publicId, options);
        console.log(result);
        return result.colors;
    } catch (error) {
        console.error(error);
    }
};

//////////////////////////////////////////////////////////////
// Creates an HTML image tag with a transformation that
// results in a circular thumbnail crop of the image  
// focused on the faces, applying an outline of the  
// first color, and setting a background of the second color.
//////////////////////////////////////////////////////////////
const createImageTag = (publicId, ...colors) => {

    // Set the effect color and background color
    const [effectColor, backgroundColor] = colors;

    // Create an image tag with transformations applied to the src URL
    let imageTag = cloudinary.image(publicId, {
        transformation: [
            { width: 250, height: 250, gravity: 'faces', crop: 'thumb' },
            { radius: 'max' },
            { effect: 'outline:10', color: effectColor },
            { background: backgroundColor },
        ],
    });

    return imageTag;
};


module.exports = { 
    uploadImage, 
    getAssetInfo, 
    createImageTag,
    uploadImageBuffer
};