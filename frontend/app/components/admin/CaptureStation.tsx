"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { CameraCapture } from "./CameraCapture";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { 
  Monitor, 
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
} from "lucide-react";

interface CaptureStationProps {
  deviceId: string;
  onBack: () => void;
}

interface CaptureRecord {
  id: string;
  time: string;
  student: string;
  result: 'verified' | 'rejected';
  score: number;
}

export function CaptureStation({ deviceId, onBack }: CaptureStationProps) {
  const [recentCaptures, setRecentCaptures] = useState<CaptureRecord[]>([]);

  const handleAutoCapture = (detected: boolean, confidence: number) => {
    // Solo registrar si se detecta rostro con alta confianza
    if (detected && confidence > 80) {
      const newCapture: CaptureRecord = {
        id: Date.now().toString(),
        time: new Date().toLocaleTimeString('es-PE'),
        student: "Estudiante Detectado",
        result: confidence > 85 ? "verified" : "rejected",
        score: confidence,
      };
      setRecentCaptures(prev => [newCapture, ...prev.slice(0, 4)]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header minimalista */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">
          Puesto de Captura
        </h2>
        <Button variant="outline" onClick={onBack}>
          ← Volver
        </Button>
      </div>

      {/* Estado */}
      <div className="flex items-center gap-3">
        <Badge variant="default">
          <Monitor className="h-3 w-3 mr-1" />
          Online
        </Badge>
        <Badge variant="outline">
          <Clock className="h-3 w-3 mr-1" />
          {new Date().toLocaleTimeString("es-PE")}
        </Badge>
      </div>

      {/* Cámara principal */}
      <Card className="border-2 border-gray-300">
        <CardHeader>
          <CardTitle>Verificación Facial en Vivo</CardTitle>
          <CardDescription>
            Alinee su rostro dentro del marco para registrar asistencia
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
            <CameraCapture
              deviceId={deviceId}
              onAutoDetect={handleAutoCapture}
              
              autoMode
            />
            <div className="absolute inset-0 border-4 border-green-400/50 rounded-xl pointer-events-none" />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-1 text-sm rounded-full">
              Esperando detección de rostro...
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Últimos registros compactos */}
      <Card>
        <CardHeader>
          <CardTitle>Últimos Registros</CardTitle>
          <CardDescription>Validaciones recientes</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hora</TableHead>
                <TableHead>Estudiante</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Resultado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentCaptures.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                    Aún no hay capturas realizadas
                  </TableCell>
                </TableRow>
              ) : (
                recentCaptures.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.time}</TableCell>
                    <TableCell>{r.student}</TableCell>
                    <TableCell>{r.score.toFixed(1)}%</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          r.result === "verified"
                            ? "bg-green-600 text-white"
                            : "bg-red-600 text-white"
                        }
                      >
                        {r.result === "verified" ? (
                          <>
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Verificado
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 mr-1" />
                            Rechazado
                          </>
                        )}
                      </Badge>
                    </TableCell>
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
