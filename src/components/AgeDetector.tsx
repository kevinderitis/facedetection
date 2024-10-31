import React, { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';
import { Camera, AlertCircle, RefreshCcw, MessageCircle } from 'lucide-react';
import { loadRequiredModels } from '../services/faceDetectionService';

interface AgeDetectorProps {
  onChatStart: () => void;
}

export const AgeDetector: React.FC<AgeDetectorProps> = ({ onChatStart }) => {
  const webcamRef = useRef<Webcam>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [ages, setAges] = useState<number[]>([]);
  const [detectedAge, setDetectedAge] = useState<number | null>(null);
  const [realAge, setRealAge] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(5);
  const [scanFailed, setScanFailed] = useState(false);

  const videoConstraints = {
    facingMode: 'user'
  };

  useEffect(() => {
    const initializeModels = async () => {
      try {
        setIsLoading(true);
        const success = await loadRequiredModels();
        if (!success) {
          setLoadError(true);
        }
      } catch (error) {
        console.error('Error initializing models:', error);
        setLoadError(true);
      } finally {
        setIsLoading(false);
      }
    };

    initializeModels();
  }, []);

  const startScanning = () => {
    setIsScanning(true);
    setTimeLeft(5);
    setAges([]);
    setScanFailed(false);
    setDetectedAge(null);
    setRealAge(null);
  };

  useEffect(() => {
    if (!isScanning || loadError || isLoading) return;

    let interval: NodeJS.Timeout;
    let detectionInterval: NodeJS.Timeout;

    detectionInterval = setInterval(async () => {
      if (webcamRef.current?.video) {
        try {
          const detection = await faceapi
            .detectSingleFace(
              webcamRef.current.video,
              new faceapi.TinyFaceDetectorOptions()
            )
            .withAgeAndGender();

          if (detection) {
            setAges(prev => [...prev, Math.round(detection.age)]);
          }
        } catch (error) {
          console.error('Detection error:', error);
        }
      }
    }, 1000);

    interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          clearInterval(detectionInterval);
          if (ages.length > 0) {
            const avgAge = Math.round(
              ages.reduce((acc, age) => acc + age, 0) / ages.length
            );
            setDetectedAge(avgAge);
          } else {
            setScanFailed(true);
          }
          setIsScanning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(detectionInterval);
    };
  }, [isScanning, isLoading, loadError, ages]);

  const handleRealAgeSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const age = Number(formData.get('realAge'));
    setRealAge(age);
  };

  if (loadError) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Error al cargar los modelos
          </h3>
          <p className="text-gray-600 mb-4">
            No se pudieron cargar los modelos de detección facial. Por favor, intenta de nuevo más tarde.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando modelos de detección...</p>
        </div>
      );
    }

    if (scanFailed) {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg text-center">
            <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No se pudo detectar tu rostro
            </h3>
            <p className="text-gray-600 mb-4">
              Asegúrate de estar bien iluminado y mirando directamente a la cámara.
            </p>
            <button
              onClick={startScanning}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center mx-auto"
            >
              <RefreshCcw className="w-4 h-4 mr-2" />
              Intentar nuevamente
            </button>
          </div>
        </div>
      );
    }

    if (detectedAge !== null) {
      if (realAge === null) {
        return (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg text-center">
              <h3 className="text-3xl font-bold text-gray-800 mb-6">
                ¡Resultado!
              </h3>
              <p className="text-2xl text-purple-600 font-semibold mb-8">
                Tienes aproximadamente {detectedAge} años
              </p>
              <form onSubmit={handleRealAgeSubmit} className="space-y-4">
                <div>
                  <label htmlFor="realAge" className="block text-gray-700 mb-2">
                    ¿Cuál es tu edad real?
                  </label>
                  <input
                    type="number"
                    id="realAge"
                    name="realAge"
                    min="0"
                    max="120"
                    required
                    className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-500"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Confirmar
                </button>
              </form>
            </div>
          </div>
        );
      }

      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg text-center">
            <h3 className="text-3xl font-bold text-gray-800 mb-6">
              Comparación
            </h3>
            <p className="text-xl mb-4">
              Edad detectada: <span className="font-semibold">{detectedAge}</span>
            </p>
            <p className="text-xl mb-6">
              Tu edad real: <span className="font-semibold">{realAge}</span>
            </p>
            <p className="text-lg text-purple-600 font-medium mb-6">
              {realAge > detectedAge
                ? '¡Te ves más joven de lo que eres! 🎉'
                : realAge < detectedAge
                ? 'La cámara debe estar cansada... ¡Te ves más joven en persona! 😊'
                : '¡Exactamente! ¡Di en el clavo! 🎯'}
            </p>
            <div className="space-y-4">
              <button
                onClick={startScanning}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center mx-auto"
              >
                <RefreshCcw className="w-4 h-4 mr-2" />
                Intentar nuevamente
              </button>
              <button
                onClick={onChatStart}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center mx-auto"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Ir al chat
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <Webcam
              ref={webcamRef}
              className="w-full md:h-[400px] object-cover"
              mirrored
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
            />
            {isScanning && (
              <div className="absolute top-4 right-4 bg-white bg-opacity-90 rounded-full px-4 py-2 shadow-md">
                <span className="text-lg font-semibold text-purple-600">
                  {timeLeft}s
                </span>
              </div>
            )}
          </div>
          
          <p className="text-center text-white text-lg font-light">
            ¿Querés saber qué edad aparentás?
          </p>

          {!isScanning && (
            <button
              onClick={startScanning}
              className="w-full bg-white text-purple-600 py-4 px-6 rounded-lg hover:bg-opacity-90 transition-colors font-semibold flex items-center justify-center"
            >
              <Camera className="w-6 h-6 mr-2" />
              Descubre tu edad
            </button>
          )}
        </div>
      </div>
    );
  };

  return renderContent();
};