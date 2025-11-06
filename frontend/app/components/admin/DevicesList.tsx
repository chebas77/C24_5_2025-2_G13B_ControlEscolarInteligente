"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "../ui/table";
import { 
  Monitor, 
  Plus, 
  Camera,
  Circle
} from "lucide-react";

interface DevicesListProps {
  onOpenCapture?: (deviceId: string) => void;
}

export function DevicesList({ onOpenCapture }: DevicesListProps) {
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const router = useRouter();

  // Detectar cámaras disponibles
  useEffect(() => {
    const getCameras = async () => {
      try {
        // Pedimos permiso para listar nombres de cámaras
        await navigator.mediaDevices.getUserMedia({ video: true });
        setPermissionGranted(true);

        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(d => d.kind === "videoinput");
        setVideoDevices(cameras);
      } catch (error) {
        console.error("Error accediendo a cámaras:", error);
        setPermissionGranted(false);
      }
    };

    getCameras();

    // Listener para cambios dinámicos (por ejemplo, conectar nueva cámara)
    navigator.mediaDevices.addEventListener("devicechange", getCameras);
    return () => navigator.mediaDevices.removeEventListener("devicechange", getCameras);
  }, []);

  const handleOpenCapture = (deviceId: string) => {
    if (onOpenCapture) {
      onOpenCapture(deviceId);
    } else {
      router.push(`/captura/${deviceId}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-gray-900">Puestos de Captura</h2>
          <p className="text-gray-600">
            Cámaras detectadas en este equipo (interna, USB, IP, etc.)
          </p>
        </div>
        <Button
          className="bg-red-600 hover:bg-red-700"
          onClick={() => window.location.reload()}
        >
          <Plus className="h-4 w-4 mr-2" />
          Actualizar Lista
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Total de Cámaras</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{videoDevices.length}</div>
            <p className="text-xs text-muted-foreground">dispositivos disponibles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Permisos</CardTitle>
            <Circle
              className={`h-4 w-4 ${
                permissionGranted
                  ? "text-green-600 fill-green-600"
                  : "text-red-600 fill-red-600"
              }`}
            />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl ${
                permissionGranted ? "text-green-600" : "text-red-600"
              }`}
            >
              {permissionGranted ? "Otorgados" : "Denegados"}
            </div>
            <p className="text-xs text-muted-foreground">
              acceso a cámara {permissionGranted ? "activo" : "bloqueado"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Tipo de Entradas</CardTitle>
            <Camera className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">
              {new Set(videoDevices.map((d) => d.groupId)).size}
            </div>
            <p className="text-xs text-muted-foreground">grupos de cámara detectados</p>
          </CardContent>
        </Card>
      </div>

      {/* Devices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Cámaras</CardTitle>
          <CardDescription>
            Selecciona una cámara para abrir su vista de captura.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {videoDevices.length === 0 ? (
            <div className="text-gray-500 text-sm">
              {permissionGranted
                ? "No se detectaron cámaras conectadas."
                : "Debes otorgar permiso para acceder a la cámara."}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Device ID</TableHead>
                  <TableHead className="text-right">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {videoDevices.map((device, index) => (
                  <TableRow key={device.deviceId}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{device.label || `Cámara ${index + 1}`}</TableCell>
                    <TableCell className="truncate max-w-[200px] text-gray-500">
                      {device.deviceId}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenCapture(device.deviceId)}
                      >
                        <Camera className="h-3 w-3 mr-1" />
                        Abrir Puesto
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
