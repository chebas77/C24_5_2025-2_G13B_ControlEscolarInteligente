"use client";

import { useEffect, useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { Calendar } from "@/app/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/app/components/ui/dialog";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Switch } from "@/app/components/ui/switch";
import { 
  LogOut, 
  User, 
  Calendar as CalendarIcon, 
  CheckCircle, 
  XCircle, 
  Clock, 
  TrendingUp,
  AlertCircle,
  BookOpen,
  Settings,
  Bell,
  Download,
  Mail,
  Phone,
  MapPin
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface AttendanceRecord {
  date: string;
  status: 'present' | 'absent' | 'late';
  time?: string;
  time_entrada?: string;
  time_salida?: string;
  teacher: string;
  observations?: string;
}

interface Student {
  id: string;
  name: string;
  grade: string;
  photo: string;
  attendance: AttendanceRecord[];
}

interface Calificacion {
  nombre: string;
  nota: number;
}

interface Calificaciones {
  promedio_general: number;
  cursos: Calificacion[];
}

interface Comportamiento {
  conducta: string;
  participacion: string;
  trabajo_equipo: string;
  puntualidad_tareas: string;
  responsabilidad: string;
  respeto: string;
}

interface Comunicado {
  fecha: string;
  mensaje: string;
  tipo: 'info' | 'success' | 'warning';
  estado_envio?: string;
}

interface ParentProfile {
  telefono: string;
  email: string;
  direccion: string;
  notificaciones_email: boolean;
  notificaciones_sms: boolean;
  notificar_asistencia: boolean;
  notificar_calificaciones: boolean;
  notificar_comportamiento: boolean;
  frecuencia_resumen: 'diario' | 'semanal' | 'mensual';
}

interface ParentViewProps {
  userEmail: string;
  onLogout: () => void;
}

const toLocalDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseLocalDate = (dateStr?: string): Date | null => {
  if (!dateStr) {
    return null;
  }

  const [year, month, day] = dateStr.split("-").map(Number);
  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day);
};

const buildFallbackStudent = (userEmail: string): Student => ({
  id: `local-${userEmail}`,
  name: "Alumno no vinculado",
  grade: "Sin grado asignado",
  photo: "👧",
  attendance: [],
});

export function ParentView({ userEmail, onLogout }: ParentViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const [students, setStudents] = useState<Student[]>([buildFallbackStudent(userEmail)]);
  const [loading, setLoading] = useState(true);
  const [calificaciones, setCalificaciones] = useState<Calificaciones | null>(null);
  const [comportamiento, setComportamiento] = useState<Comportamiento | null>(null);
  const [comunicados, setComunicados] = useState<Comunicado[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [parentProfile, setParentProfile] = useState<ParentProfile>({
    telefono: "",
    email: userEmail,
    direccion: "",
    notificaciones_email: true,
    notificaciones_sms: false,
    notificar_asistencia: true,
    notificar_calificaciones: true,
    notificar_comportamiento: true,
    frecuencia_resumen: "semanal"
  });
  const [profileLoading, setProfileLoading] = useState(false);

  // Obtén los hijos (alumnos) del padre y sus asistencias
  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:8000/api/reports/padres/${userEmail}/alumnos/`)
      .then(res => res.json())
      .then(data => {
        const alumnos: Student[] = (data.alumnos || []).map((alumno: Student) => ({
          id: alumno.id,
          name: alumno.name,
          grade: alumno.grade,
          photo: alumno.photo || "👧",
          attendance: alumno.attendance || []
        }));
        if (alumnos.length > 0) {
          setStudents(alumnos);
          loadStudentData(alumnos[0].id);
        } else {
          setStudents([buildFallbackStudent(userEmail)]);
        }
        setLoading(false);
      })
      .catch(() => {
        setStudents([buildFallbackStudent(userEmail)]);
        setLoading(false);
      });
  }, [userEmail]);

  // Cargar preferencias del padre
  useEffect(() => {
    fetch(`http://localhost:8000/api/reports/padres/${userEmail}/preferencias/`)
      .then(res => res.json())
      .then(data => {
        setParentProfile({
          telefono: data.telefono || "",
          email: data.email || userEmail,
          direccion: data.direccion || "",
          notificaciones_email: data.notificaciones_email ?? true,
          notificaciones_sms: data.notificaciones_sms ?? false,
          notificar_asistencia: data.notificar_asistencia ?? true,
          notificar_calificaciones: data.notificar_calificaciones ?? true,
          notificar_comportamiento: data.notificar_comportamiento ?? true,
          frecuencia_resumen: data.frecuencia_resumen || "semanal"
        });
      })
      .catch(err => console.error('Error cargando preferencias:', err));
  }, [userEmail]);

  const loadStudentData = (studentId: string) => {
    // Cargar calificaciones
    fetch(`http://localhost:8000/api/reports/alumnos/${studentId}/calificaciones/`)
      .then(res => res.json())
      .then(data => setCalificaciones(data))
      .catch(err => console.error('Error cargando calificaciones:', err));

    // Cargar comportamiento
    fetch(`http://localhost:8000/api/reports/alumnos/${studentId}/comportamiento/`)
      .then(res => res.json())
      .then(data => setComportamiento(data))
      .catch(err => console.error('Error cargando comportamiento:', err));

    // Cargar comunicados
    fetch(`http://localhost:8000/api/reports/alumnos/${studentId}/comunicados/`)
      .then(res => res.json())
      .then(data => setComunicados(data.comunicados || []))
      .catch(err => console.error('Error cargando comunicados:', err));
  };

  const handleSaveSettings = async () => {
    setProfileLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/reports/padres/${userEmail}/preferencias/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parentProfile)
      });

      if (response.ok) {
        const refreshed = await fetch(`http://localhost:8000/api/reports/padres/${userEmail}/preferencias/`);
        const refreshedData = await refreshed.json();
        setParentProfile({
          telefono: refreshedData.telefono || "",
          email: refreshedData.email || userEmail,
          direccion: refreshedData.direccion || "",
          notificaciones_email: refreshedData.notificaciones_email ?? true,
          notificaciones_sms: refreshedData.notificaciones_sms ?? false,
          notificar_asistencia: refreshedData.notificar_asistencia ?? true,
          notificar_calificaciones: refreshedData.notificar_calificaciones ?? true,
          notificar_comportamiento: refreshedData.notificar_comportamiento ?? true,
          frecuencia_resumen: refreshedData.frecuencia_resumen || "semanal"
        });
        setSettingsOpen(false);
        // Aquí podrías mostrar un mensaje de éxito
      } else {
        console.error('Error al guardar preferencias');
      }
    } catch (err) {
      console.error('Error al guardar preferencias:', err);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleExport = (formato: 'pdf' | 'csv' | 'excel') => {
    if (!student || !student.id) return;
    
    const url = `http://localhost:8000/api/reports/alumnos/${student.id}/exportar-asistencia/?formato=${formato}&periodo=${selectedPeriod}`;
    
    // Abrir en nueva pestaña para descargar
    window.open(url, '_blank');
  };

  if (loading) {
    return <div>Cargando datos reales...</div>
  }

  // Si no hay estudiantes o el primer estudiante no tiene datos
  if (false && (!students || students.length === 0)) {
    return <div>No se encontraron alumnos. Verifica que el servidor esté corriendo.</div>
  }

  const student = students[0] || buildFallbackStudent(userEmail);
  
  if (!student) {
    return <div>Error al cargar datos del estudiante.</div>
  }
  
  const getAttendanceForPeriod = () => {
    if (!student || !student.attendance) {
      return [];
    }
    
    // Si es "all", retornar todos los registros
    if (selectedPeriod === "all") {
      return student.attendance;
    }
    
    const now = new Date();
    const filterDate = new Date();
    
    switch (selectedPeriod) {
      case "week":
        filterDate.setDate(now.getDate() - 7);
        break;
      case "month":
        filterDate.setMonth(now.getMonth() - 1);
        break;
      case "quarter":
        filterDate.setMonth(now.getMonth() - 3);
        break;
      case "year":
        filterDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        filterDate.setDate(now.getDate() - 7);
    }
    
    const filtered = student.attendance.filter(record => {
      if (!record.date) return false;
      const parsedDate = parseLocalDate(record.date);
      return parsedDate ? parsedDate >= filterDate : false;
    });
    
    return filtered;
  };

  const periodData = getAttendanceForPeriod();
  
  const stats = {
    total: periodData.length,
    present: periodData.filter(r => r.status === 'present').length,
    late: periodData.filter(r => r.status === 'late').length,
    absent: periodData.filter(r => r.status === 'absent').length,
    attendanceRate: periodData.length > 0 ? Math.round(((periodData.filter(r => r.status === 'present' || r.status === 'late').length) / periodData.length) * 100) : 0,
    punctualityRate: periodData.filter(r => r.status === 'present' || r.status === 'late').length > 0 ? Math.round((periodData.filter(r => r.status === 'present').length / periodData.filter(r => r.status === 'present' || r.status === 'late').length) * 100) : 0
  };

  // Calcular estadísticas de horarios
  const getTimeStats = () => {
    const presentWithTime = periodData.filter(r => r.status === 'present' && r.time);
    const lateWithTime = periodData.filter(r => r.status === 'late' && r.time);
    
    if (presentWithTime.length === 0 && lateWithTime.length === 0) {
      return {
        avgArrivalTime: 'N/A',
        earliestArrival: 'N/A',
        latestArrival: 'N/A',
        onTimeCount: stats.present,
        lateCount: stats.late
      };
    }

    const allTimes = [...presentWithTime, ...lateWithTime]
      .map(r => r.time)
      .filter(t => t)
      .sort();

    return {
      avgArrivalTime: allTimes.length > 0 ? allTimes[Math.floor(allTimes.length / 2)] : 'N/A',
      earliestArrival: allTimes[0] || 'N/A',
      latestArrival: allTimes[allTimes.length - 1] || 'N/A',
      onTimeCount: stats.present,
      lateCount: stats.late
    };
  };

  const timeStats = getTimeStats();

  // Analizar patrones de asistencia y detectar problemas
  const getAttendanceAnalysis = () => {
    if (!student || !student.attendance || student.attendance.length === 0) {
      return {
        alerts: [],
        insights: [],
        status: 'unknown'
      };
    }

    const alerts: { type: 'critical' | 'warning' | 'info', message: string, icon: string }[] = [];
    const insights: string[] = [];

    // Ordenar asistencias por fecha
    const sortedAttendance = [...student.attendance].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Detectar ausencias consecutivas
    let consecutiveAbsences = 0;
    let maxConsecutiveAbsences = 0;
    sortedAttendance.forEach((record) => {
      if (record.status === 'absent') {
        consecutiveAbsences++;
        maxConsecutiveAbsences = Math.max(maxConsecutiveAbsences, consecutiveAbsences);
      } else {
        consecutiveAbsences = 0;
      }
    });

    // Alertas críticas
    if (maxConsecutiveAbsences >= 3) {
      alerts.push({
        type: 'critical',
        message: `⚠️ Alerta Crítica: ${maxConsecutiveAbsences} días consecutivos de ausencia detectados`,
        icon: '🚨'
      });
    }

    if (stats.attendanceRate < 75) {
      alerts.push({
        type: 'critical',
        message: `📉 Asistencia por debajo del 75%: Se requiere atención inmediata`,
        icon: '⚠️'
      });
    }

    // Advertencias
    if (stats.late >= 5 && stats.attendanceRate >= 75) {
      alerts.push({
        type: 'warning',
        message: `⏰ ${stats.late} tardanzas registradas: Revisar hábitos de puntualidad`,
        icon: '⚡'
      });
    }

    if (stats.absent >= 3 && stats.absent < stats.total * 0.25) {
      alerts.push({
        type: 'warning',
        message: `📅 ${stats.absent} ausencias en el período: Monitorear tendencia`,
        icon: '👁️'
      });
    }

    // Insights positivos
    if (stats.attendanceRate >= 95) {
      alerts.push({
        type: 'info',
        message: `✨ Excelente asistencia: ${stats.attendanceRate}% de presencia`,
        icon: '🌟'
      });
    }

    if (stats.punctualityRate >= 90 && stats.present > 0) {
      alerts.push({
        type: 'info',
        message: `⏱️ Puntualidad destacada: ${stats.punctualityRate}% llegadas a tiempo`,
        icon: '👏'
      });
    }

    // Si no hay alertas, todo está bien
    if (alerts.length === 0) {
      alerts.push({
        type: 'info',
        message: '✅ Asistencia dentro de parámetros normales',
        icon: '👍'
      });
    }

    return {
      alerts,
      insights,
      status: alerts.some(a => a.type === 'critical') ? 'critical' : 
              alerts.some(a => a.type === 'warning') ? 'warning' : 'good'
    };
  };

  const attendanceAnalysis = getAttendanceAnalysis();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return <Badge className="bg-green-100 text-green-800 border-green-300">Presente</Badge>;
      case 'late':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Tardanza</Badge>;
      case 'absent':
        return <Badge className="bg-red-100 text-red-800 border-red-300">Ausente</Badge>;
      default:
        return <Badge variant="secondary">Desconocido</Badge>;
    }
  };

  const getAttendanceForDate = (date: Date) => {
    if (!student || !student.attendance) {
      return null;
    }
    const dateStr = toLocalDateKey(date);
    
    const recordsForDate = student.attendance.filter(record => record.date === dateStr);
    
    if (recordsForDate.length === 0) return null;
    
    // Si hay múltiples registros, priorizar: ausente > tardanza > presente
    const absent = recordsForDate.find(r => r.status === 'absent');
    if (absent) return absent;
    
    const late = recordsForDate.find(r => r.status === 'late');
    if (late) return late;
    
    return recordsForDate[0]; // Retorna el primero si todos son presentes
  };

  const selectedDateRecord = getAttendanceForDate(selectedDate);

  // Función para obtener fechas únicas con su estado prioritario para el calendario
  const getCalendarDates = () => {
    if (!student || !student.attendance) {
      return { present: [], late: [], absent: [] };
    }

    // Agrupar por fecha
    const dateMap = new Map<string, AttendanceRecord[]>();
    student.attendance.forEach(record => {
      const existing = dateMap.get(record.date) || [];
      existing.push(record);
      dateMap.set(record.date, existing);
    });

    // Determinar estado prioritario para cada fecha
    const present: Date[] = [];
    const late: Date[] = [];
    const absent: Date[] = [];

    dateMap.forEach((records, dateStr) => {
      const hasAbsent = records.some(r => r.status === 'absent');
      const hasLate = records.some(r => r.status === 'late');

      // Crear fecha en zona horaria local (no UTC)
      const date = parseLocalDate(dateStr);
      if (!date) {
        return;
      }
      
      if (hasAbsent) {
        absent.push(date);
      } else if (hasLate) {
        late.push(date);
      } else {
        present.push(date);
      }
    });

    return { present, late, absent };
  };

  const calendarDates = getCalendarDates();
  const sortedPeriodData = [...periodData].sort((a, b) => {
    const dateA = parseLocalDate(a.date)?.getTime() ?? 0;
    const dateB = parseLocalDate(b.date)?.getTime() ?? 0;
    return dateB - dateA;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl text-red-600">Fe y Alegría</h1>
              <span className="ml-4 text-gray-500">|</span>
              <span className="ml-4 text-gray-700">Portal Padres</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setSettingsOpen(true)}>
                <Settings className="h-4 w-4" />
              </Button>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm text-gray-700">Familia García</p>
                  <p className="text-xs text-gray-500">{userEmail}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onLogout}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Student Info */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-center sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              {student.photo && (student.photo.startsWith("http://") || student.photo.startsWith("https://")) ? (
                <img
                  src={student.photo}
                  alt={student.name}
                  className="h-16 w-16 rounded-full object-cover sm:h-20 sm:w-20"
                />
              ) : (
                <div className="text-4xl sm:text-5xl">{student.photo}</div>
              )}
              <div className="text-center sm:text-left">
                <CardTitle className="text-xl sm:text-2xl">{student.name}</CardTitle>
                <CardDescription className="text-sm sm:text-lg">{student.grade} • ID: {student.id}</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Period Selector */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <h2 className="text-xl sm:text-2xl text-gray-900">Reporte de Asistencia</h2>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-sm text-gray-600 whitespace-nowrap">Período:</span>
              <select 
                value={selectedPeriod} 
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm flex-1 sm:flex-none sm:w-auto"
              >
                <option value="all">Todo</option>
                <option value="week">Última semana</option>
                <option value="month">Último mes</option>
                <option value="quarter">Último trimestre</option>
                <option value="year">Último año</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2 justify-between sm:justify-start">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleExport('pdf')}
                title="Exportar a PDF"
                className="text-xs sm:text-sm flex-1 sm:flex-none"
              >
                <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                PDF
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleExport('csv')}
                title="Exportar a CSV"
                className="text-xs sm:text-sm flex-1 sm:flex-none"
              >
                <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                CSV
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleExport('excel')}
                title="Exportar a Excel"
                className="text-xs sm:text-sm flex-1 sm:flex-none"
              >
                <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                Excel
              </Button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Calendario de Asistencia
              </CardTitle>
              <CardDescription>
                Selecciona una fecha para ver detalles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(day) => day && setSelectedDate(day)}
                className="rounded-md border w-full"
                modifiers={{
                  present: calendarDates.present,
                  late: calendarDates.late,
                  absent: calendarDates.absent,
                }}
                modifiersClassNames={{
                  selected: !selectedDateRecord ? 'bg-gray-400 text-white hover:bg-gray-400 ring-1 ring-gray-400 ring-offset-1' : ''
                }}
                modifiersStyles={{
                  present: { backgroundColor: '#dcfce7', color: '#166534' },
                  late: { backgroundColor: '#fef3c7', color: '#92400e' },
                  absent: { backgroundColor: '#fee2e2', color: '#991b1b' },
                }}
              />
              
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <h4 className="text-sm mb-2">Detalle del día seleccionado:</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Fecha:</span>
                    <span className="font-medium">{selectedDate.toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  {selectedDateRecord ? (
                    <>
                      <div className="flex justify-between">
                        <span>Estado:</span>
                        {getStatusBadge(selectedDateRecord.status)}
                      </div>
                      {selectedDateRecord.time_entrada && (
                        <div className="flex justify-between">
                          <span>Hora Entrada:</span>
                          <span className="font-medium text-green-700">{selectedDateRecord.time_entrada}</span>
                        </div>
                      )}
                      {selectedDateRecord.time_salida && (
                        <div className="flex justify-between">
                          <span>Hora Salida:</span>
                          <span className="font-medium text-red-700">{selectedDateRecord.time_salida}</span>
                        </div>
                      )}
                      {selectedDateRecord.observations && (
                        <div className="mt-2">
                          <span className="text-xs text-gray-600">Observaciones:</span>
                          <p className="text-xs mt-1 p-2 bg-yellow-50 border border-yellow-200 rounded">
                            {selectedDateRecord.observations}
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex justify-between items-center">
                      <span>Estado:</span>
                      <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-300">
                        No hay registro
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attendance History */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Historial Detallado
              </CardTitle>
              <CardDescription>
                Registro completo del período seleccionado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 h-[500px] overflow-y-auto">
                {sortedPeriodData.map((record, index) => {
                  const recordDate = parseLocalDate(record.date);
                  const weekdayLabel = recordDate
                    ? recordDate.toLocaleDateString('es-PE', { weekday: 'short' })
                    : '--';
                  const shortDateLabel = recordDate
                    ? recordDate.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' })
                    : '--/--';

                  return (
                  <div key={index} className="grid grid-cols-[auto_1fr] gap-4 p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="text-center min-w-[60px]">
                        <div className="text-sm">{weekdayLabel}</div>
                        <div className="text-xs text-gray-500">{shortDateLabel}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(record.status)}
                        
                        {/* Horarios destacados */}
                        {(record.time_entrada || record.time_salida) && (
                          <div className="flex items-center gap-2">
                            {record.time_entrada && (
                              <div className="flex items-center gap-1 px-2 py-1 bg-green-50 border border-green-200 rounded">
                                <Clock className="h-3 w-3 text-green-600" />
                                <div className="flex flex-col">
                                  <span className="text-[9px] text-green-600 font-medium">Entrada</span>
                                  <span className="text-xs font-semibold text-green-700">{record.time_entrada}</span>
                                </div>
                              </div>
                            )}
                            {record.time_salida && (
                              <div className="flex items-center gap-1 px-2 py-1 bg-red-50 border border-red-200 rounded">
                                <Clock className="h-3 w-3 text-red-600" />
                                <div className="flex flex-col">
                                  <span className="text-[9px] text-red-600 font-medium">Salida</span>
                                  <span className="text-xs font-semibold text-red-700">{record.time_salida}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {!record.time_entrada && !record.time_salida && (
                          <div className="text-xs text-gray-500">
                            📚 {record.status === 'present' ? 'Día completo' : record.status === 'late' ? 'Llegada tardía' : 'Ausencia'}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 justify-end">
                      <span className="text-xs font-medium text-gray-600 whitespace-nowrap">Observaciones:</span>
                      <p className="text-xs p-2 bg-yellow-50 border border-yellow-200 rounded text-gray-700 max-w-xs">
                        {record.observations || "No hay observaciones para este día"}
                      </p>
                    </div>
                  </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          {/* Attendance Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Gráfica de Asistencia
              </CardTitle>
              <CardDescription>
                Evolución de la asistencia en el período seleccionado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6 p-4">
                {/* Chart Tabs */}
                <Tabs defaultValue="pie" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="pie">Gráfico Circular</TabsTrigger>
                    <TabsTrigger value="bar">Gráfico de Barras</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="pie" className="mt-4">
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Presentes', value: stats.present, color: '#22c55e' },
                              { name: 'Tardanzas', value: stats.late, color: '#eab308' },
                              { name: 'Ausencias', value: stats.absent, color: '#ef4444' }
                            ]}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {[
                              { name: 'Presentes', value: stats.present, color: '#22c55e' },
                              { name: 'Tardanzas', value: stats.late, color: '#eab308' },
                              { name: 'Ausencias', value: stats.absent, color: '#ef4444' }
                            ].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="bar" className="mt-4">
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={[
                            { name: 'Presentes', value: stats.present, fill: '#22c55e' },
                            { name: 'Tardanzas', value: stats.late, fill: '#eab308' },
                            { name: 'Ausencias', value: stats.absent, fill: '#ef4444' }
                          ]}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="value" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </TabsContent>
                </Tabs>
                
                {/* Time Statistics */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Análisis de Horarios
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-3 rounded-md">
                      <span className="text-xs text-gray-600 block mb-1">Hora más temprana</span>
                      <div className="text-lg font-bold text-green-700">{timeStats.earliestArrival}</div>
                    </div>
                    <div className="bg-white p-3 rounded-md">
                      <span className="text-xs text-gray-600 block mb-1">Hora más tardía</span>
                      <div className="text-lg font-bold text-orange-700">{timeStats.latestArrival}</div>
                    </div>
                    <div className="bg-white p-3 rounded-md">
                      <span className="text-xs text-gray-600 block mb-1">Hora promedio</span>
                      <div className="text-lg font-bold text-blue-700">{timeStats.avgArrivalTime}</div>
                    </div>
                    <div className="bg-white p-3 rounded-md">
                      <span className="text-xs text-gray-600 block mb-1">Puntualidad</span>
                      <div className="text-lg font-bold text-purple-700">{stats.punctualityRate}%</div>
                    </div>
                  </div>
                </div>

                {/* Attendance Rate */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Rango de Asistencia</span>
                    <Badge className={`${
                      stats.attendanceRate >= 90 ? 'bg-green-100 text-green-800 border-green-300' :
                      stats.attendanceRate >= 75 ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                      'bg-red-100 text-red-800 border-red-300'
                    }`}>
                      {stats.attendanceRate >= 90 ? 'Excelente' :
                       stats.attendanceRate >= 75 ? 'Bueno' :
                       stats.attendanceRate >= 60 ? 'Regular' :
                       'Requiere Atención'}
                    </Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div 
                      className={`h-4 rounded-full transition-all shadow-sm ${
                        stats.attendanceRate >= 90 ? 'bg-green-500' :
                        stats.attendanceRate >= 75 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${stats.attendanceRate}%` }}
                    ></div>
                  </div>
                  <div className="text-center">
                    <span className="text-4xl font-bold text-blue-600">{stats.attendanceRate}%</span>
                    <p className="text-xs text-gray-500 mt-1">Asistencia total del período</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Analysis Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Detector de Asistencia
              </CardTitle>
              <CardDescription>
                Análisis automático de patrones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 h-[calc(100%-2rem)]">
                {/* Status Indicator */}
                <div className={`p-3 rounded-lg border-2 ${
                  attendanceAnalysis.status === 'critical' ? 'bg-red-50 border-red-300' :
                  attendanceAnalysis.status === 'warning' ? 'bg-yellow-50 border-yellow-300' :
                  'bg-green-50 border-green-300'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`text-xl ${
                      attendanceAnalysis.status === 'critical' ? 'animate-pulse' : ''
                    }`}>
                      {attendanceAnalysis.status === 'critical' ? '🚨' :
                       attendanceAnalysis.status === 'warning' ? '⚠️' :
                       '✅'}
                    </div>
                    <h4 className={`font-semibold text-sm ${
                      attendanceAnalysis.status === 'critical' ? 'text-red-800' :
                      attendanceAnalysis.status === 'warning' ? 'text-yellow-800' :
                      'text-green-800'
                    }`}>
                      {attendanceAnalysis.status === 'critical' ? 'Atención Requerida' :
                       attendanceAnalysis.status === 'warning' ? 'Vigilar Situación' :
                       'Todo en Orden'}
                    </h4>
                  </div>
                  <p className="text-xs text-gray-600">
                    {attendanceAnalysis.status === 'critical' ? 'Se detectaron problemas que requieren atención inmediata' :
                     attendanceAnalysis.status === 'warning' ? 'Hay aspectos que requieren seguimiento' :
                     'El patrón de asistencia es satisfactorio'}
                  </p>
                </div>

                {/* Alerts List */}
                <div className="space-y-2 max-h-[280px] overflow-y-auto">
                  {attendanceAnalysis.alerts.map((alert, index) => (
                    <div 
                      key={index}
                      className={`p-2.5 rounded-lg border ${
                        alert.type === 'critical' ? 'bg-red-50 border-red-200' :
                        alert.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                        'bg-blue-50 border-blue-200'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-base">{alert.icon}</span>
                        <p className={`text-xs flex-1 leading-relaxed ${
                          alert.type === 'critical' ? 'text-red-800' :
                          alert.type === 'warning' ? 'text-yellow-800' :
                          'text-blue-800'
                        }`}>
                          {alert.message}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quick Stats */}
                <div className="pt-2 border-t border-gray-200">
                  <h5 className="text-xs font-semibold text-gray-700 mb-2">Resumen Rápido</h5>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between p-2 bg-gray-50 rounded">
                      <span className="text-gray-600">Total días:</span>
                      <span className="font-semibold">{stats.total}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-gray-50 rounded">
                      <span className="text-gray-600">Tasa asist.:</span>
                      <span className="font-semibold">{stats.attendanceRate}%</span>
                    </div>
                    <div className="flex justify-between p-2 bg-gray-50 rounded">
                      <span className="text-gray-600">Ausencias:</span>
                      <span className="font-semibold text-red-600">{stats.absent}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-gray-50 rounded">
                      <span className="text-gray-600">Tardanzas:</span>
                      <span className="font-semibold text-yellow-600">{stats.late}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Comunicados Section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Comunicados Recientes
            </CardTitle>
            <CardDescription>
              Mensajes importantes de la institución
            </CardDescription>
          </CardHeader>
          <CardContent>
            {comunicados.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {comunicados.map((com, idx) => {
                  const bgColor = 
                    com.tipo === 'success' ? 'bg-green-50 border-green-200' :
                    com.tipo === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                    com.tipo === 'info' ? 'bg-blue-50 border-blue-200' :
                    'bg-gray-50 border-gray-200';
                  
                  const emoji = 
                    com.tipo === 'success' ? '🎉' :
                    com.tipo === 'warning' ? '📚' :
                    '📝';
                  
                  return (
                    <div key={idx} className={`p-3 border rounded-lg ${bgColor}`}>
                      <div className="flex items-start gap-2">
                        <span className="text-xl">{emoji}</span>
                        <div className="flex-1">
                          {com.fecha && <div className="text-xs font-semibold mb-1">{com.fecha}</div>}
                          <p className="text-sm">{com.mensaje}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500">No hay comunicados recientes</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configuración de Cuenta
            </DialogTitle>
            <DialogDescription>
              Actualiza tus datos de contacto y preferencias de notificación
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Datos de Contacto */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <User className="h-4 w-4" />
                Datos de Contacto
              </h3>
              
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="telefono" className="flex items-center gap-2">
                    <Phone className="h-3 w-3" />
                    Teléfono
                  </Label>
                  <Input
                    id="telefono"
                    type="tel"
                    placeholder="+51 999 999 999"
                    value={parentProfile.telefono}
                    onChange={(e) => setParentProfile({...parentProfile, telefono: e.target.value})}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-3 w-3" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={parentProfile.email}
                    onChange={(e) => setParentProfile({...parentProfile, email: e.target.value})}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="direccion" className="flex items-center gap-2">
                    <MapPin className="h-3 w-3" />
                    Dirección
                  </Label>
                  <Input
                    id="direccion"
                    type="text"
                    placeholder="Av. Principal 123, Distrito, Ciudad"
                    value={parentProfile.direccion}
                    onChange={(e) => setParentProfile({...parentProfile, direccion: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* Preferencias de Notificación */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Preferencias de Notificación
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <Label htmlFor="notif-email" className="font-medium">Notificaciones por Email</Label>
                    <p className="text-xs text-gray-500">Recibir notificaciones en tu correo electrónico</p>
                  </div>
                  <Switch
                    id="notif-email"
                    checked={parentProfile.notificaciones_email}
                    onCheckedChange={(checked) => setParentProfile({...parentProfile, notificaciones_email: checked})}
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <Label htmlFor="notif-sms" className="font-medium">Notificaciones por SMS</Label>
                    <p className="text-xs text-gray-500">Recibir notificaciones por mensaje de texto</p>
                  </div>
                  <Switch
                    id="notif-sms"
                    checked={parentProfile.notificaciones_sms}
                    onCheckedChange={(checked) => setParentProfile({...parentProfile, notificaciones_sms: checked})}
                  />
                </div>
              </div>
            </div>

            {/* Tipos de Alertas */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Tipos de Alertas
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <Label htmlFor="notif-asistencia" className="font-medium">Asistencia</Label>
                    <p className="text-xs text-gray-500">Notificar sobre ausencias y tardanzas</p>
                  </div>
                  <Switch
                    id="notif-asistencia"
                    checked={parentProfile.notificar_asistencia}
                    onCheckedChange={(checked) => setParentProfile({...parentProfile, notificar_asistencia: checked})}
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <Label htmlFor="notif-calificaciones" className="font-medium">Calificaciones</Label>
                    <p className="text-xs text-gray-500">Notificar sobre nuevas calificaciones</p>
                  </div>
                  <Switch
                    id="notif-calificaciones"
                    checked={parentProfile.notificar_calificaciones}
                    onCheckedChange={(checked) => setParentProfile({...parentProfile, notificar_calificaciones: checked})}
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <Label htmlFor="notif-comportamiento" className="font-medium">Comportamiento</Label>
                    <p className="text-xs text-gray-500">Notificar sobre observaciones de conducta</p>
                  </div>
                  <Switch
                    id="notif-comportamiento"
                    checked={parentProfile.notificar_comportamiento}
                    onCheckedChange={(checked) => setParentProfile({...parentProfile, notificar_comportamiento: checked})}
                  />
                </div>
              </div>
            </div>

            {/* Frecuencia de Resumen */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">Frecuencia de Resumen</h3>
              <div className="grid gap-2">
                <Label htmlFor="frecuencia">Recibir resumen completo cada:</Label>
                <select
                  id="frecuencia"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={parentProfile.frecuencia_resumen}
                  onChange={(e) => setParentProfile({...parentProfile, frecuencia_resumen: e.target.value as 'diario' | 'semanal' | 'mensual'})}
                >
                  <option value="diario">Diario</option>
                  <option value="semanal">Semanal</option>
                  <option value="mensual">Mensual</option>
                </select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSettingsOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveSettings} disabled={profileLoading}>
              {profileLoading ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ParentView;
