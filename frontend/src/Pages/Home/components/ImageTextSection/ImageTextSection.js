import React from 'react';

const ImageTextSection = ({ imageClass, title }) => {
    return (
        <div className="image-with-text relative h-60 rounded-lg">
            <div className={`${imageClass} bg-center bg-cover cursor-pointer image-overlay absolute inset-0 opacity-50 transition-opacity duration-500 object-cover transition-transform duration-500 hover:scale-105`}></div>
            <div className="text-overlay absolute inset-0 flex justify-center items-center text-white font-bold text-2xl opacity-100 transition-opacity duration-500 text-center">{title}</div>
        </div>
    )
}

export default ImageTextSection;