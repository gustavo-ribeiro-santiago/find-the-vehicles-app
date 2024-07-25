'use client';
import styles from './page.module.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import React, { useState, useRef, useEffect } from 'react';

export default function Home() {
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [boxes, setBoxes] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    const file = event.dataTransfer.files[0];
    if (!file) return;
    fetchPrediction(file);
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    fetchPrediction(file);
  };

  const handleSampleImageClick = async (event) => {
    const img = event.target;
    if (!img.src) return;
    const response = await fetch(img.src);
    const blob = await response.blob();
    const file = new File([blob], 'clicked-image.jpg', { type: blob.type });
    await fetchPrediction(file);
  };

  const fetchPrediction = (file) => {
    const imageUrl = URL.createObjectURL(file);
    setImageSrc(imageUrl);
    const formData = new FormData();
    formData.append('file', file);
    (async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/predict/', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
          },
          body: formData,
        });
        if (response.ok) {
          const data = await response.json();
          console.log('Image uploaded successfully:', data);
          setBoxes(data);
        } else {
          console.error('Image upload failed:', response.statusText);
        }
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    })();
  };

  useEffect(() => {
    // Draw images and boxes if 'imageSrc' or 'boxes' change
    if (imageSrc && boxes.length > 0) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.src = imageSrc;

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        boxes.forEach((box) => {
          ctx.strokeStyle = 'red';
          ctx.lineWidth = img.width > 3000 ? 5 : 2;
          ctx.strokeRect(
            box.xmin,
            box.ymin,
            box.xmax - box.xmin,
            box.ymax - box.ymin
          );
          ctx.fillStyle = 'red';
          ctx.font = img.width > 3000 ? '40px Arial' : '16px Arial';
          ctx.fillText(
            `${box.label} (${(box.confidence * 100).toFixed(1)}%)`,
            box.xmin,
            box.ymin > 10 ? box.ymin - 5 : box.ymin + 10
          );
        });
      };
    }
  }, [imageSrc, boxes]);

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <i className="bi bi-car-front-fill fs-1 mb-1"></i>
        <h1>Find the Vehicles</h1>
      </div>
      <About />
      <div className={styles.gridContainer}>
        <div className={styles.column}>
          <InputBox
            handleUploadClick={handleUploadClick}
            handleDragOver={handleDragOver}
            handleDragLeave={handleDragLeave}
            handleDrop={handleDrop}
            isDragging={isDragging}
            fileInputRef={fileInputRef}
            handleFileChange={handleFileChange}
          />
          <Samples handleSampleImageClick={handleSampleImageClick} />
        </div>
        <div className={styles.column}>
          <Results imageSrc={imageSrc} canvasRef={canvasRef} boxes={boxes} />
        </div>
      </div>
    </main>
  );
}

const About = () => {
  return (
    <div
      className={styles.about + ' accordion mt-3 mb-2'}
      id="accordionExample"
    >
      <div className="accordion-item">
        <h2 className="accordion-header">
          <button
            className="accordion-button collapsed"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#collapseOne"
            aria-expanded="true"
            aria-controls="collapseOne"
          >
            <i className="bi bi-info-circle mx-2"></i>
            <span className="mx-3">About this Web App</span>
          </button>
        </h2>
        <div
          id="collapseOne"
          className="accordion-collapse collapse"
          data-bs-parent="#accordionExample"
        >
          <div className="accordion-body">
            <strong>Introduction</strong>
            <br />
            This application uses the power of deep learning and computer vision
            to detect and annotate vehicles within images.
            <br />
            <br />
            <strong>How It Works</strong>
            <ol>
              <li>
                <strong>Upload an Image:</strong> Users can upload an image
                through the intuitive drag-and-drop interface.
              </li>
              <li>
                <strong>API Call:</strong> Once an image is uploaded, it is sent
                to the FastAPI backend, which processes the image using a deep
                learning model based on YOLOv5 and trained through transfer
                learning.
              </li>
              <li>
                <strong>Receive Predictions:</strong> The model returns the
                detected vehicles along with their categories, confidence
                levels, and bounding box coordinates.
              </li>
              <li>
                <strong>Display Results:</strong> The frontend displays the
                annotated image with bounding boxes and labels. Detailed
                information about each detected vehicle, including the category,
                confidence level, and coordinates, is shown below the image.
              </li>
            </ol>
            <strong>Use Cases</strong>
            <br />
            The app aims to provide an easy-to-use interface for vehicle
            detection tasks, which in turn are suitable for various applications
            such as:
            <ol>
              <li>
                <strong> Security:</strong>
                <ul>
                  <li>
                    <strong>Traffic Monitoring:</strong> Monitor traffic and
                    detect any suspicious vehicles in real-time.
                  </li>
                  <li>
                    <strong>Parking Surveillance:</strong> Integrate with
                    parking lot surveillance systems to detect unauthorized
                    vehicles or to manage parking space occupancy efficiently.
                  </li>
                </ul>
              </li>
              <li>
                <strong> Retail Analytics:</strong>
                <ul>
                  <li>
                    <strong>Customer Behavior Analysis:</strong> Retailers can
                    use vehicle detection to analyze customer behavior, such as
                    identifying peak times and understanding shopping patterns
                    based on vehicle influx.
                  </li>
                  <li>
                    <strong>Advertisement Effectiveness:</strong> Measure the
                    impact of advertisements placed near roadways by tracking
                    the number of vehicles passing by.
                  </li>
                </ul>
              </li>
              <li>
                <strong> Automated Image Tagging:</strong>
                <ul>
                  <li>
                    <strong>Digital Asset Management:</strong> Automatically tag
                    vehicle images in large digital asset libraries, making it
                    easier to search and organize photos.
                  </li>
                  <li>
                    <strong>Content Moderation:</strong> Enhance content
                    moderation systems by detecting and tagging vehicles in
                    user-uploaded images across social media platforms.
                  </li>
                </ul>
              </li>
              <li>
                <strong> Autonomous Driving:</strong>
                <ul>
                  <li>
                    <strong>Obstacle Detection:</strong> The model&apos;s detection
                    capabilities can be integrated into autonomous driving
                    systems to detect other vehicles on the road, aiding in
                    navigation and collision avoidance.
                  </li>
                  <li>
                    <strong>Traffic Sign Recognition:</strong> The model can be
                    extended to recognize traffic signs and signals, providing
                    crucial information for autonomous vehicles to make informed
                    driving decisions.
                  </li>
                </ul>
              </li>
            </ol>
            For more information, please visit the project&apos;s GitHub repository
            at{' '}
            <a href="https://github.com/gustavo-ribeiro-santiago/find-the-vehicles-app">
              https://github.com/gustavo-ribeiro-santiago/find-the-vehicles-app
            </a>
            .
            <br />
            <br />I hope you find this tool helpful and look forward to your
            feedback!
          </div>
        </div>
      </div>
    </div>
  );
};

const InputBox = ({
  handleUploadClick,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  isDragging,
  fileInputRef,
  handleFileChange,
}) => {
  return (
    <div
      className={styles.dottedSquare + ' my-3'}
      onClick={handleUploadClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        borderColor: isDragging ? 'blue' : 'black',
        backgroundColor: isDragging ? 'rgba(0, 165, 255, 0.2)' : '#fff',
        cursor: isDragging ? 'copy' : 'pointer',
      }}
    >
      <i className="bi bi-upload mx-5 mt-3 fs-1"></i>
      <div className="mx-5 mb-3 text-center">
        Click here to upload an image or simply drag and drop an image here
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
          accept="image/*"
        />
      </div>
    </div>
  );
};

const Samples = ({ handleSampleImageClick }) => {
  return (
    <>
      <div className="my-3">Sample Images:</div>
      <div>
        <img
          className={styles.sampleImage + ' mx-2'}
          onClick={handleSampleImageClick}
          src="example1.jpg"
        ></img>
        <img
          className={styles.sampleImage + ' mx-2'}
          onClick={handleSampleImageClick}
          src="example2.jpg"
        ></img>
        <img
          className={styles.sampleImage + ' mx-2'}
          onClick={handleSampleImageClick}
          src="example3.jpg"
        ></img>
      </div>
    </>
  );
};

const Results = ({ imageSrc, canvasRef, boxes }) => {
  return (
    <>
      {imageSrc && (
        <canvas
          ref={canvasRef}
          style={{ maxWidth: '100%', maxHeight: '100%' }}
        />
      )}
      <div>
        {boxes.length < 1 ? (
          'Results will be displayed here.'
        ) : (
          <div className="mt-3">
            <h5>Detected Vehicles:</h5>
            <ul>
              {boxes.map((box, index) => (
                <li key={index}>
                  <strong>Label:</strong> {box.label},{' '}
                  <strong>Confidence:</strong>{' '}
                  {`${(box.confidence * 100).toFixed(1)}%`},{' '}
                  <strong>Coordinates:</strong> ({box.xmin.toFixed(2)},{' '}
                  {box.ymin.toFixed(2)}) to ({box.xmax.toFixed(2)},{' '}
                  {box.ymax.toFixed(2)})
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );
};
