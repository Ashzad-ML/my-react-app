import React, { useState } from 'react';
import axios from 'axios';

const ImageUpload = () => {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [uploadType, setUploadType] = useState('file'); 

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && !['image/jpeg', 'image/png'].includes(selectedFile.type)) {
      setError('Only Image files are allowed');
      setFile(null);
      setResult(null);
      return;
    }
    setFile(selectedFile);
    setResult(null);
    setError(null);
  };

  const handleUploadTypeChange = (e) => {
    setUploadType(e.target.value);
    setFile(null);
    setResult(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a valid image file');
      return;
    }

    if (uploadType === 'file') {
      const formData = new FormData();
      formData.append('image', file);

      try {
        const response = await axios.post('http://localhost:8080/predict', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        setResult(response.data);
        setError(null);
      } catch (error) {
        console.error('Error uploading the file:', error);
        setError('Error uploading the file');
      }
    } else if (uploadType === 'base64') {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result;
        try {
          const response = await axios.post('http://localhost:8080/base64_image_predict', {
            image: base64Image,
          });
          setResult(response.data);
          setError(null);
        } catch (error) {
          console.error('Error uploading the base64 image:', error);
          setError('Error uploading the base64 image');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="toggle-container">
          <input
            type="radio"
            id="upload-file"
            value="file"
            checked={uploadType === 'file'}
            onChange={handleUploadTypeChange}
          />
          <label htmlFor="upload-file">Json Format</label>
          <input
            type="radio"
            id="upload-base64"
            value="base64"
            checked={uploadType === 'base64'}
            onChange={handleUploadTypeChange}
          />
          <label htmlFor="upload-base64">Base64 Format</label>
        </div>
        <input type="file" className="file_button" onChange={handleFileChange} />
        <button type="submit">Upload and Predict</button>
      </form>
      {error && <p style={{ color: 'white' }}>{error}</p>}
      {result && (
        <div>
          <h3>Prediction Result:</h3>
          <p>Result: {result.result}</p>
          <h4>Percentages:</h4>
          <ul>
            {Object.entries(result.percentages).map(([className, percentage]) => (
              <li key={className}>{className}: {percentage}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;