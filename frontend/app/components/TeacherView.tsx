import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Input } from "./ui/input";
import { 
  LogOut, 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search,
  Calendar,
  AlertCircle,
  BookOpen,
  Settings,
  Bell
} from "lucide-react";

interface Student {
  id: string;
  name: string;
  status: 'present' | 'absent' | 'late' | 'pending';
  time?: string;
  photo: string;
}

interface TeacherViewProps {
  userEmail: string;
  onLogout: () => void;
}

export function TeacherView({ userEmail, onLogout }: TeacherViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("5to A");
  
  const [students, setStudents] = useState<Student[]>([
    { 
      id: "001", 
      name: "Ana García Pérez", 
      status: 'present', 
      time: "07:45", 
      photo: "👧"
    },
    { 
      id: "002", 
      name: "Carlos Mendoza Silva", 
      status: 'present', 
      time: "07:50", 
      photo: "👦"
    },
    { 
      id: "003", 
      name: "María López Torres", 
      status: 'late', 
      time: "08:15", 
      photo: "👧"
    },
    { 
      id: "004", 
      name: "José Ramírez Cruz", 
      status: 'present', 
      time: "07:55", 
      photo: "👦"
    },
    { 
      id: "005", 
      name: "Sofía Ruiz Morales", 
      status: 'pending', 
      photo: "👧"
    },
    { 
      id: "006", 
      name: "Diego Fernández Luna", 
      status: 'pending', 
      photo: "👦"
    },
    { 
      id: "007", 
      name: "Isabella Castro Vega", 
      status: 'present', 
      time: "07:40", 
      photo: "👧"
    },
    { 
      id: "008", 
      name: "Alejandro Ponce Díaz", 
      status: 'absent', 
      photo: "👦"
    }
  ]);

  const classes = ["5to A", "5to B", "4to A", "4to B"];

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const updateStudentStatus = (studentId: string, status: Student['status']) => {
    setStudents(prev => prev.map(student => 
      student.id === studentId 
        ? { 
            ...student, 
            status, 
            time: status === 'present' || status === 'late' 
              ? new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
              : undefined
          }
        : student
    ));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return <Badge className="bg-green-100 text-green-800 border-green-300">Presente</Badge>;
      case 'late':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Tardanza</Badge>;
      case 'absent':
        return <Badge className="bg-red-100 text-red-800 border-red-300">Ausente</Badge>;
      case 'pending':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-300">Pendiente</Badge>;
      default:
        return <Badge variant="secondary">Desconocido</Badge>;
    }
  };

  const stats = {
    total: students.length,
    present: students.filter(s => s.status === 'present').length,
    late: students.filter(s => s.status === 'late').length,
    absent: students.filter(s => s.status === 'absent').length,
    pending: students.filter(s => s.status === 'pending').length
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl text-red-600">Fe y Alegría</h1>
              <span className="ml-4 text-gray-500">|</span>
              <span className="ml-4 text-gray-700">Portal Docente</span>
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
                  <p className="text-sm text-gray-700">Prof. {userEmail.split('@')[0]}</p>
                  <p className="text-xs text-gray-500">{selectedClass}</p>
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
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Total</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{stats.total}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Presentes</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl text-green-600">{stats.present}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Tardanzas</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl text-yellow-600">{stats.late}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Ausentes</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl text-red-600">{stats.absent}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Pendientes</CardTitle>
              <AlertCircle className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl text-gray-600">{stats.pending}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">% Asistencia</CardTitle>
              <CheckCircle className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl text-blue-600">
                {Math.round(((stats.present + stats.late) / stats.total) * 100)}%
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Student List */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Lista de Estudiantes - {selectedClass}
                  </CardTitle>
                  <CardDescription>
                    Confirma la asistencia de tus estudiantes
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <select 
                    value={selectedClass} 
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    {classes.map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar estudiante..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredStudents.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{student.photo}</div>
                      <div>
                        <h4 className="text-sm">{student.name}</h4>
                        <p className="text-xs text-gray-500">
                          ID: {student.id}
                          {student.time && ` • ${student.time}`}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(student.status)}
                      {student.status === 'pending' && (
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateStudentStatus(student.id, 'present')}
                            className="text-green-600 border-green-600 hover:bg-green-50"
                          >
                            ✓
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateStudentStatus(student.id, 'late')}
                            className="text-yellow-600 border-yellow-600 hover:bg-yellow-50"
                          >
                            ⏰
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateStudentStatus(student.id, 'absent')}
                            className="text-red-600 border-red-600 hover:bg-red-50"
                          >
                            ✗
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Marcar Todos Presentes
                </Button>
                <Button variant="outline" className="w-full">
                  <Calendar className="h-4 w-4 mr-2" />
                  Ver Historial
                </Button>
                <Button variant="outline" className="w-full">
                  <Users className="h-4 w-4 mr-2" />
                  Exportar Lista
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resumen del Día</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Asistencia:</span>
                    <span className="text-sm">
                      {Math.round(((stats.present + stats.late) / stats.total) * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Puntualidad:</span>
                    <span className="text-sm">
                      {Math.round((stats.present / (stats.present + stats.late)) * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Registro completo:</span>
                    <span className="text-sm">
                      {Math.round(((stats.total - stats.pending) / stats.total) * 100)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recordatorios</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="p-2 bg-yellow-50 border border-yellow-200 rounded">
                    📝 Evaluación programada para mañana
                  </div>
                  <div className="p-2 bg-blue-50 border border-blue-200 rounded">
                    📚 Reunión de padres el viernes
                  </div>
                  <div className="p-2 bg-red-50 border border-red-200 rounded">
                    ⚠️ {stats.pending} estudiantes pendientes de registro
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeacherView;