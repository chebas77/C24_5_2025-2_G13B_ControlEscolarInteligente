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
  AlertCircle, 
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  User
} from "lucide-react";

interface CaptureStationProps {
  deviceId: string;
  onBack: () => void;
}

interface CaptureRecord {
  id: string;
  time: string;
  student: string;
  code: string;
  result: 'verified' | 'rejected';
  score: number;
  liveness: boolean;
}

export function CaptureStation({ deviceId, onBack }: CaptureStationProps) {
  const [recentCaptures, setRecentCaptures] = useState<CaptureRecord[]>([
    {
      id: '1',
      time: '08:15:32',
      student: 'García Pérez, Juan Carlos',
      code: 'EST-2024-001',
      result: 'verified',
      score: 94.5,
      liveness: true
    },
    {
      id: '2',
      time: '08:16:05',
      student: 'Rodríguez Silva, Miguel Ángel',
      code: 'EST-2024-002',
      result: 'verified',
      score: 89.2,
      liveness: true
    },
    {
      id: '3',
      time: '08:16:40',
      student: 'López Martínez, Carlos Eduardo',
      code: 'EST-2024-003',
      result: 'rejected',
      score: 68.1,
      liveness: false
    }
  ]);

  const handleCapture = (imageData: string) => {
    // Simular registro de nueva captura
    const newCapture: CaptureRecord = {
      id: Date.now().toString(),
      time: new Date().toLocaleTimeString('es-PE'),
      student: 'Estudiante Detectado',
      code: 'EST-2024-XXX',
      result: 'verified',
      score: Math.random() * 30 + 70,
      liveness: Math.random() > 0.2
    };

    setRecentCaptures(prev => [newCapture, ...prev.slice(0, 4)]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-gray-900">Puesto de Captura - Cámara Web</h2>
          <p className="text-gray-600">
            Dispositivo: {deviceId} • Género: Varones
          </p>
        </div>
        <Button variant="outline" onClick={onBack}>
          ← Volver a Puestos
        </Button>
      </div>

      {/* Status Badges */}
      <div className="flex items-center gap-3">
        <Badge variant="default">
          <Monitor className="h-3 w-3 mr-1" />
          Puesto Online
        </Badge>
        <Badge variant="outline">
          <Clock className="h-3 w-3 mr-1" />
          {new Date().toLocaleTimeString('es-PE')}
        </Badge>
        <Badge variant="outline">
          Género: Varones
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Camera Capture Area */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Captura de Rostro en Vivo</CardTitle>
              <CardDescription>
                Sistema de verificación facial con cámara web
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Camera Component */}
              <CameraCapture deviceId={deviceId} onCapture={handleCapture} />

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="text-blue-900 mb-1">Instrucciones para el estudiante</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Mire al frente y parpadee</li>
                      <li>• Ajuste su posición dentro del marco</li>
                      <li>• Mantenga una expresión neutral</li>
                      <li>• Espere la confirmación del sistema</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Manual Override */}
              <div className="mt-4">
                <Button variant="outline" className="w-full">
                  Marcar Asistencia Manualmente
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info Panel */}
        <div className="space-y-4">
          {/* Device Info */}
          <Card>
            <CardHeader>
              <CardTitle>Información del Puesto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Monitor className="h-4 w-4 text-gray-600" />
                  <span className="text-sm">Dispositivo</span>
                </div>
                <span className="text-sm">{deviceId}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-600" />
                  <span className="text-sm">Género</span>
                </div>
                <Badge variant="outline">Varones</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-600" />
                  <span className="text-sm">Sesión iniciada</span>
                </div>
                <span className="text-sm">08:00 AM</span>
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas de Sesión</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total capturas</span>
                <span className="text-lg">{recentCaptures.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Verificadas</span>
                <span className="text-lg text-green-600">
                  {recentCaptures.filter(r => r.result === 'verified').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Rechazadas</span>
                <span className="text-lg text-red-600">
                  {recentCaptures.filter(r => r.result === 'rejected').length}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-sm text-gray-600">Tasa de éxito</span>
                <span className="text-lg text-blue-600">
                  {recentCaptures.length > 0 
                    ? ((recentCaptures.filter(r => r.result === 'verified').length / recentCaptures.length) * 100).toFixed(0)
                    : 0}%
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Legal Notice */}
          <Card className="border-gray-300">
            <CardContent className="pt-6">
              <div className="text-xs text-gray-600 space-y-2">
                <p className="flex items-start gap-2">
                  <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  <span>
                    Procesamiento local de captura. Solo se registran resultados aprobados.
                  </span>
                </p>
                <p>
                  Los datos se procesan conforme a las políticas internas de privacidad institucional.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Captures History */}
      <Card>
        <CardHeader>
          <CardTitle>Últimos Registros</CardTitle>
          <CardDescription>
            Historial de las últimas 5 capturas realizadas en este puesto
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hora</TableHead>
                <TableHead>Estudiante</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Liveness</TableHead>
                <TableHead>Resultado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentCaptures.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                    No hay registros aún. Inicie la captura para comenzar.
                  </TableCell>
                </TableRow>
              ) : (
                recentCaptures.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span className="text-sm">{record.time}</span>
                      </div>
                    </TableCell>
                    <TableCell>{record.student}</TableCell>
                    <TableCell className="text-gray-600">{record.code}</TableCell>
                    <TableCell>
                      <span className={`${
                        record.score >= 85 ? 'text-green-600' :
                        record.score >= 75 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {record.score.toFixed(1)}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Eye className={`h-3 w-3 ${record.liveness ? 'text-green-600' : 'text-gray-400'}`} />
                        <span className={`text-sm ${record.liveness ? 'text-green-600' : 'text-gray-400'}`}>
                          {record.liveness ? 'OK' : 'Fail'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={record.result === 'verified' ? 'default' : 'secondary'}
                        className={record.result === 'verified' ? 'bg-green-600' : 'bg-red-600'}
                      >
                        {record.result === 'verified' ? (
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
