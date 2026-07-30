const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

// The client-supplied mimetype (checked by multer's fileFilter) is trivially
// spoofable, so this re-checks the actual file bytes before the upload is
// trusted and forwarded to Cloudinary.
function isValidImageBuffer(buffer) {
    if (!Buffer.isBuffer(buffer) || buffer.length < 12) {
        return false;
    }

    const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    const isPng = PNG_SIGNATURE.every((byte, i) => buffer[i] === byte);
    const isWebp = buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP';

    return isJpeg || isPng || isWebp;
}

module.exports = { isValidImageBuffer };
