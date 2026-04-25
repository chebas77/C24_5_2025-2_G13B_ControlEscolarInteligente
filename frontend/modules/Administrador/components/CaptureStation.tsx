"use client";

import { useEffect, useState } from "react";
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
  onBack: () => void;
}

interface CaptureRecord {
  id: string;
  time: string;
  student: string;
  result: "verified" | "rejected";
  score: number;
}

export function CaptureStation({ deviceId, onBack }: CaptureStationProps) {
  const [recentCaptures, setRecentCaptures] = useState<CaptureRecord[]>([]);
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString("es-PE"));
    };

    updateTime();
    const id = setInterval(updateTime, 1000);
    return () => clearInterval(id);
  }, []);

  const handleAutoCapture = (detected: boolean, confidence: number) => {
    if (detected && confidence > 80) {
      const newCapture: CaptureRecord = {
        id: Date.now().toString(),
        time: new Date().toLocaleTimeString("es-PE"),
        student: "Estudiante Detectado",
        result: confidence > 85 ? "verified" : "rejected",
        score: confidence,
      };
      setRecentCaptures((prev) => [newCapture, ...prev.slice(0, 4)]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">Puesto de Captura</h2>
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
      </div>

      <Card className="border-2 border-gray-300">
        <CardHeader>
          <CardTitle>Verificacion Facial en Vivo</CardTitle>
          <CardDescription>
            Alinee su rostro dentro del marco para registrar asistencia
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative w-full aspect-video overflow-hidden rounded-lg bg-black">
            <CameraCapture deviceId={deviceId} onAutoDetect={handleAutoCapture} autoMode />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ultimos Registros</CardTitle>
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
                  <TableCell colSpan={4} className="py-8 text-center text-gray-500">
                    Aun no hay capturas realizadas
                  </TableCell>
                </TableRow>
              ) : (
                recentCaptures.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{record.time}</TableCell>
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
