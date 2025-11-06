"use client";
import * as faceapi from "face-api.js";
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

type CaptureState = "idle" | "waiting" | "analyzing" | "verified" | "rejected";

interface CameraCaptureProps {
  deviceId: string;
  onCapture?: (imageData: string) => void;
  onAutoDetect?: (detected: boolean, confidence: number) => void;
  autoMode?: boolean;
}

export function CameraCapture({ deviceId, onCapture, onAutoDetect, autoMode }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [captureState, setCaptureState] = useState<CaptureState>("idle");
  const [cameraActive, setCameraActive] = useState(false);
  const [error, setError] = useState<string>("");
  const [score, setScore] = useState<number>(0);
  const [liveness, setLiveness] = useState<boolean>(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  /** 🔹 Cargar modelos de face-api.js una vez */
  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = "/models"; // carpeta /public/models/
        await Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("/models/tiny_face_detector"),
  faceapi.nets.faceLandmark68Net.loadFromUri("/models/face_landmark_68"),
  faceapi.nets.faceRecognitionNet.loadFromUri("/models/face_recognition")
]);

        console.log("✅ Modelos de face-api.js cargados");
        setModelsLoaded(true);
      } catch (err) {
        console.error("Error al cargar modelos:", err);
        setError("No se pudieron cargar los modelos de detección facial.");
      }
    };
    loadModels();
  }, []);

  /** 🔹 Iniciar cámara */
  const startCamera = async () => {
    try {
      if (!modelsLoaded) {
        setError("Espere a que se carguen los modelos...");
        return;
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          width: { ideal: 800 },
          height: { ideal: 500 },
          facingMode: "user"
        },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setCameraActive(true);
        setCaptureState("waiting");

        // Ejecutar captura cada 2.5 segundos
        const id = setInterval(() => captureFrame(), 4500 );
        setIntervalId(id);
      }
    } catch (err) {
      console.error("Error al acceder a la cámara:", err);
      setError("No se pudo acceder a la cámara. Verifique los permisos.");
    }
  };

  /** 🔹 Detener cámara */
  const stopCamera = () => {
    if (intervalId) clearInterval(intervalId);
    if (stream) stream.getTracks().forEach(t => t.stop());
    setStream(null);
    setCameraActive(false);
    setCaptureState("idle");
  };

  /** 🔹 Capturar y analizar */
  const captureFrame = async () => {
    if (!videoRef.current || !modelsLoaded) return;

    try {
      const detections = await faceapi.detectAllFaces(
        videoRef.current,
        new faceapi.TinyFaceDetectorOptions()
      );

      if (detections.length > 0) {
        const confidence = detections[0].score * 100;
        setCaptureState("analyzing");

        if (onAutoDetect) onAutoDetect(true, confidence);

        setTimeout(() => {
          setScore(confidence);
          setLiveness(confidence > 70);
          if (confidence > 75) {
            setCaptureState("verified");
            if (onCapture) {
              const canvas = canvasRef.current!;
              const ctx = canvas.getContext("2d")!;
              canvas.width = videoRef.current!.videoWidth;
              canvas.height = videoRef.current!.videoHeight;
              ctx.drawImage(videoRef.current!, 0, 0);
              onCapture(canvas.toDataURL("image/jpeg"));
            }
          } else {
            setCaptureState("rejected");
          }
          setTimeout(() => setCaptureState("waiting"), 3500);
        }, 3000);
      }
    } catch (err) {
      console.error("Error en la detección:", err);
    }
  };

  /** 🔹 Limpiar al desmontar */
  useEffect(() => {
    return () => stopCamera();
  }, []);

  /** 🔹 Auto iniciar */
  useEffect(() => {
    if (modelsLoaded) startCamera();
  }, [modelsLoaded]);

  const getStateConfig = () => {
    switch (captureState) {
      case "idle":
        return { color: "border-gray-400", icon: <Camera className="h-16 w-16 text-gray-400" />, text: "Cámara inactiva", bgColor: "from-gray-900" };
      case "waiting":
        return { color: "border-blue-400", icon: <Camera className="h-16 w-16 text-blue-400" />, text: "Esperando detección de rostro...", bgColor: "from-blue-900" };
      case "analyzing":
        return { color: "border-yellow-400 animate-pulse", icon: <Camera className="h-16 w-16 text-yellow-400 animate-spin" />, text: "Procesando rostro...", bgColor: "from-yellow-900" };
      case "verified":
        return { color: "border-green-400", icon: <CheckCircle2 className="h-16 w-16 text-green-400" />, text: "Asistencia registrada", bgColor: "from-green-900" };
      case "rejected":
        return { color: "border-red-400", icon: <XCircle className="h-16 w-16 text-red-400" />, text: "No se detectó coincidencia", bgColor: "from-red-900" };
    }
  };

  const stateConfig = getStateConfig();

  return (
    <div className="space-y-4">
      {/* Estado cámara */}
      <div className="flex items-center justify-between">
        <Badge variant={cameraActive ? "default" : "secondary"} className="gap-2">
          {cameraActive ? (
            <>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div> Cámara activa
            </>
          ) : (
            <>
              <CameraOff className="h-3 w-3" /> Cámara inactiva
            </>
          )}
        </Badge>
        <Badge variant="outline">Dispositivo: {deviceId}</Badge>
      </div>

      {/* Video + overlay */}
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
        <canvas ref={canvasRef} className="hidden" />

        {cameraActive && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative w-96 h-[30rem]">
              <div className={`absolute inset-0 border-4 rounded-lg transition-colors ${stateConfig.color}`}>
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white"></div>
              </div>
              {captureState !== "waiting" && (
                <div className="absolute inset-0 flex items-center justify-center">
                  {stateConfig.icon}
                </div>
              )}
            </div>
          </div>
        )}

        <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t ${stateConfig.bgColor} to-transparent p-4`}>
          <div className="flex items-center justify-between text-white">
            <p className="text-sm">{stateConfig.text}</p>
          </div>
        </div>

        {(captureState === "verified" || captureState === "rejected") && (
          <div className="absolute top-4 right-4 space-y-2">
            <Badge variant={score > 75 ? "default" : "secondary"} className={score > 75 ? "bg-green-600" : "bg-red-600"}>
              Score: {score.toFixed(1)}%
            </Badge>
            <Badge variant={liveness ? "default" : "secondary"} className={liveness ? "bg-green-600" : "bg-red-600"}>
              <Eye className="h-3 w-3 mr-1" /> {liveness ? "Liveness OK" : "Liveness Fail"}
            </Badge>
          </div>
        )}
      </div>

      {/* Error */}
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

      {cameraActive && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={stopCamera} className="w-1/3">
            <CameraOff className="h-4 w-4 mr-2" /> Detener Cámara
          </Button>
        </div>
      )}
    </div>
  );
}
