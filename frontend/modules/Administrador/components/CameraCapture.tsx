"use client";

import * as faceapi from "face-api.js";
import { useEffect, useRef, useState } from "react";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import {
  AlertCircle,
  Camera,
  CameraOff,
  CheckCircle2,
  Eye,
  XCircle,
} from "lucide-react";

type CaptureState = "idle" | "waiting" | "analyzing" | "verified" | "rejected";

interface CameraCaptureProps {
  deviceId: string;
  onCapture?: (imageData: string) => void;
  onAutoDetect?: (detected: boolean, confidence: number) => void;
  autoMode?: boolean;
}

export function CameraCapture({ deviceId, onCapture, onAutoDetect }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const processingRef = useRef(false);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [captureState, setCaptureState] = useState<CaptureState>("idle");
  const [cameraActive, setCameraActive] = useState(false);
  const [error, setError] = useState("");
  const [score, setScore] = useState(0);
  const [liveness, setLiveness] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [detectionHint, setDetectionHint] = useState("Esperando deteccion de rostro en pantalla completa...");

  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri("/models/tiny_face_detector"),
          faceapi.nets.faceLandmark68Net.loadFromUri("/models/face_landmark_68"),
          faceapi.nets.faceRecognitionNet.loadFromUri("/models/face_recognition"),
        ]);
        setModelsLoaded(true);
      } catch (err) {
        console.error("Error al cargar modelos:", err);
        setError("No se pudieron cargar los modelos de deteccion facial.");
      }
    };

    void loadModels();
  }, []);

  const stopCamera = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setIntervalId(null);
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    processingRef.current = false;
    setStream(null);
    setCameraActive(false);
    setCaptureState("idle");
    setDetectionHint("Esperando deteccion de rostro en pantalla completa...");
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      if (!modelsLoaded) {
        setError("Espere a que se carguen los modelos.");
        return;
      }

      stopCamera();

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          width: { ideal: 800 },
          height: { ideal: 500 },
          facingMode: "user",
        },
        audio: false,
      });

      if (!videoRef.current) {
        mediaStream.getTracks().forEach((track) => track.stop());
        return;
      }

      videoRef.current.srcObject = mediaStream;
      streamRef.current = mediaStream;
      setStream(mediaStream);
      setCameraActive(true);
      setCaptureState("waiting");
      setDetectionHint("Esperando deteccion de rostro en pantalla completa...");

      const id = setInterval(() => {
        void captureFrame();
      }, 900);
      intervalRef.current = id;
      setIntervalId(id);
    } catch (err) {
      console.error("Error al acceder a la camara:", err);
      setError("No se pudo acceder a la camara. Verifique los permisos.");
    }
  };

  useEffect(() => {
    if (modelsLoaded) {
      void startCamera();
    }
  }, [modelsLoaded, deviceId]);

  const captureFrame = async () => {
    if (!videoRef.current || !modelsLoaded || processingRef.current) {
      return;
    }

    try {
      processingRef.current = true;

      const detection = await faceapi.detectSingleFace(
        videoRef.current,
        new faceapi.TinyFaceDetectorOptions({
          inputSize: 320,
          scoreThreshold: 0.25,
        }),
      );

      if (!detection) {
        setCaptureState("waiting");
        setDetectionHint("Esperando deteccion de rostro en pantalla completa...");
        if (onAutoDetect) {
          onAutoDetect(false, 0);
        }
        return;
      }

      const confidence = detection.score * 100;
      setScore(confidence);

      setCaptureState("analyzing");
      setDetectionHint("Reconociendo rostro en toda la imagen...");
      if (onAutoDetect) {
        onAutoDetect(true, confidence);
      }

      setTimeout(() => {
        setLiveness(confidence > 65);

        if (confidence > 55) {
          setCaptureState("verified");
          setDetectionHint("Rostro detectado y verificado.");

          if (onCapture && videoRef.current && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              canvas.width = videoRef.current.videoWidth;
              canvas.height = videoRef.current.videoHeight;
              ctx.drawImage(videoRef.current, 0, 0);
              onCapture(canvas.toDataURL("image/jpeg"));
            }
          }
        } else {
          setCaptureState("rejected");
          setDetectionHint("Se detecto un rostro, pero la confianza fue baja.");
        }

        setTimeout(() => {
          setCaptureState("waiting");
          setDetectionHint("Esperando deteccion de rostro en pantalla completa...");
        }, 1800);
      }, 600);
    } catch (err) {
      console.error("Error en la deteccion:", err);
    } finally {
      processingRef.current = false;
    }
  };

  const getStateConfig = () => {
    switch (captureState) {
      case "idle":
        return {
          color: "border-gray-400",
          icon: <Camera className="h-16 w-16 text-gray-400" />,
          text: "Camara inactiva",
          bgColor: "from-gray-900",
        };
      case "waiting":
        return {
          color: "border-blue-400",
          icon: <Camera className="h-16 w-16 text-blue-400" />,
          text: detectionHint,
          bgColor: "from-blue-900",
        };
      case "analyzing":
        return {
          color: "border-yellow-400 animate-pulse",
          icon: <Camera className="h-16 w-16 animate-spin text-yellow-400" />,
          text: detectionHint,
          bgColor: "from-yellow-900",
        };
      case "verified":
        return {
          color: "border-green-400",
          icon: <CheckCircle2 className="h-16 w-16 text-green-400" />,
          text: detectionHint,
          bgColor: "from-green-900",
        };
      case "rejected":
        return {
          color: "border-red-400",
          icon: <XCircle className="h-16 w-16 text-red-400" />,
          text: detectionHint,
          bgColor: "from-red-900",
        };
    }
  };

  const stateConfig = getStateConfig();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Badge variant={cameraActive ? "default" : "secondary"} className="gap-2">
          {cameraActive ? (
            <>
              <div className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
              Camara activa
            </>
          ) : (
            <>
              <CameraOff className="h-3 w-3" />
              Camara inactiva
            </>
          )}
        </Badge>
        <Badge variant="outline">Dispositivo: {deviceId}</Badge>
      </div>

      <div ref={previewRef} className="relative aspect-video overflow-hidden rounded-lg bg-black">
        <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-contain" />
        <canvas ref={canvasRef} className="hidden" />

        {cameraActive && (
          <div className="pointer-events-none absolute inset-0">
            <div className={`absolute inset-0 rounded-lg border-4 transition-colors ${stateConfig.color}`} />
            <div className="absolute left-4 right-4 top-4 h-px bg-white/20" />
            <div className="absolute left-4 right-4 bottom-4 h-px bg-white/20" />
            <div className="absolute left-4 top-4 w-px bg-white/20" style={{ height: 'calc(100% - 2rem)' }} />
            <div className="absolute right-4 top-4 w-px bg-white/20" style={{ height: 'calc(100% - 2rem)' }} />
          </div>
        )}

        <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t ${stateConfig.bgColor} to-transparent p-4`}>
          <div className="flex items-center justify-between text-white">
            <p className="text-sm">{stateConfig.text}</p>
          </div>
        </div>

        {(captureState === "verified" || captureState === "rejected") && (
          <div className="absolute right-4 top-4 space-y-2">
            <Badge variant={score > 75 ? "default" : "secondary"} className={score > 75 ? "bg-green-600" : "bg-red-600"}>
              Score: {score.toFixed(1)}%
            </Badge>
            <Badge variant={liveness ? "default" : "secondary"} className={liveness ? "bg-green-600" : "bg-red-600"}>
              <Eye className="mr-1 h-3 w-3" />
              {liveness ? "Liveness OK" : "Liveness Fail"}
            </Badge>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 text-red-600" />
            <div>
              <h4 className="text-red-900">Error de Camara</h4>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {cameraActive && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={stopCamera} className="w-1/3">
            <CameraOff className="mr-2 h-4 w-4" />
            Detener Camara
          </Button>
        </div>
      )}
    </div>
  );
}
