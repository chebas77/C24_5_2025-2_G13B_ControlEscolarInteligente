import { useEffect, useRef, useState } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { 
  Camera, 
  CameraOff,
  CheckCircle2, 
  XCircle,
  AlertCircle,
  Eye
} from "lucide-react";

type CaptureState = 'idle' | 'waiting' | 'analyzing' | 'verified' | 'rejected';

interface CameraCaptureProps {
  deviceId: string;
  onCapture?: (imageData: string) => void;
}

export function CameraCapture({ deviceId, onCapture }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [captureState, setCaptureState] = useState<CaptureState>('idle');
  const [cameraActive, setCameraActive] = useState(false);
  const [error, setError] = useState<string>('');
  const [score, setScore] = useState<number>(0);
  const [liveness, setLiveness] = useState<boolean>(false);

  // Iniciar cámara
  const startCamera = async () => {
    try {
      setError('');
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 800 },
          height: { ideal: 500 },
          facingMode: 'user'
        },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setCameraActive(true);
        setCaptureState('waiting');
      }
    } catch (err) {
      console.error('Error al acceder a la cámara:', err);
      setError('No se pudo acceder a la cámara. Verifique los permisos.');
      setCaptureState('idle');
    }
  };

  // Detener cámara
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setCameraActive(false);
      setCaptureState('idle');
    }
  };

  // Capturar frame
  const captureFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);
        
        const imageData = canvas.toDataURL('image/jpeg');
        
        // Simular análisis
        setCaptureState('analyzing');
        
        setTimeout(() => {
          const randomScore = Math.random() * 100;
          const randomLiveness = Math.random() > 0.2;
          setScore(randomScore);
          setLiveness(randomLiveness);
          
          if (randomScore > 75 && randomLiveness) {
            setCaptureState('verified');
            if (onCapture) onCapture(imageData);
          } else {
            setCaptureState('rejected');
          }
          
          setTimeout(() => setCaptureState('waiting'), 3000);
        }, 2000);
      }
    }
  };

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const getStateConfig = () => {
    switch (captureState) {
      case 'idle':
        return {
          color: 'border-gray-400',
          icon: <Camera className="h-16 w-16 text-gray-400" />,
          text: 'Cámara inactiva',
          bgColor: 'from-gray-900'
        };
      case 'waiting':
        return {
          color: 'border-blue-400',
          icon: <Camera className="h-16 w-16 text-blue-400" />,
          text: 'Ajuste su posición dentro del marco.',
          bgColor: 'from-blue-900'
        };
      case 'analyzing':
        return {
          color: 'border-yellow-400 animate-pulse',
          icon: (
            <div className="animate-spin">
              <Camera className="h-16 w-16 text-yellow-400" />
            </div>
          ),
          text: 'Procesando rostro, por favor manténgase quieto.',
          bgColor: 'from-yellow-900'
        };
      case 'verified':
        return {
          color: 'border-green-400',
          icon: <CheckCircle2 className="h-16 w-16 text-green-400" />,
          text: 'Asistencia registrada correctamente.',
          bgColor: 'from-green-900'
        };
      case 'rejected':
        return {
          color: 'border-red-400',
          icon: <XCircle className="h-16 w-16 text-red-400" />,
          text: 'No se detectó coincidencia. Intente nuevamente.',
          bgColor: 'from-red-900'
        };
    }
  };

  const stateConfig = getStateConfig();

  return (
    <div className="space-y-4">
      {/* Camera Status Badge */}
      <div className="flex items-center justify-between">
        <Badge variant={cameraActive ? 'default' : 'secondary'} className="gap-2">
          {cameraActive ? (
            <>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              Cámara activa
            </>
          ) : (
            <>
              <CameraOff className="h-3 w-3" />
              Cámara inactiva
            </>
          )}
        </Badge>
        <Badge variant="outline">
          Dispositivo: {deviceId}
        </Badge>
      </div>

      {/* Video Container */}
      <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
        {/* Video Element */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${!cameraActive ? 'hidden' : ''}`}
        />

        {/* Canvas oculto para captura */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Placeholder cuando la cámara está inactiva */}
        {!cameraActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <div className="text-center">
              <Camera className="h-24 w-24 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Vista de Cámara</p>
              <p className="text-sm text-gray-500 mt-2">
                Presione "Iniciar Cámara" para comenzar
              </p>
            </div>
          </div>
        )}

        {/* Face Detection Overlay */}
        {cameraActive && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative w-64 h-80">
              {/* Marco de detección */}
              <div className={`absolute inset-0 border-4 rounded-lg transition-colors ${stateConfig.color}`}>
                {/* Esquinas del marco */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white"></div>
              </div>

              {/* Indicador central */}
              {captureState !== 'waiting' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  {stateConfig.icon}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Status Overlay */}
        <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t ${stateConfig.bgColor} to-transparent p-4`}>
          <div className="flex items-center justify-between text-white">
            <p className="text-sm">{stateConfig.text}</p>
            {captureState === 'analyzing' && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                <span className="text-xs">Analizando...</span>
              </div>
            )}
          </div>
        </div>

        {/* Metrics Overlay (when verified or rejected) */}
        {(captureState === 'verified' || captureState === 'rejected') && (
          <div className="absolute top-4 right-4 space-y-2">
            <Badge variant={score > 75 ? 'default' : 'secondary'} className={score > 75 ? 'bg-green-600' : 'bg-red-600'}>
              Score: {score.toFixed(1)}%
            </Badge>
            <Badge variant={liveness ? 'default' : 'secondary'} className={liveness ? 'bg-green-600' : 'bg-red-600'}>
              <Eye className="h-3 w-3 mr-1" />
              {liveness ? 'Liveness OK' : 'Liveness Fail'}
            </Badge>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <h4 className="text-red-900">Error de Cámara</h4>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Camera Controls */}
      <div className="flex gap-3">
        {!cameraActive ? (
          <Button 
            onClick={startCamera}
            className="flex-1 bg-red-600 hover:bg-red-700"
          >
            <Camera className="h-4 w-4 mr-2" />
            Iniciar Cámara
          </Button>
        ) : (
          <>
            <Button 
              onClick={captureFrame}
              disabled={captureState !== 'waiting'}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              <Camera className="h-4 w-4 mr-2" />
              {captureState === 'analyzing' ? 'Procesando...' : 'Capturar Asistencia'}
            </Button>
            <Button 
              variant="outline"
              onClick={stopCamera}
            >
              <CameraOff className="h-4 w-4 mr-2" />
              Detener Cámara
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
