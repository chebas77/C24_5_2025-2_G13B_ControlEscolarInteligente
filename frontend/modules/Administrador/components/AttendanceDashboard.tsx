"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import {
  Users,
  Clock,
  XCircle,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertCircle,
  Monitor,
  Eye,
  RefreshCw,
} from "lucide-react";

interface AttendanceEvent {
  id: string;
  time: string;
  student: string;
  code: string;
  device: string;
  result: "OK" | "Observado";
  score: number;
  liveness: boolean;
}

interface DashboardStats {
  attendanceToday: number;
  lateArrivals: number;
  absences: number;
  totalEvents: number;
  trend: {
    attendance: number;
    lateArrivals: number;
    absences: number;
  };
}

interface AttendanceDashboardResponse {
  stats?: DashboardStats;
  recentEvents?: AttendanceEvent[];
  filters?: {
    grades?: string[];
    sections?: string[];
    devices?: string[];
  };
  error?: string;
}

const API_BASE_URL = "http://localhost:8000/api/reports";

const emptyStats: DashboardStats = {
  attendanceToday: 0,
  lateArrivals: 0,
  absences: 0,
  totalEvents: 0,
  trend: {
    attendance: 0,
    lateArrivals: 0,
    absences: 0,
  },
};

export function AttendanceDashboard() {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [selectedGrade, setSelectedGrade] = useState("all");
  const [selectedSection, setSelectedSection] = useState("all");
  const [selectedDevice, setSelectedDevice] = useState("all");
  const [stats, setStats] = useState<DashboardStats>(emptyStats);
  const [recentEvents, setRecentEvents] = useState<AttendanceEvent[]>([]);
  const [filterOptions, setFilterOptions] = useState({
    grades: [] as string[],
    sections: [] as string[],
    devices: [] as string[],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const params = new URLSearchParams({
        date: selectedDate,
        grade: selectedGrade,
        section: selectedSection,
        device: selectedDevice,
      });
      const response = await fetch(`${API_BASE_URL}/admin/attendance/dashboard/?${params.toString()}`);
      const data: AttendanceDashboardResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "No se pudo cargar el dashboard.");
      }

      setStats(data.stats || emptyStats);
      setRecentEvents(data.recentEvents || []);
      setFilterOptions({
        grades: data.filters?.grades || [],
        sections: data.filters?.sections || [],
        devices: data.filters?.devices || [],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado al cargar asistencia.");
      setStats(emptyStats);
      setRecentEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadDashboard();
  }, [selectedDate, selectedGrade, selectedSection, selectedDevice]);

  const trendClass = (value: number, lowerIsBetter = false) => {
    const good = lowerIsBetter ? value <= 0 : value >= 0;
    return good ? "text-green-600" : "text-red-600";
  };

  const trendLabel = (value: number) => `${value > 0 ? "+" : ""}${value}%`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl text-gray-900">Dashboard de Asistencia</h2>
          <p className="text-gray-600">Monitoreo en tiempo real - Genero: Varones</p>
        </div>
        <Button variant="outline" onClick={loadDashboard} disabled={isLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Actualizar
        </Button>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

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
              <span className={trendClass(stats.trend.attendance)}>{trendLabel(stats.trend.attendance)}</span>
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
              <span className={trendClass(stats.trend.lateArrivals, true)}>
                {trendLabel(stats.trend.lateArrivals)}
              </span>
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
              <span className={trendClass(stats.trend.absences, true)}>{trendLabel(stats.trend.absences)}</span>
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
            <p className="text-xs text-muted-foreground">registros procesados</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros y Busqueda</CardTitle>
          <CardDescription>Filtre los datos por diferentes criterios</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Fecha</Label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Grado</Label>
              <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los grados</SelectItem>
                  {filterOptions.grades.map((grade) => (
                    <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Seccion</Label>
              <Select value={selectedSection} onValueChange={setSelectedSection}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las secciones</SelectItem>
                  {filterOptions.sections.map((section) => (
                    <SelectItem key={section} value={section}>{section}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Dispositivo</Label>
              <Select value={selectedDevice} onValueChange={setSelectedDevice}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {filterOptions.devices.map((device) => (
                    <SelectItem key={device} value={device}>{device}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Eventos Recientes</CardTitle>
          <CardDescription>Ultimos registros de asistencia procesados</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hora</TableHead>
                <TableHead>Estudiante</TableHead>
                <TableHead>Codigo</TableHead>
                <TableHead>Dispositivo</TableHead>
                <TableHead>Resultado</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Liveness</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-gray-500">
                    Cargando datos desde la base de datos...
                  </TableCell>
                </TableRow>
              )}

              {!isLoading && recentEvents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-gray-500">
                    No hay eventos registrados para la fecha seleccionada.
                  </TableCell>
                </TableRow>
              )}

              {!isLoading && recentEvents.map((event) => (
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
                      variant={event.result === "OK" ? "default" : "secondary"}
                      className={event.result === "OK" ? "bg-green-600" : "bg-yellow-600"}
                    >
                      {event.result === "OK" ? (
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                      ) : (
                        <AlertCircle className="h-3 w-3 mr-1" />
                      )}
                      {event.result}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className={
                      event.score >= 85 ? "text-green-600" :
                      event.score >= 75 ? "text-yellow-600" :
                      "text-red-600"
                    }>
                      {event.score.toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Eye className={`h-3 w-3 ${event.liveness ? "text-green-600" : "text-gray-400"}`} />
                      <span className={event.liveness ? "text-green-600" : "text-gray-400"}>
                        {event.liveness ? "Detectado" : "No detectado"}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Mostrando {recentEvents.length} de {stats.totalEvents} eventos
            </p>
            <Button variant="outline" size="sm" onClick={loadDashboard}>
              Ver todos
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
