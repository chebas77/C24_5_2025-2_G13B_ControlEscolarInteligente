import { useState } from "react";
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

interface ParentViewProps {
  userEmail: string;
  onLogout: () => void;
}

export function ParentView({ userEmail, onLogout }: ParentViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedPeriod, setSelectedPeriod] = useState("week");

  // Datos simulados del estudiante
  const student: Student = {
    id: "001",
    name: "Ana García Pérez",
    grade: "5to A",
    photo: "👧",
    attendance: [
      { date: "2024-01-02", status: 'present', time: "07:45", teacher: "Prof. Silva" },
      { date: "2024-01-03", status: 'present', time: "07:50", teacher: "Prof. Silva" },
      { date: "2024-01-04", status: 'late', time: "08:15", teacher: "Prof. Silva", observations: "Llegó tarde por cita médica" },
      { date: "2024-01-05", status: 'present', time: "07:40", teacher: "Prof. Silva" },
      { date: "2024-01-08", status: 'present', time: "07:55", teacher: "Prof. Silva" },
      { date: "2024-01-09", status: 'present', time: "07:42", teacher: "Prof. Silva" },
      { date: "2024-01-10", status: 'late', time: "08:10", teacher: "Prof. Silva" },
      { date: "2024-01-11", status: 'present', time: "07:48", teacher: "Prof. Silva" },
      { date: "2024-01-12", status: 'present', time: "07:44", teacher: "Prof. Silva" },
      { date: "2024-01-15", status: 'present', time: "07:45", teacher: "Prof. Silva" },
      { date: "2024-01-16", status: 'present', time: "07:50", teacher: "Prof. Silva" },
      { date: "2024-01-17", status: 'late', time: "08:15", teacher: "Prof. Silva", observations: "Llegó tarde por cita médica" },
      { date: "2024-01-18", status: 'present', time: "07:40", teacher: "Prof. Silva" },
      { date: "2024-01-19", status: 'absent', teacher: "Prof. Silva", observations: "Enfermedad justificada" },
      { date: "2024-01-22", status: 'present', time: "07:55", teacher: "Prof. Silva" },
      { date: "2024-01-23", status: 'present', time: "07:42", teacher: "Prof. Silva" },
      { date: "2024-01-24", status: 'late', time: "08:10", teacher: "Prof. Silva" },
      { date: "2024-01-25", status: 'present', time: "07:48", teacher: "Prof. Silva" },
      { date: "2024-01-26", status: 'present', time: "07:44", teacher: "Prof. Silva" },
      { date: "2024-01-29", status: 'present', time: "07:47", teacher: "Prof. Silva" },
      { date: "2024-01-30", status: 'late', time: "08:05", teacher: "Prof. Silva", observations: "Tráfico intenso" },
      { date: "2024-01-31", status: 'present', time: "07:52", teacher: "Prof. Silva" },
      { date: "2024-02-01", status: 'present', time: "07:38", teacher: "Prof. Silva" },
      { date: "2024-02-02", status: 'present', time: "07:43", teacher: "Prof. Silva" },
      { date: "2024-02-05", status: 'absent', teacher: "Prof. Silva", observations: "Emergencia familiar" },
      { date: "2024-02-06", status: 'present', time: "07:41", teacher: "Prof. Silva" },
      { date: "2024-02-07", status: 'present', time: "07:46", teacher: "Prof. Silva" },
      { date: "2024-02-08", status: 'late', time: "08:12", teacher: "Prof. Silva" },
      { date: "2024-02-09", status: 'present', time: "07:39", teacher: "Prof. Silva" },
      { date: "2024-02-12", status: 'present', time: "07:44", teacher: "Prof. Silva" }
    ]
  };

  const getAttendanceForPeriod = () => {
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
      default:
        filterDate.setDate(now.getDate() - 7);
    }
    
    return student.attendance.filter(record => 
      new Date(record.date) >= filterDate
    );
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
    const dateStr = date.toISOString().split('T')[0];
    return student.attendance.find(record => record.date === dateStr);
  };

  const selectedDateRecord = selectedDate ? getAttendanceForDate(selectedDate) : null;

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
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl text-gray-900">Reporte de Asistencia</h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Período:</span>
            <select 
              value={selectedPeriod} 
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="week">Última semana</option>
              <option value="month">Último mes</option>
              <option value="quarter">Último trimestre</option>
            </select>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Días</CardTitle>
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{stats.total}</div>
              <p className="text-xs text-muted-foreground">días escolares</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Presentes</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl text-green-600">{stats.present}</div>
              <p className="text-xs text-muted-foreground">días asistidos</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Tardanzas</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl text-yellow-600">{stats.late}</div>
              <p className="text-xs text-muted-foreground">llegadas tarde</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Ausencias</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl text-red-600">{stats.absent}</div>
              <p className="text-xs text-muted-foreground">días faltados</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">% Asistencia</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl text-blue-600">{stats.attendanceRate}%</div>
              <p className="text-xs text-muted-foreground">total período</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">% Puntualidad</CardTitle>
              <Clock className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl text-purple-600">{stats.punctualityRate}%</div>
              <p className="text-xs text-muted-foreground">llegadas a tiempo</p>
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
                  present: student.attendance.filter(r => r.status === 'present').map(r => new Date(r.date)),
                  late: student.attendance.filter(r => r.status === 'late').map(r => new Date(r.date)),
                  absent: student.attendance.filter(r => r.status === 'absent').map(r => new Date(r.date)),
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
                      <span>Profesor:</span>
                      <span>{selectedDateRecord.teacher}</span>
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
                          <span>👨‍🏫 {record.teacher}</span>
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
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Promedio General:</span>
                  <span className="text-green-600">16.5</span>
                </div>
                <div className="flex justify-between">
                  <span>Matemáticas:</span>
                  <span>17</span>
                </div>
                <div className="flex justify-between">
                  <span>Comunicación:</span>
                  <span>16</span>
                </div>
                <div className="flex justify-between">
                  <span>Ciencias:</span>
                  <span>16.8</span>
                </div>
                <div className="flex justify-between">
                  <span>Inglés:</span>
                  <span>15.5</span>
                </div>
                <div className="flex justify-between">
                  <span>Historia:</span>
                  <span>16.2</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Comportamiento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Conducta:</span>
                  <span className="text-green-600">A</span>
                </div>
                <div className="flex justify-between">
                  <span>Participación:</span>
                  <span className="text-green-600">Muy Buena</span>
                </div>
                <div className="flex justify-between">
                  <span>Trabajo en equipo:</span>
                  <span className="text-green-600">Excelente</span>
                </div>
                <div className="flex justify-between">
                  <span>Puntualidad tareas:</span>
                  <span className="text-yellow-600">Buena</span>
                </div>
                <div className="flex justify-between">
                  <span>Responsabilidad:</span>
                  <span className="text-green-600">Muy Buena</span>
                </div>
                <div className="flex justify-between">
                  <span>Respeto:</span>
                  <span className="text-green-600">Excelente</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Comunicados Recientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="p-2 bg-blue-50 border border-blue-200 rounded">
                  📝 <strong>15/02:</strong> Evaluación de matemáticas el viernes 18
                </div>
                <div className="p-2 bg-green-50 border border-green-200 rounded">
                  🎉 <strong>12/02:</strong> Excelente participación en feria de ciencias
                </div>
                <div className="p-2 bg-yellow-50 border border-yellow-200 rounded">
                  📚 <strong>10/02:</strong> Reunión de padres - 20 de febrero, 6:00 PM
                </div>
                <div className="p-2 bg-purple-50 border border-purple-200 rounded">
                  🎭 <strong>08/02:</strong> Festival de arte el 25 de febrero
                </div>
                <div className="p-2 bg-orange-50 border border-orange-200 rounded">
                  🏃‍♀️ <strong>05/02:</strong> Olimpiadas deportivas - inscripciones abiertas
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default ParentView;