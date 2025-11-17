"use client";

import { useEffect, useState } from "react";
import { endpoints } from "../../lib/api";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
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
  Download,
  FileText,
  BarChart3,
  Calendar,
  TrendingUp,
  AlertCircle,
  Clock,
} from "lucide-react";

interface DailyReport {
  date: string;
  present: number;
  late: number;
  absent: number;
  total: number;
  rate: number;
}

interface IncidentReport {
  type: string;
  count: number;
  trend: number;
}

interface Summary {
  totalDays: number;
  avgAttendance: number;
  avgLate: number;
  avgAbsent: number;
  trend: number;
}

interface ReportsData {
  dailyReports: DailyReport[];
  incidentReports: IncidentReport[];
  summary: Summary;
}

export function ReportsModule() {
  const [reports, setReports] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [selectedGrade, setSelectedGrade] = useState("all");

  // === Cargar datos desde backend ===
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch(endpoints.reports);
        if (!res.ok) throw new Error("Error al obtener reportes");
        const data = await res.json();
        setReports(data);
      } catch (err: any) {
        console.error("Error al cargar reportes:", err);
        setError("No se pudieron cargar los datos del servidor.");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (loading)
    return <p className="text-gray-500">Cargando reportes y estadísticas...</p>;

  if (error)
    return (
      <p className="text-red-500 font-semibold">
        ⚠️ {error} — Verifica la conexión con el backend.
      </p>
    );

  if (!reports) return null;

  const { summary, dailyReports, incidentReports } = reports;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-gray-900">Reportes y Análisis</h2>
          <p className="text-gray-600">
            Estadísticas detalladas • Género: Varones
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
          <Button className="bg-red-600 hover:bg-red-700">
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros de Reporte</CardTitle>
          <CardDescription>
            Configure los parámetros del reporte a generar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label>Período</Label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Hoy</SelectItem>
                  <SelectItem value="week">Esta semana</SelectItem>
                  <SelectItem value="month">Este mes</SelectItem>
                  <SelectItem value="semester">Este semestre</SelectItem>
                  <SelectItem value="year">Este año</SelectItem>
                  <SelectItem value="custom">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Grado</Label>
              <Select value={selectedGrade} onValueChange={setSelectedGrade}>
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
              <Select>
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
              <Label>Dispositivo</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los dispositivos</SelectItem>
                  <SelectItem value="ksk-001">KSK-001</SelectItem>
                  <SelectItem value="ksk-002">KSK-002</SelectItem>
                  <SelectItem value="ksk-003">KSK-003</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumen Ejecutivo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Promedio de Asistencia</CardTitle>
            <BarChart3 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-green-600">{summary.avgAttendance}%</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-green-600">+{summary.trend}%</span>
              <span>vs período anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Promedio Tardanzas</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-yellow-600">{summary.avgLate}</div>
            <p className="text-xs text-muted-foreground">por día</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Promedio Ausencias</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-red-600">
              {summary.avgAbsent.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">por día</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Días Analizados</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-blue-600">{summary.totalDays}</div>
            <p className="text-xs text-muted-foreground">días hábiles</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Tendencia de Asistencia</CardTitle>
          <CardDescription>Visualización de datos históricos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">Gráfico de tendencias</p>
              <p className="text-sm text-gray-400">
                Asistencia por día con línea de tendencia
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Asistencia por Día */}
      <Card>
        <CardHeader>
          <CardTitle>Asistencia por Día</CardTitle>
          <CardDescription>Desglose diario de registros</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Presentes</TableHead>
                <TableHead>Tardanzas</TableHead>
                <TableHead>Ausencias</TableHead>
                <TableHead>Total</TableHead>
                <TableHead className="text-right">Tasa de Asistencia</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dailyReports.map((report, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3 text-gray-400" />
                      {report.date}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-green-600">{report.present}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-yellow-600">{report.late}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-red-600">{report.absent}</span>
                  </TableCell>
                  <TableCell>{report.total}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span
                        className={`${
                          report.rate >= 90
                            ? "text-green-600"
                            : report.rate >= 80
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {report.rate.toFixed(1)}%
                      </span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            report.rate >= 90
                              ? "bg-green-600"
                              : report.rate >= 80
                              ? "bg-yellow-600"
                              : "bg-red-600"
                          }`}
                          style={{ width: `${report.rate}%` }}
                        ></div>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Top Incidencias */}
      <Card>
        <CardHeader>
          <CardTitle>Top Incidencias</CardTitle>
          <CardDescription>
            Problemas más frecuentes en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo de Incidencia</TableHead>
                <TableHead>Cantidad</TableHead>
                <TableHead className="text-right">Tendencia</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incidentReports.map((incident, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      {incident.type}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-lg">{incident.count}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    {incident.trend !== 0 && (
                      <div className="flex items-center justify-end gap-1">
                        <TrendingUp
                          className={`h-3 w-3 ${
                            incident.trend < 0
                              ? "text-green-600 rotate-180"
                              : "text-red-600"
                          }`}
                        />
                        <span
                          className={
                            incident.trend < 0
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {Math.abs(incident.trend)}
                        </span>
                      </div>
                    )}
                    {incident.trend === 0 && (
                      <span className="text-gray-400">Sin cambios</span>
                    )}
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
