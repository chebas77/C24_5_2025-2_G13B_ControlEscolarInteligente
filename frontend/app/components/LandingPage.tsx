import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { BookOpen, Users, Award, Heart, Shield, Clock, UserCheck } from "lucide-react";

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

export function LandingPage({ onNavigate }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-red-600 to-red-800 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl mb-6">
                Fe y Alegría Nº 39
              </h1>
              <p className="text-xl md:text-2xl mb-4 text-red-100">
                Sistema de Control de Asistencia
              </p>
              <p className="text-lg mb-8 text-red-50">
                Tecnología al servicio de la educación en El Agustino. Gestiona la asistencia 
                de manera eficiente con reconocimiento facial y accede a información en tiempo real.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button 
                  onClick={() => onNavigate('teachers')}
                  className="bg-white text-red-600 hover:bg-gray-100 px-8 py-6 text-lg"
                >
                  Acceder al Sistema
                </Button>
                <Button 
                  onClick={() => onNavigate('about')}
                  variant="outline"
                  className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-red-600 px-8 py-6 text-lg"
                >
                  Conoce más sobre nosotros
                </Button>
              </div>
            </div>
            <div className="flex justify-center">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1561346745-5db62ae43861?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMHN0dWRlbnRzJTIwZ3JvdXB8ZW58MXx8fHwxNzYxMjI0MjA0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Estudiantes de Fe y Alegría 39"
                className="rounded-lg shadow-2xl max-w-md w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Quiénes Somos - Breve */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl mb-4 text-gray-900">Educación con Propósito</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Somos parte del Movimiento de Educación Popular Integral Fe y Alegría, 
              comprometidos con brindar educación de calidad a los niños y jóvenes de El Agustino.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center border-t-4 border-red-600 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto bg-red-100 rounded-full p-3 w-16 h-16 flex items-center justify-center mb-4">
                  <Heart className="h-8 w-8 text-red-600" />
                </div>
                <CardTitle className="text-gray-900">Fe y Valores</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Formación integral basada en valores cristianos y principios de solidaridad
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-t-4 border-red-600 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto bg-red-100 rounded-full p-3 w-16 h-16 flex items-center justify-center mb-4">
                  <BookOpen className="h-8 w-8 text-red-600" />
                </div>
                <CardTitle className="text-gray-900">Calidad Educativa</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Inicial, Primaria y Secundaria con estándares de excelencia académica
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-t-4 border-red-600 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto bg-red-100 rounded-full p-3 w-16 h-16 flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-red-600" />
                </div>
                <CardTitle className="text-gray-900">Comunidad</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Compromiso con las familias y el desarrollo social de El Agustino
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-t-4 border-red-600 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto bg-red-100 rounded-full p-3 w-16 h-16 flex items-center justify-center mb-4">
                  <Award className="h-8 w-8 text-red-600" />
                </div>
                <CardTitle className="text-gray-900">Innovación</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Tecnología educativa y métodos pedagógicos actualizados
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Sistema de Asistencia - Enfoque Principal */}
      <section className="py-20 bg-gradient-to-br from-gray-100 to-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl mb-4 text-gray-900">Sistema de Asistencia Inteligente</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Plataforma moderna y segura para el control de asistencia con tecnología de reconocimiento facial
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-red-600 rounded-lg p-3 flex-shrink-0">
                    <UserCheck className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl mb-2 text-gray-900">Reconocimiento Facial</h3>
                    <p className="text-gray-600">
                      Registro automático de asistencia mediante tecnología de reconocimiento facial 
                      rápida y precisa
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-red-600 rounded-lg p-3 flex-shrink-0">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl mb-2 text-gray-900">Tiempo Real</h3>
                    <p className="text-gray-600">
                      Información actualizada al instante para docentes, administradores y padres de familia
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-red-600 rounded-lg p-3 flex-shrink-0">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl mb-2 text-gray-900">Seguro y Privado</h3>
                    <p className="text-gray-600">
                      Acceso restringido mediante autenticación de Google con dominio institucional
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1569653402334-2e98fbaa80ee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21wdXRlciUyMGxhYiUyMHN0dWRlbnRzfGVufDF8fHx8MTc2MTIyNzQzMnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Sistema de asistencia"
                className="rounded-lg shadow-xl w-full"
              />
              <div className="absolute -bottom-6 -right-6 bg-red-600 text-white p-6 rounded-lg shadow-lg max-w-xs">
                <p className="text-sm">
                  Acceso restringido a usuarios del dominio @feyalegria39.edu.pe
                </p>
              </div>
            </div>
          </div>

          {/* Funcionalidades por Rol */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <Card className="border-l-4 border-red-600">
              <CardHeader>
                <CardTitle className="text-gray-900">Para Administradores</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600">
                  <li>• Control total de asistencia</li>
                  <li>• Reconocimiento facial automático</li>
                  <li>• Reportes y estadísticas</li>
                  <li>• Gestión de estudiantes</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-red-600">
              <CardHeader>
                <CardTitle className="text-gray-900">Para Docentes</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600">
                  <li>• Lista de estudiantes por clase</li>
                  <li>• Confirmación manual de asistencia</li>
                  <li>• Visualización de registros</li>
                  <li>• Reportes por sección</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-red-600">
              <CardHeader>
                <CardTitle className="text-gray-900">Para Padres</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600">
                  <li>• Consulta de asistencia</li>
                  <li>• Historial detallado</li>
                  <li>• Información académica</li>
                  <li>• Comunicados del colegio</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-red-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl mb-6">¿Listo para Acceder?</h2>
          <p className="text-xl mb-8 text-red-50">
            Ingresa al sistema con tu cuenta institucional @feyalegria39.edu.pe
          </p>
          <Button 
            onClick={() => onNavigate('teachers')}
            className="bg-white text-red-600 hover:bg-gray-100 px-10 py-6 text-lg"
          >
            Ingresar al Sistema
          </Button>
        </div>
      </section>

      {/* Galería Rápida */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl mb-4 text-gray-900">Nuestra Institución</h2>
            <p className="text-xl text-gray-600">
              Espacios y actividades que enriquecen la experiencia educativa
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative overflow-hidden rounded-lg shadow-lg group h-64">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1758685733907-42e9651721f5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFjaGVyJTIwaGVscGluZyUyMHN0dWRlbnR8ZW58MXx8fHwxNzYxMTM5MTQwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Acompañamiento personalizado"
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                <div className="p-6 text-white">
                  <h3 className="text-xl">Acompañamiento Personalizado</h3>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-lg shadow-lg group h-64">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1706645740995-d3ab4b91f4fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJ1JTIwc3R1ZGVudHMlMjBjbGFzc3Jvb218ZW58MXx8fHwxNzYxMjM4ODY5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Aprendizaje colaborativo"
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                <div className="p-6 text-white">
                  <h3 className="text-xl">Aprendizaje Colaborativo</h3>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-lg shadow-lg group h-64">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1607586501844-9a7f11af251c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzY2hvb2wlMjBhY3Rpdml0aWVzJTIwY2hpbGRyZW58ZW58MXx8fHwxNzYxMTc2Nzc4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Actividades extracurriculares"
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                <div className="p-6 text-white">
                  <h3 className="text-xl">Actividades Complementarias</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-2xl mb-4 text-red-400">Fe y Alegría Nº 39</h3>
              <p className="text-gray-300">
                Educación Popular Integral y Promoción Social
              </p>
              <p className="text-gray-400 text-sm mt-2 italic">
                "Donde termina el asfalto, comienza Fe y Alegría"
              </p>
            </div>
            <div>
              <h4 className="text-lg mb-4">Contacto</h4>
              <div className="space-y-2 text-gray-300">
                <p>📧 info@feyalegria39.edu.pe</p>
                <p>🌐 feyalegria39.org.pe</p>
                <p>📍 El Agustino, Lima, Perú</p>
              </div>
            </div>
            <div>
              <h4 className="text-lg mb-4">Horario de Atención</h4>
              <div className="space-y-2 text-gray-300">
                <p>Lunes - Viernes: 7:30 AM - 3:00 PM</p>
                <p>Administración: 8:00 AM - 4:00 PM</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Fe y Alegría Nº 39. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}


export default LandingPage;