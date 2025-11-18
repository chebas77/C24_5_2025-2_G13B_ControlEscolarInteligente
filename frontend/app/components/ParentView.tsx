import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Calendar } from "./ui/calendar";
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
  Download
} from "lucide-react";

interface AttendanceRecord {
  date: string;
  status: 'present' | 'absent' | 'late';
  time?: string;
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

interface ParentViewProps {
  userEmail: string;
  onLogout: () => void;
}

export function ParentView({ userEmail, onLogout }: ParentViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [calificaciones, setCalificaciones] = useState<Calificaciones | null>(null);
  const [comportamiento, setComportamiento] = useState<Comportamiento | null>(null);
  const [comunicados, setComunicados] = useState<Comunicado[]>([]);

  // Obtén los hijos (alumnos) del padre y sus asistencias
  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:8000/api/reports/padres/${userEmail}/alumnos/`)
      .then(res => res.json())
      .then(data => {
        console.log('Datos recibidos del backend:', data);
        const alumnos: Student[] = data.alumnos.map((alumno: any) => ({
          id: alumno.id,
          name: alumno.name,
          grade: alumno.grade,
          photo: alumno.photo || "👧",
          attendance: alumno.attendance
        }));
        console.log('Alumnos procesados:', alumnos);
        console.log('Attendance del primer alumno:', alumnos[0]?.attendance);
        setStudents(alumnos);
        setLoading(false);
        
        // Cargar datos adicionales del primer hijo
        if (alumnos.length > 0) {
          loadStudentData(alumnos[0].id);
        }
      })
      .catch(() => setLoading(false));
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
  if (!students || students.length === 0) {
    return <div>No se encontraron alumnos. Verifica que el servidor esté corriendo.</div>
  }

  const student = students[0];
  
  if (!student) {
    return <div>Error al cargar datos del estudiante.</div>
  }
  
  const getAttendanceForPeriod = () => {
    if (!student || !student.attendance) {
      return [];
    }
    
    // Si es "all", retornar todos los registros
    if (selectedPeriod === "all") {
      console.log('Mostrando todos los registros:', student.attendance);
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
      return new Date(record.date) >= filterDate;
    });
    
    console.log(`Filtrado por ${selectedPeriod}: ${filtered.length} de ${student.attendance.length} registros`);
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
    const dateStr = date.toISOString().split('T')[0];
    const recordsForDate = student.attendance.filter(record => record.date === dateStr);
    
    if (recordsForDate.length === 0) return null;
    
    // Si hay múltiples registros, priorizar: ausente > tardanza > presente
    const absent = recordsForDate.find(r => r.status === 'absent');
    if (absent) return absent;
    
    const late = recordsForDate.find(r => r.status === 'late');
    if (late) return late;
    
    return recordsForDate[0]; // Retorna el primero si todos son presentes
  };

  const selectedDateRecord = selectedDate ? getAttendanceForDate(selectedDate) : null;

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

      const date = new Date(dateStr);
      
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
              <Button variant="ghost" size="sm">
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
            <div className="flex items-center space-x-4">
              <div className="text-4xl">{student.photo}</div>
              <div>
                <CardTitle className="text-2xl">{student.name}</CardTitle>
                <CardDescription className="text-lg">{student.grade} • ID: {student.id}</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Period Selector */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <h2 className="text-xl sm:text-2xl text-gray-900">Reporte de Asistencia</h2>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 whitespace-nowrap">Período:</span>
              <select 
                value={selectedPeriod} 
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full sm:w-auto"
              >
                <option value="all">Todo</option>
                <option value="week">Última semana</option>
                <option value="month">Último mes</option>
                <option value="quarter">Último trimestre</option>
                <option value="year">Último año</option>
              </select>
            </div>
            
            <div className="flex items-center gap-1 flex-wrap">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleExport('pdf')}
                title="Exportar a PDF"
                className="text-xs sm:text-sm"
              >
                <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                PDF
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleExport('csv')}
                title="Exportar a CSV"
                className="text-xs sm:text-sm"
              >
                <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                CSV
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleExport('excel')}
                title="Exportar a Excel"
                className="text-xs sm:text-sm"
              >
                <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                Excel
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6">
              <CardTitle className="text-xs sm:text-sm">Días</CardTitle>
              <CalendarIcon className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <div className="text-xl sm:text-2xl">{stats.total}</div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">días escolares</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6">
              <CardTitle className="text-xs sm:text-sm">Presentes</CardTitle>
              <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <div className="text-xl sm:text-2xl text-green-600">{stats.present}</div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">días asistidos</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6">
              <CardTitle className="text-xs sm:text-sm">Tardanzas</CardTitle>
              <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-600" />
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <div className="text-xl sm:text-2xl text-yellow-600">{stats.late}</div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">llegadas tarde</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6">
              <CardTitle className="text-xs sm:text-sm">Ausencias</CardTitle>
              <XCircle className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <div className="text-xl sm:text-2xl text-red-600">{stats.absent}</div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">días faltados</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6">
              <CardTitle className="text-xs sm:text-sm">% Asistencia</CardTitle>
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <div className="text-xl sm:text-2xl text-blue-600">{stats.attendanceRate}%</div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">total período</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6">
              <CardTitle className="text-xs sm:text-sm">% Puntualidad</CardTitle>
              <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600" />
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <div className="text-xl sm:text-2xl text-purple-600">{stats.punctualityRate}%</div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">llegadas a tiempo</p>
            </CardContent>
          </Card>
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
                onSelect={setSelectedDate}
                className="rounded-md border"
                modifiers={{
                  present: calendarDates.present,
                  late: calendarDates.late,
                  absent: calendarDates.absent,
                }}
                modifiersStyles={{
                  present: { backgroundColor: '#dcfce7', color: '#166534' },
                  late: { backgroundColor: '#fef3c7', color: '#92400e' },
                  absent: { backgroundColor: '#fee2e2', color: '#991b1b' },
                }}
              />
              
              {selectedDateRecord && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <h4 className="text-sm mb-2">Detalle del día seleccionado:</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Fecha:</span>
                      <span className="font-medium">{selectedDate?.toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Estado:</span>
                      {getStatusBadge(selectedDateRecord.status)}
                    </div>
                    {selectedDateRecord.time && (
                      <div className="flex justify-between">
                        <span>Hora:</span>
                        <span>{selectedDateRecord.time}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                    </div>
                    {selectedDateRecord.observations && (
                      <div className="mt-2">
                        <span className="text-xs text-gray-600">Observaciones:</span>
                        <p className="text-xs mt-1 p-2 bg-yellow-50 border border-yellow-200 rounded">
                          {selectedDateRecord.observations}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
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
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {periodData.reverse().map((record, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="text-center min-w-[60px]">
                        <div className="text-sm">{new Date(record.date).toLocaleDateString('es-PE', { weekday: 'short' })}</div>
                        <div className="text-xs text-gray-500">{new Date(record.date).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' })}</div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          {getStatusBadge(record.status)}
                          {record.time && (
                            <span className="text-xs text-gray-500">{record.time}</span>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-gray-600">
                          <span>📚 {record.status === 'present' ? 'Día completo' : record.status === 'late' ? 'Llegada tardía' : 'Ausencia'}</span>
                        </div>
                        {record.observations && (
                          <p className="text-xs text-gray-500 mt-1 italic">
                            "{record.observations}"
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Rendimiento Académico</CardTitle>
            </CardHeader>
            <CardContent>
              {calificaciones ? (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Promedio General:</span>
                    <span className="text-green-600">{calificaciones.promedio_general}</span>
                  </div>
                  {calificaciones.cursos.map((curso, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>{curso.nombre}:</span>
                      <span>{curso.nota}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Cargando calificaciones...</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Comportamiento</CardTitle>
            </CardHeader>
            <CardContent>
              {comportamiento ? (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Conducta:</span>
                    <span className="text-green-600">{comportamiento.conducta}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Participación:</span>
                    <span className="text-green-600">{comportamiento.participacion}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Trabajo en equipo:</span>
                    <span className="text-green-600">{comportamiento.trabajo_equipo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Puntualidad tareas:</span>
                    <span className="text-yellow-600">{comportamiento.puntualidad_tareas}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Responsabilidad:</span>
                    <span className="text-green-600">{comportamiento.responsabilidad}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Respeto:</span>
                    <span className="text-green-600">{comportamiento.respeto}</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Cargando comportamiento...</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Comunicados Recientes</CardTitle>
            </CardHeader>
            <CardContent>
              {comunicados.length > 0 ? (
                <div className="space-y-2 text-sm">
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
                      <div key={idx} className={`p-2 border rounded ${bgColor}`}>
                        {emoji} {com.fecha && <strong>{com.fecha}:</strong>} {com.mensaje}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No hay comunicados recientes</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default ParentView;