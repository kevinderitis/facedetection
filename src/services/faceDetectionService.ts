import * as faceapi from 'face-api.js';

const MODEL_URL = '/models';

export const loadRequiredModels = async () => {
  try {
    const modelPromises = [
      faceapi.nets.tinyFaceDetector.load(MODEL_URL),
      faceapi.nets.ageGenderNet.load(MODEL_URL)
    ];
    
    await Promise.all(modelPromises);
    return true;
  } catch (error) {
    console.error('Error loading face detection models:', error);
    return false;
  }
};