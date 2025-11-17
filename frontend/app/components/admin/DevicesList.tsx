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

  // Detectar cámaras disponibles con fallbacks (enumerateDevices, getUserMedia, legacy)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const getCameras = async () => {
      try {
        const nav: any = navigator;
        const md = nav.mediaDevices;

        // Si no existe mediaDevices, intentar legacy getUserMedia
        if (!md) {
          const legacyGet = nav.getUserMedia || nav.webkitGetUserMedia || nav.mozGetUserMedia;
          if (legacyGet) {
            // solicitar permiso legacy y crear dispositivo sintético
            const stream: MediaStream = await new Promise((resolve, reject) =>
              legacyGet.call(nav, { video: true }, resolve, reject)
            );
            stream.getTracks().forEach((t) => t.stop());
            setPermissionGranted(true);
            setVideoDevices([
              {
                deviceId: "default",
                kind: "videoinput",
                label: "Cámara (predeterminada)",
                groupId: "",
              } as unknown as MediaDeviceInfo,
            ]);
            return;
          } else {
            console.error("mediaDevices no disponible en este entorno");
            setVideoDevices([]);
            setPermissionGranted(false);
            return;
          }
        }

        // Si existe enumerateDevices, usarla primero (no exige permiso en algunos navegadores)
        if (typeof md.enumerateDevices === "function") {
          const devices = await md.enumerateDevices();
          const cameras = devices.filter((d: any) => d.kind === "videoinput");
          if (cameras.length > 0) {
            setVideoDevices(cameras);
            // si hay labels es porque se ha otorgado permiso previamente
            const hasLabels = cameras.some((c: any) => c.label && c.label.length > 0);
            setPermissionGranted(Boolean(hasLabels));
            return;
          }
        }

        // Si no hay cámaras listadas, intentar solicitar permiso con getUserMedia
        const getUserMediaFn =
          md.getUserMedia ||
          md.getUserMedia?.bind(md) ||
          nav.getUserMedia ||
          nav.webkitGetUserMedia ||
          nav.mozGetUserMedia;

        if (typeof md.getUserMedia === "function" || getUserMediaFn) {
          // solicitar permiso
          const stream =
            typeof md.getUserMedia === "function"
              ? await md.getUserMedia({ video: true })
              : await new Promise<MediaStream>((resolve, reject) =>
                  getUserMediaFn.call(nav, { video: true }, resolve, reject)
                );

          setPermissionGranted(true);

          // detener tracks y volver a enumerar si es posible
          stream.getTracks().forEach((t) => t.stop());

          if (typeof md.enumerateDevices === "function") {
            const devices2 = await md.enumerateDevices();
            const cameras2 = devices2.filter((d: any) => d.kind === "videoinput");
            if (cameras2.length > 0) {
              setVideoDevices(cameras2);
              return;
            }
          }

          // fallback: inferir un dispositivo a partir del stream (si no se pudo enumerar)
          const track = stream.getVideoTracks && stream.getVideoTracks()[0];
          const inferredLabel = (track && (track.label || "Cámara (autodetectada)")) || "Cámara (autodetectada)";
          setVideoDevices([
            {
              deviceId: (track && track.getSettings && track.getSettings().deviceId) || "default",
              kind: "videoinput",
              label: inferredLabel,
              groupId: "",
            } as unknown as MediaDeviceInfo,
          ]);
          return;
        }

        // Si llegamos aquí no hay forma de detectar cámaras
        setVideoDevices([]);
        setPermissionGranted(false);
      } catch (err: any) {
        console.error("Error detectando cámaras:", err);
        setVideoDevices([]);
        setPermissionGranted(false);
      }
    };

    getCameras();

    const handleDeviceChange = () => {
      getCameras();
    };

    try {
      if (nav.mediaDevices && typeof nav.mediaDevices.addEventListener === "function") {
        nav.mediaDevices.addEventListener("devicechange", handleDeviceChange);
        return () => nav.mediaDevices.removeEventListener("devicechange", handleDeviceChange);
      } else if (nav.mediaDevices) {
        // fallback antiguo
        (nav.mediaDevices as any).ondevicechange = handleDeviceChange;
        return () => {
          try {
            (nav.mediaDevices as any).ondevicechange = null;
          } catch {}
        };
      }
    } catch {
      // ignore attach listener errors
    }
  }, []);

  // Función para solicitar permiso explícito cuando el usuario lo pida
  const requestPermission = async () => {
    if (!navigator?.mediaDevices?.getUserMedia) {
      console.error("getUserMedia no está disponible");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setPermissionGranted(true);
      stream.getTracks().forEach(track => track.stop());
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(d => d.kind === "videoinput");
      setVideoDevices(cameras);
    } catch (err: any) {
      console.error("Permiso denegado o error:", err);
      setPermissionGranted(false);
    }
  };

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

        {/* Botones: actualizar y solicitar permiso */}
        <div className="flex items-center space-x-2">
          <Button
            className="bg-red-600 hover:bg-red-700"
            onClick={() => window.location.reload()}
          >
            <Plus className="h-4 w-4 mr-2" />
            Actualizar Lista
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={requestPermission}
          >
            Solicitar Permiso
          </Button>
        </div>
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
                : "Debes otorgar permiso para acceder a la cámara o pulsa 'Solicitar Permiso'."}
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
