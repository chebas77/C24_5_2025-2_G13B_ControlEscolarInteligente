import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { 
  Monitor, 
  Plus, 
  Camera,
  Edit,
  Power,
  Circle
} from "lucide-react";

interface Device {
  id: string;
  code: string;
  location: string;
  status: 'online' | 'offline';
  lastPing: string;
  type: 'kiosko' | 'ipc';
}

interface DevicesListProps {
  onOpenCapture: (deviceId: string) => void;
}

export function DevicesList({ onOpenCapture }: DevicesListProps) {
  const [devices] = useState<Device[]>([
    {
      id: '1',
      code: 'KSK-001',
      location: 'Pabellón A - Entrada Principal',
      status: 'online',
      lastPing: '2 min',
      type: 'kiosko'
    },
    {
      id: '2',
      code: 'KSK-002',
      location: 'Pabellón B - Secundaria Varones',
      status: 'online',
      lastPing: '1 min',
      type: 'kiosko'
    },
    {
      id: '3',
      code: 'IPC-001',
      location: 'Oficina Administrativa',
      status: 'online',
      lastPing: '5 min',
      type: 'ipc'
    },
    {
      id: '4',
      code: 'KSK-003',
      location: 'Pabellón C - Primaria',
      status: 'offline',
      lastPing: '45 min',
      type: 'kiosko'
    }
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-gray-900">Puestos de Captura</h2>
          <p className="text-gray-600">
            Gestión de dispositivos de reconocimiento facial
          </p>
        </div>
        <Button 
          className="bg-red-600 hover:bg-red-700"
          onClick={() => setIsDialogOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Registrar Dispositivo
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Nuevo Dispositivo</DialogTitle>
            <DialogDescription>
              Configure un nuevo puesto de captura facial
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="code">Código del Dispositivo</Label>
              <Input id="code" placeholder="KSK-004" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Ubicación</Label>
              <Input id="location" placeholder="Pabellón D - Ingreso" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Tipo de Dispositivo</Label>
              <select 
                id="type" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="kiosko">Kiosko</option>
                <option value="ipc">IPC</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button className="bg-red-600 hover:bg-red-700" onClick={() => setIsDialogOpen(false)}>
              Registrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Dispositivos</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{devices.length}</div>
            <p className="text-xs text-muted-foreground">dispositivos registrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">En Línea</CardTitle>
            <Circle className="h-4 w-4 text-green-600 fill-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-green-600">
              {devices.filter(d => d.status === 'online').length}
            </div>
            <p className="text-xs text-muted-foreground">activos ahora</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Fuera de Línea</CardTitle>
            <Circle className="h-4 w-4 text-red-600 fill-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-red-600">
              {devices.filter(d => d.status === 'offline').length}
            </div>
            <p className="text-xs text-muted-foreground">requieren atención</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Kioscos</CardTitle>
            <Camera className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">
              {devices.filter(d => d.type === 'kiosko').length}
            </div>
            <p className="text-xs text-muted-foreground">puestos principales</p>
          </CardContent>
        </Card>
      </div>

      {/* Devices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Dispositivos</CardTitle>
          <CardDescription>
            Género: Varones • Todos los pabellones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Último Ping</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {devices.map((device) => (
                <TableRow key={device.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4 text-gray-500" />
                      <span>{device.code}</span>
                    </div>
                  </TableCell>
                  <TableCell>{device.location}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {device.type === 'kiosko' ? 'Kiosko' : 'IPC'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Circle 
                        className={`h-2 w-2 ${
                          device.status === 'online' 
                            ? 'text-green-600 fill-green-600' 
                            : 'text-red-600 fill-red-600'
                        }`} 
                      />
                      <span className={
                        device.status === 'online' 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }>
                        {device.status === 'online' ? 'En línea' : 'Fuera de línea'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600">
                    Hace {device.lastPing}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        disabled={device.status === 'offline'}
                        onClick={() => onOpenCapture(device.code)}
                      >
                        <Camera className="h-3 w-3 mr-1" />
                        Abrir Puesto
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Power className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
