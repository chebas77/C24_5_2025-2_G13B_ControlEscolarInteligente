import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { 
  UserCheck, 
  Upload, 
  AlertCircle,
  CheckCircle2,
  Search,
  Filter
} from "lucide-react";

interface Student {
  id: string;
  name: string;
  code: string;
  grade: string;
  section: string;
  templateStatus: 'complete' | 'incomplete' | 'pending';
  lastUpdate: string;
}

export function EnrollmentManagement() {
  const [students] = useState<Student[]>([
    {
      id: '1',
      name: 'García Pérez, Juan Carlos',
      code: 'EST-2024-001',
      grade: '5to',
      section: 'A',
      templateStatus: 'complete',
      lastUpdate: '15/01/2024'
    },
    {
      id: '2',
      name: 'Rodríguez Silva, Miguel Ángel',
      code: 'EST-2024-002',
      grade: '5to',
      section: 'A',
      templateStatus: 'complete',
      lastUpdate: '15/01/2024'
    },
    {
      id: '3',
      name: 'López Martínez, Carlos Eduardo',
      code: 'EST-2024-003',
      grade: '4to',
      section: 'B',
      templateStatus: 'incomplete',
      lastUpdate: '10/01/2024'
    },
    {
      id: '4',
      name: 'Fernández Vega, José Luis',
      code: 'EST-2024-004',
      grade: '3ro',
      section: 'A',
      templateStatus: 'pending',
      lastUpdate: '--'
    },
    {
      id: '5',
      name: 'Sánchez Torres, Roberto Carlos',
      code: 'EST-2024-005',
      grade: '5to',
      section: 'B',
      templateStatus: 'complete',
      lastUpdate: '18/01/2024'
    }
  ]);

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleUpdateTemplate = (student: Student) => {
    setSelectedStudent(student);
    setIsDialogOpen(true);
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: students.length,
    complete: students.filter(s => s.templateStatus === 'complete').length,
    incomplete: students.filter(s => s.templateStatus === 'incomplete').length,
    pending: students.filter(s => s.templateStatus === 'pending').length
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl text-gray-900">Enrolamiento de Estudiantes</h2>
        <p className="text-gray-600">
          Gestión de plantillas faciales • Género: Varones
        </p>
      </div>

      {/* Stats Cards */}
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
            <p className="text-xs text-muted-foreground">
              {((stats.complete / stats.total) * 100).toFixed(0)}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Incompletas</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-yellow-600">{stats.incomplete}</div>
            <p className="text-xs text-muted-foreground">requieren actualización</p>
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

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Estudiantes Enrolados</CardTitle>
          <CardDescription>
            Gestione las plantillas faciales de reconocimiento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre o código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Estudiante</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Grado</TableHead>
                <TableHead>Sección</TableHead>
                <TableHead>Estado Plantilla</TableHead>
                <TableHead>Última Actualización</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
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
                  <TableCell>{student.grade}</TableCell>
                  <TableCell>{student.section}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        student.templateStatus === 'complete' ? 'default' :
                        student.templateStatus === 'incomplete' ? 'secondary' :
                        'outline'
                      }
                      className={
                        student.templateStatus === 'complete' ? 'bg-green-600' :
                        student.templateStatus === 'incomplete' ? 'bg-yellow-600' :
                        'bg-red-600 text-white'
                      }
                    >
                      {student.templateStatus === 'complete' ? 'Completo' :
                       student.templateStatus === 'incomplete' ? 'Incompleto' :
                       'Pendiente'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-600">{student.lastUpdate}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateTemplate(student)}
                    >
                      <Upload className="h-3 w-3 mr-1" />
                      Actualizar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Update Template Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Actualizar Plantilla Facial</DialogTitle>
            <DialogDescription>
              {selectedStudent?.name} • {selectedStudent?.code}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="text-blue-900 mb-1">Requisitos de las imágenes</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Subir 3-5 imágenes de referencia del rostro</li>
                    <li>• Fondo neutro y buena iluminación</li>
                    <li>• Rostro completamente visible y centrado</li>
                    <li>• Sin accesorios que cubran el rostro</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Imágenes de Referencia</Label>
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-red-400 cursor-pointer transition-colors"
                  >
                    <div className="text-center">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-xs text-gray-500">
                        Imagen {i}
                        {i <= 3 && <span className="text-red-600">*</span>}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500">
                * Mínimo 3 imágenes requeridas. Máximo 5 imágenes.
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="text-yellow-900 mb-1">Validación Automática</h4>
                  <p className="text-sm text-yellow-700">
                    Las imágenes serán validadas automáticamente para detectar:
                    iluminación inadecuada, encuadre incorrecto o duplicados.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button className="bg-red-600 hover:bg-red-700">
              Generar Plantilla
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
