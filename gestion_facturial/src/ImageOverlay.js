import React, { useState } from 'react';
import './ImageOverlay.css';

function ImageOverlay() {
  const [images, setImages] = useState([]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const imageObjects = files.map((file) => ({
      url: URL.createObjectURL(file),
      rotation: 0,
    }));
    setImages([...images, ...imageObjects]);
  };

  const handleRotationChange = (index, angle) => {
    const updated = [...images];
    updated[index].rotation = angle;
    setImages(updated);
  };

  return (
    <div className="container">
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleImageUpload}
      />

      <div className="canvas">
        {images.map((image, index) => (
          <div
            key={index}
            className="image-wrapper"
            style={{
              transform: `rotate(${image.rotation}deg)`,
              zIndex: index + 1,
            }}
          >
            <img src={image.url} alt={`img-${index}`} />
          </div>
        ))}
      </div>

      <div className="controls">
        {images.map((image, index) => (
          <div key={index}>
            <label>Image {index + 1} Angle: {image.rotation}°</label>
            <input
              type="range"
              min="-180"
              max="180"
              value={image.rotation}
              onChange={(e) => handleRotationChange(index, parseInt(e.target.value))}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default ImageOverlay;
