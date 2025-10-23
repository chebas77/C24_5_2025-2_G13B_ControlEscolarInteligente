import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { 
  Calendar,
  Users,
  Clock,
  XCircle,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertCircle,
  Monitor,
  Eye
} from "lucide-react";

interface AttendanceEvent {
  id: string;
  time: string;
  student: string;
  code: string;
  device: string;
  result: 'OK' | 'Observado';
  score: number;
  liveness: boolean;
}

export function AttendanceDashboard() {
  const [selectedDate] = useState('today');
  const [selectedGrade] = useState('all');
  const [selectedSection] = useState('all');

  const stats = {
    attendanceToday: 132,
    lateArrivals: 8,
    absences: 5,
    totalEvents: 145,
    trend: {
      attendance: +3,
      lateArrivals: -2,
      absences: -1
    },
    byPavilion: [
      { name: 'Pabellón A', present: 45, total: 50 },
      { name: 'Pabellón B', present: 42, total: 48 },
      { name: 'Pabellón C', present: 45, total: 47 }
    ]
  };

  const recentEvents: AttendanceEvent[] = [
    {
      id: '1',
      time: '07:35:12',
      student: 'García Pérez, Juan Carlos',
      code: 'EST-2024-001',
      device: 'KSK-001',
      result: 'OK',
      score: 94.5,
      liveness: true
    },
    {
      id: '2',
      time: '07:35:45',
      student: 'Rodríguez Silva, Miguel Ángel',
      code: 'EST-2024-002',
      device: 'KSK-001',
      result: 'OK',
      score: 89.2,
      liveness: true
    },
    {
      id: '3',
      time: '07:36:20',
      student: 'López Martínez, Carlos Eduardo',
      code: 'EST-2024-003',
      device: 'KSK-002',
      result: 'Observado',
      score: 72.1,
      liveness: false
    },
    {
      id: '4',
      time: '07:37:05',
      student: 'Fernández Vega, José Luis',
      code: 'EST-2024-004',
      device: 'KSK-001',
      result: 'OK',
      score: 91.8,
      liveness: true
    },
    {
      id: '5',
      time: '07:38:15',
      student: 'Sánchez Torres, Roberto Carlos',
      code: 'EST-2024-005',
      device: 'KSK-002',
      result: 'OK',
      score: 88.5,
      liveness: true
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl text-gray-900">Dashboard de Asistencia</h2>
        <p className="text-gray-600">
          Monitoreo en tiempo real • Género: Varones
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Asistencia Hoy</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-green-600">{stats.attendanceToday}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-green-600">+{stats.trend.attendance}%</span>
              <span>vs ayer</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Tardanzas</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-yellow-600">{stats.lateArrivals}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingDown className="h-3 w-3 text-green-600" />
              <span className="text-green-600">{stats.trend.lateArrivals}%</span>
              <span>vs ayer</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Ausencias</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-red-600">{stats.absences}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingDown className="h-3 w-3 text-green-600" />
              <span className="text-green-600">{stats.trend.absences}%</span>
              <span>vs ayer</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Eventos</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-blue-600">{stats.totalEvents}</div>
            <p className="text-xs text-muted-foreground">
              registros procesados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros y Búsqueda</CardTitle>
          <CardDescription>
            Filtre los datos por diferentes criterios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label>Fecha</Label>
              <Select value={selectedDate}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Hoy</SelectItem>
                  <SelectItem value="yesterday">Ayer</SelectItem>
                  <SelectItem value="week">Esta semana</SelectItem>
                  <SelectItem value="month">Este mes</SelectItem>
                  <SelectItem value="custom">Rango personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Grado</Label>
              <Select value={selectedGrade}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los grados</SelectItem>
                  <SelectItem value="1">1er Grado</SelectItem>
                  <SelectItem value="2">2do Grado</SelectItem>
                  <SelectItem value="3">3er Grado</SelectItem>
                  <SelectItem value="4">4to Grado</SelectItem>
                  <SelectItem value="5">5to Grado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Sección</Label>
              <Select value={selectedSection}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las secciones</SelectItem>
                  <SelectItem value="A">Sección A</SelectItem>
                  <SelectItem value="B">Sección B</SelectItem>
                  <SelectItem value="C">Sección C</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Género</Label>
              <Select value="varones" disabled>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="varones">Varones</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Pabellón/Dispositivo</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="ksk-001">KSK-001 (Pabellón A)</SelectItem>
                  <SelectItem value="ksk-002">KSK-002 (Pabellón B)</SelectItem>
                  <SelectItem value="ksk-003">KSK-003 (Pabellón C)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estado por Pabellón */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.byPavilion.map((pavilion, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">{pavilion.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{pavilion.present}/{pavilion.total}</span>
                <span className="text-sm text-muted-foreground">
                  {((pavilion.present / pavilion.total) * 100).toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all"
                  style={{ width: `${(pavilion.present / pavilion.total) * 100}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Eventos Recientes */}
      <Card>
        <CardHeader>
          <CardTitle>Eventos Recientes</CardTitle>
          <CardDescription>
            Últimos registros de asistencia procesados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hora</TableHead>
                <TableHead>Estudiante</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Dispositivo</TableHead>
                <TableHead>Resultado</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Liveness</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentEvents.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-gray-400" />
                      <span>{event.time}</span>
                    </div>
                  </TableCell>
                  <TableCell>{event.student}</TableCell>
                  <TableCell className="text-gray-600">{event.code}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Monitor className="h-3 w-3 text-gray-400" />
                      <span className="text-sm">{event.device}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={event.result === 'OK' ? 'default' : 'secondary'}
                      className={event.result === 'OK' ? 'bg-green-600' : 'bg-yellow-600'}
                    >
                      {event.result === 'OK' ? (
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                      ) : (
                        <AlertCircle className="h-3 w-3 mr-1" />
                      )}
                      {event.result}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className={`${
                      event.score >= 85 ? 'text-green-600' :
                      event.score >= 75 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {event.score.toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Eye className={`h-3 w-3 ${event.liveness ? 'text-green-600' : 'text-gray-400'}`} />
                      <span className={event.liveness ? 'text-green-600' : 'text-gray-400'}>
                        {event.liveness ? 'Detectado' : 'No detectado'}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Mostrando 5 de {stats.totalEvents} eventos
            </p>
            <Button variant="outline" size="sm">
              Ver todos
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
