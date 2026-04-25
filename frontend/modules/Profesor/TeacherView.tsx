"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Input } from "@/app/components/ui/input";
import {
  AlertCircle,
  Bell,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  LogOut,
  Search,
  Settings,
  Users,
  XCircle,
} from "lucide-react";

interface Student {
  id: string;
  name: string;
  status: "present" | "absent" | "late" | "pending";
  time?: string;
  photo: string;
}

interface TeacherPanelResponse {
  teacher: {
    email: string;
    name: string;
    classroom: string;
    course: string;
  };
  classes: string[];
  students: Student[];
  error?: string;
}

interface TeacherViewProps {
  userEmail: string;
  onLogout: () => void;
}

const teacherEmailMap: Record<string, string> = {
  "profesor.silva@gmail.com": "profesor001@demo.scei.pe",
  "profesor.martinez@gmail.com": "profesor002@demo.scei.pe",
  "profesor.lopez@gmail.com": "profesor003@demo.scei.pe",
};

export function TeacherView({ userEmail, onLogout }: TeacherViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [teacherName, setTeacherName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const resolvedTeacherEmail = useMemo(
    () => teacherEmailMap[userEmail.toLowerCase()] || userEmail.toLowerCase(),
    [userEmail],
  );

  useEffect(() => {
    const loadTeacherPanel = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`http://localhost:8000/api/reports/profesores/${resolvedTeacherEmail}/panel/`);
        const data = (await response.json()) as TeacherPanelResponse;

        if (!response.ok) {
          throw new Error(data.error || "No se pudo cargar la vista del profesor.");
        }

        setStudents(data.students || []);
        setClasses(data.classes || []);
        setSelectedClass(data.teacher?.classroom || data.classes?.[0] || "");
        setTeacherName(data.teacher?.name || resolvedTeacherEmail.split("@")[0]);
      } catch (currentError) {
        setStudents([]);
        setClasses([]);
        setTeacherName("");
        setSelectedClass("");
        setError(currentError instanceof Error ? currentError.message : "No se pudo cargar la vista del profesor.");
      } finally {
        setLoading(false);
      }
    };

    void loadTeacherPanel();
  }, [resolvedTeacherEmail]);

  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const updateStudentStatus = (studentId: string, status: Student["status"]) => {
    setStudents((prev) =>
      prev.map((student) =>
        student.id === studentId
          ? {
              ...student,
              status,
              time:
                status === "present" || status === "late"
                  ? new Date().toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })
                  : undefined,
            }
          : student,
      ),
    );
  };

  const getStatusBadge = (status: Student["status"]) => {
    switch (status) {
      case "present":
        return <Badge className="border-green-300 bg-green-100 text-green-800">Presente</Badge>;
      case "late":
        return <Badge className="border-yellow-300 bg-yellow-100 text-yellow-800">Tardanza</Badge>;
      case "absent":
        return <Badge className="border-red-300 bg-red-100 text-red-800">Ausente</Badge>;
      case "pending":
        return <Badge className="border-gray-300 bg-gray-100 text-gray-800">Pendiente</Badge>;
    }
  };

  const stats = {
    total: students.length,
    present: students.filter((student) => student.status === "present").length,
    late: students.filter((student) => student.status === "late").length,
    absent: students.filter((student) => student.status === "absent").length,
    pending: students.filter((student) => student.status === "pending").length,
  };

  const attendanceRate = stats.total > 0 ? Math.round(((stats.present + stats.late) / stats.total) * 100) : 0;
  const punctualityRate =
    stats.present + stats.late > 0 ? Math.round((stats.present / (stats.present + stats.late)) * 100) : 0;
  const completionRate = stats.total > 0 ? Math.round(((stats.total - stats.pending) / stats.total) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <h1 className="text-2xl text-red-600">Fe y Alegria</h1>
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
                <p className="text-sm text-gray-700">{teacherName || `Prof. ${userEmail.split("@")[0]}`}</p>
                <p className="text-xs text-gray-500">{selectedClass || "Sin aula asignada"}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onLogout}
                className="text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-6">
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
              <div className="text-2xl text-blue-600">{attendanceRate}%</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Lista de Estudiantes - {selectedClass || "Sin aula"}
                  </CardTitle>
                  <CardDescription>Confirma la asistencia de tus estudiantes con datos reales</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <select
                    value={selectedClass}
                    onChange={(event) => setSelectedClass(event.target.value)}
                    className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                    disabled={classes.length <= 1}
                  >
                    {(classes.length > 0 ? classes : ["Sin aula asignada"]).map((classroom) => (
                      <option key={classroom} value={classroom}>
                        {classroom}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                <Input
                  placeholder="Buscar estudiante..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>

            <CardContent>
              {loading ? (
                <div className="py-10 text-center text-sm text-gray-500">Cargando estudiantes reales...</div>
              ) : filteredStudents.length === 0 ? (
                <div className="py-10 text-center text-sm text-gray-500">No hay estudiantes asignados para este profesor.</div>
              ) : (
                <div className="max-h-96 space-y-3 overflow-y-auto">
                  {filteredStudents.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between rounded-lg border p-4 hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{student.photo}</div>
                        <div>
                          <h4 className="text-sm">{student.name}</h4>
                          <p className="text-xs text-gray-500">
                            ID: {student.id}
                            {student.time ? ` • ${student.time}` : ""}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {getStatusBadge(student.status)}
                        {student.status === "pending" && (
                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateStudentStatus(student.id, "present")}
                              className="border-green-600 text-green-600 hover:bg-green-50"
                            >
                              ✓
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateStudentStatus(student.id, "late")}
                              className="border-yellow-600 text-yellow-600 hover:bg-yellow-50"
                            >
                              ⏰
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateStudentStatus(student.id, "absent")}
                              className="border-red-600 text-red-600 hover:bg-red-50"
                            >
                              ✕
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Acciones Rapidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Marcar Todos Presentes
                </Button>
                <Button variant="outline" className="w-full">
                  <Calendar className="mr-2 h-4 w-4" />
                  Ver Historial
                </Button>
                <Button variant="outline" className="w-full">
                  <Users className="mr-2 h-4 w-4" />
                  Exportar Lista
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resumen del Dia</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Asistencia:</span>
                    <span>{attendanceRate}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Puntualidad:</span>
                    <span>{punctualityRate}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Registro completo:</span>
                    <span>{completionRate}%</span>
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
                  <div className="rounded border border-yellow-200 bg-yellow-50 p-2">
                    Revisa las tardanzas del salon antes de cerrar asistencia.
                  </div>
                  <div className="rounded border border-blue-200 bg-blue-50 p-2">
                    Puedes filtrar por nombre para ubicar estudiantes rapido.
                  </div>
                  <div className="rounded border border-red-200 bg-red-50 p-2">
                    {stats.pending} estudiantes pendientes de registro hoy.
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
