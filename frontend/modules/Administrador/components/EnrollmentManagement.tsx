"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import {
  UserCheck,
  Upload,
  AlertCircle,
  CheckCircle2,
  Search,
  Filter,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";

type TemplateStatus = "complete" | "incomplete" | "pending";

interface Student {
  id: string;
  name: string;
  code: string;
  dni: string;
  grade: string;
  section: string;
  status: string;
  templateStatus: TemplateStatus;
  lastUpdate: string;
  enrolledBy: string;
  hasTemplate: boolean;
}

interface EnrollmentStudentsResponse {
  students?: Student[];
}

interface DuplicateEnrollment {
  name: string;
  code: string;
  dni: string;
  score: number;
  lastUpdate: string;
  enrolledBy: string;
}

interface ImageUploadError {
  index?: number;
  message: string;
}

interface EnrollmentManagementProps {
  userEmail: string;
}

const API_BASE_URL = "http://localhost:8000/api/reports";

export function EnrollmentManagement({ userEmail }: EnrollmentManagementProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<Array<File | null>>([null, null, null, null, null]);
  const [previewUrls, setPreviewUrls] = useState<Array<string | null>>([null, null, null, null, null]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<number, string>>({});
  const [duplicateEnrollment, setDuplicateEnrollment] = useState<DuplicateEnrollment | null>(null);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingStudentId, setDeletingStudentId] = useState<string | null>(null);

  const loadStudents = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/admin/enrollment/students/`);
      const data: EnrollmentStudentsResponse & { error?: string } = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "No se pudo cargar la lista de alumnos.");
      }

      setStudents(data.students || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado al cargar alumnos.");
      setStudents([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const handleUpdateTemplate = (student: Student) => {
    setSelectedStudent(student);
    resetUploadState();
    setIsDialogOpen(true);
  };

  const resetUploadState = () => {
    previewUrls.forEach((url) => {
      if (url) {
        URL.revokeObjectURL(url);
      }
    });
    setSelectedFiles([null, null, null, null, null]);
    setPreviewUrls([null, null, null, null, null]);
    setUploadError(null);
    setImageErrors({});
    setDuplicateEnrollment(null);
    setUploadMessage(null);
    setIsUploading(false);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      resetUploadState();
    }
  };

  const handleFileChange = (index: number, file?: File) => {
    setUploadError(null);
    setImageErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };
      delete nextErrors[index + 1];
      return nextErrors;
    });
    setDuplicateEnrollment(null);
    setUploadMessage(null);

    if (!file) {
      return;
    }

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setUploadError("Solo se permiten imagenes JPG o PNG.");
      setImageErrors((currentErrors) => ({
        ...currentErrors,
        [index + 1]: "Formato no permitido.",
      }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Cada imagen debe pesar como maximo 5 MB.");
      setImageErrors((currentErrors) => ({
        ...currentErrors,
        [index + 1]: "Maximo 5 MB.",
      }));
      return;
    }

    setSelectedFiles((currentFiles) => {
      const nextFiles = [...currentFiles];
      nextFiles[index] = file;
      return nextFiles;
    });

    setPreviewUrls((currentUrls) => {
      const nextUrls = [...currentUrls];
      if (nextUrls[index]) {
        URL.revokeObjectURL(nextUrls[index] as string);
      }
      nextUrls[index] = URL.createObjectURL(file);
      return nextUrls;
    });
  };

  const removeFile = (index: number) => {
    setSelectedFiles((currentFiles) => {
      const nextFiles = [...currentFiles];
      nextFiles[index] = null;
      return nextFiles;
    });
    setImageErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };
      delete nextErrors[index + 1];
      return nextErrors;
    });

    setPreviewUrls((currentUrls) => {
      const nextUrls = [...currentUrls];
      if (nextUrls[index]) {
        URL.revokeObjectURL(nextUrls[index] as string);
      }
      nextUrls[index] = null;
      return nextUrls;
    });
  };

  const handleSubmitEnrollment = async () => {
    if (!selectedStudent) {
      return;
    }

    const filesToUpload = selectedFiles.filter((file): file is File => Boolean(file));
    if (filesToUpload.length < 3) {
      setUploadError("Selecciona al menos 3 imagenes para generar la plantilla.");
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);
      setImageErrors({});
      setDuplicateEnrollment(null);
      setUploadMessage(null);

      const formData = new FormData();
      filesToUpload.forEach((file) => {
        formData.append("images", file);
      });
      formData.append("enrolledBy", userEmail);

      const response = await fetch(`${API_BASE_URL}/admin/enrollment/students/${selectedStudent.id}/template/`, {
        method: "POST",
        body: formData,
      });
      const data: {
        message?: string;
        error?: string;
        details?: Array<string | ImageUploadError>;
        duplicate?: DuplicateEnrollment;
      } = await response.json();

      if (!response.ok) {
        if (data.duplicate) {
          setDuplicateEnrollment(data.duplicate);
        }
        const indexedErrors: Record<number, string> = {};
        const detailMessages = (data.details || []).map((detail) => {
          if (typeof detail === "string") {
            return detail;
          }

          if (typeof detail.index === "number") {
            indexedErrors[detail.index] = detail.message;
            return `Imagen ${detail.index}: ${detail.message}`;
          }

          return detail.message;
        });
        setImageErrors(indexedErrors);

        const details = detailMessages.length ? ` ${detailMessages.join(" ")}` : "";
        throw new Error(`${data.error || "No se pudo guardar el enrolamiento."}${details}`);
      }

      const message = data.message || "Plantilla facial guardada correctamente.";
      setUploadMessage(message);
      setSuccessMessage(`${message} Alumno: ${selectedStudent.name}. Enrolado por: ${userEmail}.`);
      await loadStudents();
      setTimeout(() => {
        setIsDialogOpen(false);
        resetUploadState();
      }, 1200);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Error inesperado al guardar el enrolamiento.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveEnrollment = async (student: Student) => {
    if (!student.hasTemplate) {
      return;
    }

    const confirmed = window.confirm(
      `¿Quitar el enrolamiento facial de ${student.name}? Esta accion eliminara su plantilla guardada.`,
    );
    if (!confirmed) {
      return;
    }

    try {
      setDeletingStudentId(student.id);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/admin/enrollment/students/${student.id}/template/`, {
        method: "DELETE",
      });
      const data: { message?: string; error?: string } = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "No se pudo quitar el enrolamiento.");
      }

      setSuccessMessage(`${data.message || "Enrolamiento facial quitado correctamente."} Alumno: ${student.name}.`);
      await loadStudents();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado al quitar el enrolamiento.");
    } finally {
      setDeletingStudentId(null);
    }
  };

  const filteredStudents = useMemo(() => {
    const normalizedTerm = searchTerm.trim().toLowerCase();

    if (!normalizedTerm) {
      return students;
    }

    return students.filter((student) =>
      student.name.toLowerCase().includes(normalizedTerm) ||
      student.code.toLowerCase().includes(normalizedTerm) ||
      student.dni.toLowerCase().includes(normalizedTerm)
    );
  }, [searchTerm, students]);

  const stats = useMemo(() => {
    const total = students.length;
    const complete = students.filter((student) => student.templateStatus === "complete").length;
    const incomplete = students.filter((student) => student.templateStatus === "incomplete").length;
    const pending = students.filter((student) => student.templateStatus === "pending").length;

    return {
      total,
      complete,
      incomplete,
      pending,
      completePercentage: total > 0 ? Math.round((complete / total) * 100) : 0,
    };
  }, [students]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl text-gray-900">Enrolamiento de Estudiantes</h2>
          <p className="text-gray-600">
            Lista de alumnos cargada desde la base de datos para gestionar plantillas faciales.
          </p>
        </div>
        <Button variant="outline" onClick={loadStudents} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Actualizar
        </Button>
      </div>

      {successMessage && (
        <div className="flex items-start justify-between gap-3 rounded-md border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-600" />
            <div>
              <p className="font-medium">Enrolamiento satisfactorio</p>
              <p>{successMessage}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setSuccessMessage(null)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Estudiantes</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.total}</div>
            <p className="text-xs text-muted-foreground">registrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Plantillas Completas</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-green-600">{stats.complete}</div>
            <p className="text-xs text-muted-foreground">{stats.completePercentage}% del total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Incompletas</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-yellow-600">{stats.incomplete}</div>
            <p className="text-xs text-muted-foreground">requieren revision</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Pendientes</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-red-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">sin plantilla</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Alumnos para Enrolamiento</CardTitle>
          <CardDescription>
            Selecciona un alumno para preparar la captura o actualizacion de su rostro.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre, codigo o DNI..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" disabled>
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>

          {error && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Estudiante</TableHead>
                <TableHead>Codigo</TableHead>
                <TableHead>DNI</TableHead>
                <TableHead>Grado</TableHead>
                <TableHead>Seccion</TableHead>
                <TableHead>Estado Plantilla</TableHead>
                <TableHead>Ultima Actualizacion</TableHead>
                <TableHead>Enrolado por</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={9} className="py-8 text-center text-gray-500">
                    Cargando alumnos desde la base de datos...
                  </TableCell>
                </TableRow>
              )}

              {!isLoading && filteredStudents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="py-8 text-center text-gray-500">
                    No se encontraron alumnos.
                  </TableCell>
                </TableRow>
              )}

              {!isLoading && filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <UserCheck className="h-4 w-4 text-gray-600" />
                      </div>
                      <span>{student.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600">{student.code}</TableCell>
                  <TableCell className="text-gray-600">{student.dni}</TableCell>
                  <TableCell>{student.grade}</TableCell>
                  <TableCell>{student.section}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        student.templateStatus === "complete" ? "default" :
                        student.templateStatus === "incomplete" ? "secondary" :
                        "outline"
                      }
                      className={
                        student.templateStatus === "complete" ? "bg-green-600" :
                        student.templateStatus === "incomplete" ? "bg-yellow-600" :
                        "bg-red-600 text-white"
                      }
                    >
                      {student.templateStatus === "complete" ? "Completo" :
                       student.templateStatus === "incomplete" ? "Incompleto" :
                       "Pendiente"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-600">{student.lastUpdate}</TableCell>
                  <TableCell className="text-gray-600">{student.enrolledBy}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateTemplate(student)}
                      >
                        <Upload className="h-3 w-3 mr-1" />
                        Enrolar
                      </Button>
                      {student.hasTemplate && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                          disabled={deletingStudentId === student.id}
                          onClick={() => handleRemoveEnrollment(student)}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          {deletingStudentId === student.id ? "Quitando..." : "Quitar"}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Preparar Enrolamiento Facial</DialogTitle>
            <DialogDescription>
              {selectedStudent?.name} - {selectedStudent?.code}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="text-blue-900 mb-1">Siguiente paso</h4>
                  <p className="text-sm text-blue-700">
                    Sube entre 3 y 5 fotos JPG o PNG. El backend validara que exista un solo
                    rostro frontal por imagen y guardara la plantilla facial del alumno.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Imagenes de referencia</Label>
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5].map((index) => (
                  <label
                    key={index}
                    className={`relative aspect-square border-2 border-dashed rounded-lg flex items-center justify-center overflow-hidden cursor-pointer transition-colors ${
                      imageErrors[index]
                        ? "border-red-500 bg-red-50 shadow-[0_0_0_2px_rgba(239,68,68,0.18)] hover:border-red-600"
                        : "border-gray-300 hover:border-red-400"
                    }`}
                  >
                    {previewUrls[index - 1] ? (
                      <>
                        <img
                          src={previewUrls[index - 1] as string}
                          alt={`Referencia ${index}`}
                          className="h-full w-full object-cover"
                        />
                        <button
                          type="button"
                          aria-label={`Quitar imagen ${index}`}
                          className="absolute right-2 top-2 rounded-full bg-white/90 p-1 shadow"
                          onClick={(event) => {
                            event.preventDefault();
                            removeFile(index - 1);
                          }}
                        >
                          <X className="h-4 w-4 text-gray-700" />
                        </button>
                      </>
                    ) : (
                      <div className="text-center">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-xs text-gray-500">
                          Imagen {index}
                          {index <= 3 && <span className="text-red-600">*</span>}
                        </p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/jpeg,image/png"
                      className="sr-only"
                      onChange={(event) => handleFileChange(index - 1, event.target.files?.[0])}
                    />
                    {imageErrors[index] && (
                      <div className="absolute inset-x-0 bottom-0 bg-red-600/95 px-2 py-1 text-center text-[11px] text-white">
                        {imageErrors[index]}
                      </div>
                    )}
                  </label>
                ))}
              </div>
              <p className="text-xs text-gray-500">
                Minimo 3 imagenes requeridas. Maximo 5 imagenes. Peso maximo: 5 MB por imagen.
              </p>
            </div>

            {uploadError && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {uploadError}
              </div>
            )}

            {duplicateEnrollment && (
              <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                <p className="font-medium">Rostro ya enrolado</p>
                <p>
                  Coincide con {duplicateEnrollment.name} ({duplicateEnrollment.code}) con
                  {` ${duplicateEnrollment.score.toFixed(1)}%`} de similitud.
                </p>
                <p>DNI: {duplicateEnrollment.dni}</p>
                <p>Ultima actualizacion: {duplicateEnrollment.lastUpdate}</p>
                <p>Enrolado por: {duplicateEnrollment.enrolledBy}</p>
              </div>
            )}

            {uploadMessage && (
              <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                {uploadMessage}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              disabled={isUploading || selectedFiles.filter(Boolean).length < 3}
              onClick={handleSubmitEnrollment}
            >
              {isUploading ? "Procesando..." : "Generar Plantilla"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
