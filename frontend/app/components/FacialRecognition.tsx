import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Camera, CameraOff, Users, CheckCircle, XCircle, Clock } from "lucide-react";

interface Student {
  id: string;
  name: string;
  grade: string;
  status: 'present' | 'absent' | 'late';
  time: string;
}

export function FacialRecognition() {
  const [isScanning, setIsScanning] = useState(false);
  const [students, setStudents] = useState<Student[]>([
    { id: "001", name: "Ana García Pérez", grade: "5to A", status: 'present', time: "07:45" },
    { id: "002", name: "Carlos Mendoza Silva", grade: "5to A", status: 'present', time: "07:50" },
    { id: "003", name: "María López Torres", grade: "5to B", status: 'late', time: "08:15" },
    { id: "004", name: "José Ramírez Cruz", grade: "4to A", status: 'present', time: "07:55" },
  ]);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const startScanning = async () => {
    setIsScanning(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      // Simulate facial recognition after 3 seconds
      setTimeout(() => {
        const mockStudent: Student = {
          id: "005",
          name: "Estudiante Reconocido",
          grade: "5to A",
          status: 'present',
          time: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
        };
        setCurrentStudent(mockStudent);
        setStudents(prev => [mockStudent, ...prev]);
      }, 3000);
    } catch (error) {
      console.error("Error accessing camera:", error);
      // Simulate without camera for demo
      setTimeout(() => {
        const mockStudent: Student = {
          id: "005",
          name: "Estudiante Simulado",
          grade: "5to A",
          status: 'present',
          time: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
        };
        setCurrentStudent(mockStudent);
        setStudents(prev => [mockStudent, ...prev]);
      }, 3000);
    }
  };

  const stopScanning = () => {
    setIsScanning(false);
    setCurrentStudent(null);
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
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

  const stats = {
    present: students.filter(s => s.status === 'present').length,
    late: students.filter(s => s.status === 'late').length,
    absent: students.filter(s => s.status === 'absent').length
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Presentes</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-green-600">{stats.present}</div>
            <p className="text-xs text-muted-foreground">estudiantes registrados</p>
          </CardContent>
        </Card>
        
        <Card className="border-yellow-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Tardanzas</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-yellow-600">{stats.late}</div>
            <p className="text-xs text-muted-foreground">estudiantes tardíos</p>
          </CardContent>
        </Card>
        
        <Card className="border-red-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Ausentes</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-red-600">{stats.absent}</div>
            <p className="text-xs text-muted-foreground">estudiantes ausentes</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Camera Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Reconocimiento Facial
            </CardTitle>
            <CardDescription>
              Sistema automatizado de registro de asistencia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                {isScanning ? (
                  <div className="relative w-full h-full">
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 border-2 border-red-500 border-dashed animate-pulse"></div>
                    <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm">
                      Escaneando...
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <div className="text-center">
                      <CameraOff className="h-16 w-16 mx-auto mb-4" />
                      <p>Cámara desactivada</p>
                    </div>
                  </div>
                )}
              </div>
              
              {currentStudent && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="text-lg text-green-800 mb-2">✓ Estudiante Reconocido</h4>
                  <p className="text-green-700"><strong>{currentStudent.name}</strong></p>
                  <p className="text-green-600">Grado: {currentStudent.grade}</p>
                  <p className="text-green-600">Hora: {currentStudent.time}</p>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button
                  onClick={isScanning ? stopScanning : startScanning}
                  className={`flex-1 ${isScanning ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                >
                  {isScanning ? (
                    <>
                      <CameraOff className="h-4 w-4 mr-2" />
                      Detener
                    </>
                  ) : (
                    <>
                      <Camera className="h-4 w-4 mr-2" />
                      Iniciar Escaneo
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Students List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Registro de Asistencia
            </CardTitle>
            <CardDescription>
              Últimos estudiantes registrados hoy
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {students.map((student) => (
                <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="text-sm">{student.name}</h4>
                    <p className="text-xs text-gray-500">{student.grade} • {student.time}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {getStatusBadge(student.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default FacialRecognition;