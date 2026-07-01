"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Input } from "@/app/components/ui/input";
import {
  Bell,
  BookOpen,
  CheckCircle,
  Clock,
  Download,
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

type SortMode = "az" | "za";
type StatusFilter = "all" | Student["status"];
type ExportFormat = "excel" | "pdf";

function getLastNameSortKey(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length <= 1) return fullName;

  const [firstName, ...lastNames] = parts;
  return `${lastNames.join(" ")} ${firstName}`;
}

function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
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
  const [sortMode, setSortMode] = useState<SortMode>("az");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedClass, setSelectedClass] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [teacherName, setTeacherName] = useState("");
  const [selectedDate, setSelectedDate] = useState(() => formatDateInput(new Date()));
  const [exportStartDate, setExportStartDate] = useState(() => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 29);
    return formatDateInput(startDate);
  });
  const [exportEndDate, setExportEndDate] = useState(() => formatDateInput(new Date()));
  const [exportFormat, setExportFormat] = useState<ExportFormat>("excel");
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

        const params = new URLSearchParams({ date: selectedDate });
        const response = await fetch(
          `http://localhost:8000/api/reports/profesores/${resolvedTeacherEmail}/panel/?${params.toString()}`,
        );
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
  }, [resolvedTeacherEmail, selectedDate]);

  const filteredStudents = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return students
      .filter((student) => {
        const matchesSearch = student.name.toLowerCase().includes(normalizedSearch);
        const matchesStatus = statusFilter === "all" || student.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((firstStudent, secondStudent) => {
        const comparison = getLastNameSortKey(firstStudent.name).localeCompare(getLastNameSortKey(secondStudent.name), "es", {
          sensitivity: "base",
        });
        return sortMode === "az" ? comparison : -comparison;
      });
  }, [searchTerm, sortMode, statusFilter, students]);

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
        return <Badge className="border-red-300 bg-red-100 text-red-800">Falta</Badge>;
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

  const handleExportAttendance = () => {
    const params = new URLSearchParams({
      start_date: exportStartDate,
      end_date: exportEndDate,
      formato: exportFormat,
    });
    window.open(
      `http://localhost:8000/api/reports/profesores/${resolvedTeacherEmail}/exportar-asistencia/?${params.toString()}`,
      "_blank",
    );
  };

  return (
    <div className="auth-shell min-h-screen bg-gradient-to-b from-white to-gray-100">
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex min-h-16 max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <h1 className="truncate text-xl font-semibold text-red-600 sm:text-2xl">Fe y Alegria</h1>
              <span className="hidden text-gray-300 sm:inline">|</span>
              <span className="hidden text-sm font-medium text-gray-700 sm:inline">Portal Docente</span>
            </div>
            <p className="mt-0.5 text-xs text-gray-500 sm:hidden">{selectedClass || "Sin aula asignada"}</p>
          </div>

          <div className="flex min-w-0 items-center gap-1 sm:gap-3">
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
            <div className="flex min-w-0 items-center gap-2">
              <div className="hidden text-right sm:block">
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

      <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <Card className="rounded-lg border-gray-200 bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 pb-2 pt-4">
              <CardTitle className="text-sm">Total</CardTitle>
              <div className="rounded-md bg-gray-100 p-2">
                <Users className="h-4 w-4 text-gray-600" />
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-2xl font-semibold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card className="rounded-lg border-green-100 bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 pb-2 pt-4">
              <CardTitle className="text-sm">Presentes</CardTitle>
              <div className="rounded-md bg-green-50 p-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-2xl font-semibold text-green-600">{stats.present}</div>
            </CardContent>
          </Card>

          <Card className="rounded-lg border-yellow-100 bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 pb-2 pt-4">
              <CardTitle className="text-sm">Tardanzas</CardTitle>
              <div className="rounded-md bg-yellow-50 p-2">
                <Clock className="h-4 w-4 text-yellow-600" />
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-2xl font-semibold text-yellow-600">{stats.late}</div>
            </CardContent>
          </Card>

          <Card className="rounded-lg border-red-100 bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 pb-2 pt-4">
              <CardTitle className="text-sm">Faltas</CardTitle>
              <div className="rounded-md bg-red-50 p-2">
                <XCircle className="h-4 w-4 text-red-600" />
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-2xl font-semibold text-red-600">{stats.absent}</div>
            </CardContent>
          </Card>

          <Card className="rounded-lg border-blue-100 bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 pb-2 pt-4">
              <CardTitle className="text-sm">% Asistencia</CardTitle>
              <div className="rounded-md bg-blue-50 p-2">
                <CheckCircle className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-2xl font-semibold text-blue-600">{attendanceRate}%</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
          <Card className="h-full rounded-lg border-gray-200 bg-white shadow-sm">
            <CardHeader className="px-4 pt-4 sm:px-6 sm:pt-6">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <CardTitle className="flex items-center gap-2 text-base font-semibold">
                    <span className="rounded-md bg-red-50 p-2">
                      <BookOpen className="h-4 w-4 text-red-600" />
                    </span>
                    Asistencia - {selectedClass || "Sin aula"}
                  </CardTitle>
                  <CardDescription>Estado diario de los estudiantes segun sus marcaciones</CardDescription>
                </div>
                <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-[1fr_110px] lg:w-auto">
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(event) => setSelectedDate(event.target.value)}
                    className="h-9 w-full lg:w-[150px]"
                  />
                  <select
                    value={selectedClass}
                    onChange={(event) => setSelectedClass(event.target.value)}
                    className="h-9 rounded-md border border-gray-300 bg-white px-3 text-sm"
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

              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[1fr_150px_150px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                  <Input
                    placeholder="Buscar estudiante..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
                  className="h-9 rounded-md border border-gray-300 bg-white px-3 text-sm"
                >
                  <option value="all">Todos</option>
                  <option value="present">Presentes</option>
                  <option value="late">Tardanzas</option>
                  <option value="absent">Faltas</option>
                </select>
                <select
                  value={sortMode}
                  onChange={(event) => setSortMode(event.target.value as SortMode)}
                  className="h-9 rounded-md border border-gray-300 bg-white px-3 text-sm"
                >
                  <option value="az">A-Z</option>
                  <option value="za">Z-A</option>
                </select>
              </div>
            </CardHeader>

            <CardContent className="flex min-h-0 flex-1 flex-col px-4 sm:px-6">
              {loading ? (
                <div className="py-10 text-center text-sm text-gray-500">Cargando estudiantes reales...</div>
              ) : filteredStudents.length === 0 ? (
                <div className="py-10 text-center text-sm text-gray-500">No hay estudiantes asignados para este profesor.</div>
              ) : (
                <div className="max-h-[70vh] min-h-[420px] flex-1 space-y-3 overflow-y-auto pr-1 sm:min-h-[520px] lg:min-h-0">
                  {filteredStudents.map((student) => (
                    <div
                      key={student.id}
                      className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition hover:border-gray-300 hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between sm:p-4"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-gray-100 text-xl">
                          {student.photo}
                        </div>
                        <div className="min-w-0">
                          <h4 className="truncate text-sm font-medium text-gray-900">{student.name}</h4>
                          <p className="text-xs text-gray-500">
                            ID: {student.id}
                            {student.time ? ` • ${student.time}` : ""}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2 sm:justify-end">
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

          <div className="space-y-5">
            <Card className="rounded-lg border-gray-200 bg-white shadow-sm">
              <CardHeader className="px-4 pt-4 sm:px-6 sm:pt-6">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <span className="rounded-md bg-green-50 p-2">
                    <Download className="h-4 w-4 text-green-700" />
                  </span>
                  Exportar Data
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 px-4 sm:px-6">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-600" htmlFor="export-start-date">
                      Desde
                    </label>
                    <Input
                      id="export-start-date"
                      type="date"
                      value={exportStartDate}
                      onChange={(event) => setExportStartDate(event.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-600" htmlFor="export-end-date">
                      Hasta
                    </label>
                    <Input
                      id="export-end-date"
                      type="date"
                      value={exportEndDate}
                      onChange={(event) => setExportEndDate(event.target.value)}
                    />
                  </div>
                </div>
                <select
                  value={exportFormat}
                  onChange={(event) => setExportFormat(event.target.value as ExportFormat)}
                  className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
                >
                  <option value="excel">Excel</option>
                  <option value="pdf">PDF</option>
                </select>
                <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handleExportAttendance}>
                  <Download className="mr-2 h-4 w-4" />
                  Exportar
                </Button>
              </CardContent>
            </Card>

            <Card className="rounded-lg border-gray-200 bg-white shadow-sm">
              <CardHeader className="px-4 pt-4 sm:px-6 sm:pt-6">
                <CardTitle className="text-base font-semibold">Resumen del Dia</CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Asistencia:</span>
                    <span>{attendanceRate}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Puntualidad:</span>
                    <span>{punctualityRate}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-lg border-gray-200 bg-white shadow-sm">
              <CardHeader className="px-4 pt-4 sm:px-6 sm:pt-6">
                <CardTitle className="text-base font-semibold">Recordatorios</CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <div className="space-y-2 text-sm">
                  <div className="rounded border border-yellow-200 bg-yellow-50 p-2">
                    Revisa las tardanzas del salon antes de cerrar asistencia.
                  </div>
                  <div className="rounded border border-blue-200 bg-blue-50 p-2">
                    Puedes filtrar por nombre para ubicar estudiantes rapido.
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

export default TeacherView;
