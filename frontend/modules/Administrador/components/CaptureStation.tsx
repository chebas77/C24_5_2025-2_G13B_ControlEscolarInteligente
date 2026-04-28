"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { CameraCapture } from "./CameraCapture";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import { CheckCircle2, Clock, Monitor, XCircle } from "lucide-react";

interface CaptureStationProps {
  deviceId: string;
  stationMode: "entrada" | "salida";
  onBack: () => void;
}

interface CaptureRecord {
  id: string;
  time: string;
  eventType?: "entrada" | "salida";
  student: string;
  result: "verified" | "rejected";
  score: number;
  message: string;
}

interface MatchResponse {
  matched: boolean;
  score: number;
  time?: string;
  eventType?: "entrada" | "salida";
  message?: string;
  error?: string;
  student?: {
    name: string;
    code: string;
    grade?: string;
    section?: string;
  };
}

interface TodayRecordsResponse {
  records?: CaptureRecord[];
  error?: string;
}

const API_BASE_URL = "http://localhost:8000/api/reports";

export function CaptureStation({ deviceId, stationMode, onBack }: CaptureStationProps) {
  const [recentCaptures, setRecentCaptures] = useState<CaptureRecord[]>([]);
  const [currentTime, setCurrentTime] = useState("");
  const [matchStatus, setMatchStatus] = useState("Esperando captura valida...");
  const [matchStatusType, setMatchStatusType] = useState<"idle" | "success" | "error">("idle");
  const [isMatching, setIsMatching] = useState(false);
  const matchingRef = useRef(false);
  const lastMatchAtRef = useRef(0);
  const statusHoldUntilRef = useRef(0);
  const statusTimerRef = useRef<NodeJS.Timeout | null>(null);

  const clearStatusTimer = () => {
    if (statusTimerRef.current) {
      clearTimeout(statusTimerRef.current);
      statusTimerRef.current = null;
    }
  };

  const setStationStatus = (
    message: string,
    type: "idle" | "success" | "error" = "idle",
    holdMs = 0,
  ) => {
    clearStatusTimer();
    setMatchStatus(message);
    setMatchStatusType(type);
    statusHoldUntilRef.current = holdMs > 0 ? Date.now() + holdMs : 0;

    if (holdMs > 0) {
      statusTimerRef.current = setTimeout(() => {
        setMatchStatus("Esperando captura valida...");
        setMatchStatusType("idle");
        statusHoldUntilRef.current = 0;
        statusTimerRef.current = null;
      }, holdMs);
    }
  };

  const loadTodayRecords = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/capture/today/`);
      const data: TodayRecordsResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "No se pudieron cargar los registros de hoy.");
      }

      setRecentCaptures(data.records || []);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error al cargar registros de hoy.";
      setStationStatus(message, "error", 7000);
    }
  };

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString("es-PE"));
    };

    updateTime();
    const id = setInterval(updateTime, 1000);
    return () => {
      clearInterval(id);
      clearStatusTimer();
    };
  }, []);

  useEffect(() => {
    void loadTodayRecords();
  }, []);

  const dataUrlToBlob = async (dataUrl: string) => {
    const response = await fetch(dataUrl);
    return response.blob();
  };

  const stationTitle = stationMode === "salida" ? "Puesto de Salida" : "Puesto de Entrada";
  const stationDescription =
    stationMode === "salida"
      ? "Alinee su rostro para registrar la salida."
      : "Alinee su rostro para registrar la entrada.";

  const handleCapture = async (imageData: string) => {
    const now = Date.now();
    if (matchingRef.current || now - lastMatchAtRef.current < 3500) {
      return;
    }

    try {
      matchingRef.current = true;
      lastMatchAtRef.current = now;
      setIsMatching(true);
      setStationStatus("Comparando rostro con plantillas guardadas...");

      const formData = new FormData();
      const imageBlob = await dataUrlToBlob(imageData);
      formData.append("image", imageBlob, `capture-${now}.jpg`);
      formData.append("deviceId", deviceId);
      formData.append("captureMode", stationMode);

      const response = await fetch(`${API_BASE_URL}/admin/capture/match/`, {
        method: "POST",
        body: formData,
      });
      const data: MatchResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "No se pudo procesar la captura.");
      }

      const studentLabel = data.matched && data.student
        ? `${data.student.name} (${data.student.code})`
        : "Sin coincidencia";
      const newCapture: CaptureRecord = {
        id: now.toString(),
        time: data.time || new Date().toLocaleTimeString("es-PE"),
        eventType: data.eventType,
        student: studentLabel,
        result: data.matched ? "verified" : "rejected",
        score: data.score || 0,
        message: data.message || "",
      };

      setRecentCaptures((prev) => [newCapture, ...prev.slice(0, 14)]);
      if (data.matched) {
        await loadTodayRecords();
      }
      setStationStatus(
        data.message || (data.matched ? "Alumno verificado." : "Rostro no reconocido."),
        data.matched ? "success" : "error",
        data.matched ? 4500 : 7000,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error inesperado en el matcheo.";
      setStationStatus(message, "error", 8000);
      setRecentCaptures((prev) => [
        {
          id: now.toString(),
          time: new Date().toLocaleTimeString("es-PE"),
          student: "Captura no procesada",
          result: "rejected",
          score: 0,
          message,
        },
        ...prev.slice(0, 14),
      ]);
    } finally {
      matchingRef.current = false;
      setIsMatching(false);
    }
  };

  const handleAutoCapture = (detected: boolean, confidence: number) => {
    if (isMatching || Date.now() < statusHoldUntilRef.current) {
      return;
    }

    if (!detected) {
      setStationStatus(confidence > 0 ? "Rostro fuera del marco." : "Esperando rostro...");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">{stationTitle}</h2>
        <Button variant="outline" onClick={onBack}>
          Volver
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <Badge variant="default">
          <Monitor className="mr-1 h-3 w-3" />
          Online
        </Badge>
        <Badge variant="outline">
          <Clock className="mr-1 h-3 w-3" />
          {currentTime || "--:--:--"}
        </Badge>
        <Badge variant="outline">
          {stationMode === "salida" ? "Salida" : "Entrada"}
        </Badge>
        <Badge
          variant={
            isMatching || matchStatusType === "success"
              ? "default"
              : matchStatusType === "error"
                ? "destructive"
                : "outline"
          }
          className={matchStatusType === "success" ? "bg-green-600 text-white" : undefined}
        >
          {isMatching ? "Matcheando..." : matchStatus}
        </Badge>
      </div>

      <Card className="border-2 border-gray-300">
        <CardHeader>
          <CardTitle>Verificacion Facial en Vivo</CardTitle>
          <CardDescription>{stationDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative w-full aspect-video overflow-hidden rounded-lg bg-black">
            <CameraCapture
              deviceId={deviceId}
              onAutoDetect={handleAutoCapture}
              onCapture={handleCapture}
              autoMode
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Registros de Hoy</CardTitle>
          <CardDescription>Marcaciones faciales guardadas durante el dia</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hora</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Estudiante</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Resultado</TableHead>
                  <TableHead>Detalle</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
              {recentCaptures.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-gray-500">
                    Aun no hay marcaciones guardadas hoy
                  </TableCell>
                </TableRow>
              ) : (
                recentCaptures.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{record.time}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {record.eventType === "salida" ? "Salida" : "Entrada"}
                      </Badge>
                    </TableCell>
                    <TableCell>{record.student}</TableCell>
                    <TableCell>{record.score.toFixed(1)}%</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          record.result === "verified"
                            ? "bg-green-600 text-white"
                            : "bg-red-600 text-white"
                        }
                      >
                        {record.result === "verified" ? (
                          <>
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Verificado
                          </>
                        ) : (
                          <>
                            <XCircle className="mr-1 h-3 w-3" />
                            Rechazado
                          </>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-600">{record.message}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
