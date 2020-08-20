import React, { useState } from 'react';

import ReactCrop from 'react-image-crop';
import smartcrop from 'smartcrop';

import 'react-image-crop/dist/ReactCrop.css';

import './App.css';

const App = () => {
  // const [src, setSrc] = useState({ aspect: 5 / 5 });
  const [src, setSrc] = useState(null);
  const [crop, setCrop] = useState({});
  const [croppedImageUrl, setCroppedImageUrl] = useState();
  let imageRef = React.useRef();
  let fileUrl  = null;

  const onSelectFile = e => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () =>
        setSrc(reader.result)
      );
      reader.readAsDataURL(e.target.files[0]);
    }
  }

  // If you setState the crop in here you should return false.
  const onImageLoaded = image => {
    imageRef.current = image;
    setSmartCrop(image);
    return false;
  };

  const onCropComplete = crop => {
    console.log('on crop complete');
    makeClientCrop(crop);
  };

  const onCropChange = (crop, percentCrop) => {
    console.log('on crop change', crop, percentCrop);
    setCrop(crop);
  };

  const makeClientCrop = async (crop) => {
    if (imageRef.current && crop.width && crop.height) {
      const croppedImageUrl = await getCroppedImg(
        crop,
        'newFile.jpeg'
      );
      setCroppedImageUrl(croppedImageUrl);
    }
  }

  const setSmartCrop = () => {
    smartcrop.crop(imageRef.current, { width: 7, height: 5 }).then(
      (crop) => {
        console.log(crop)
        // const newCrop = { height: crop.topCrop }
        setCrop(crop.topCrop);
        makeClientCrop(crop.topCrop);
      }
    );
  }

  const getCroppedImg = (crop, fileName) => {
    const canvas = document.createElement('canvas');
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(
      imageRef.current,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      crop.width,
      crop.height
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob(blob => {
        if (!blob) {
          //reject(new Error('Canvas is empty'));
          console.error('Canvas is empty');
          return;
        }
        blob.name = fileName;
        window.URL.revokeObjectURL(fileUrl);
        fileUrl = window.URL.createObjectURL(blob);
        resolve(fileUrl);
      }, 'image/jpeg');
    });
  }

  return (
    <div className="App">
      <h1>FaceCrop</h1>
      <div>
        <input type="file" accept="image/*" onChange={onSelectFile} />
      </div>
      <div className="Preview">
        <div className="Original">
          <h2>original</h2>
          {src && (
            <ReactCrop
              src={src}
              crop={crop}
              ruleOfThirds
              onImageLoaded={onImageLoaded}
              onComplete={onCropComplete}
              onChange={onCropChange}
            />
          )}
        </div>
        <div className="FaceCrop">
          <h2>after</h2>
          {croppedImageUrl && (
            <img alt="Crop" style={{ maxWidth: '100%' }} src={croppedImageUrl} />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;