import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { BookOpen, Heart, Users, Target, Award, Globe, GraduationCap, Building2, Lightbulb, Handshake } from "lucide-react";

export function AboutUs() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-red-600 to-red-800 text-white py-20">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl mb-6">
              Nosotros
            </h1>
            <h2 className="text-3xl mb-4 text-red-100">
              Fe y Alegría Nº 39
            </h2>
            <p className="text-xl text-red-50 max-w-3xl mx-auto">
              Educación Popular Integral y Promoción Social desde El Agustino para el Perú
            </p>
          </div>
        </div>
      </section>

      {/* Historia y Contexto */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl mb-6 text-gray-900">Nuestra Historia</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Fe y Alegría Nº 39 es una institución educativa ubicada en el corazón 
                  de El Agustino, Lima, comprometida con la educación popular y de calidad desde su fundación. 
                  Formamos parte del Movimiento de Educación Popular Integral y Promoción Social Fe y Alegría.
                </p>
                <p>
                  Nuestra institución nace con la misión de brindar educación de calidad a los niños, niñas 
                  y adolescentes de sectores populares, promoviendo la transformación social a través de la 
                  formación integral de nuestros estudiantes.
                </p>
                <p>
                  Como parte de la red Fe y Alegría, compartimos el lema: <strong>"Fe y Alegría empieza donde termina 
                  el asfalto, donde no llega el agua, donde la ciudad pierde su nombre"</strong>. Este principio guía 
                  nuestro trabajo diario al servicio de las familias de El Agustino.
                </p>
                <p>
                  A lo largo de los años, hemos consolidado nuestra presencia en la comunidad, siendo reconocidos 
                  por nuestro compromiso con la educación de calidad, la formación en valores y el acompañamiento 
                  integral a nuestros estudiantes y sus familias.
                </p>
              </div>
            </div>
            <div className="flex justify-center">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1758611228434-7b5b697abd0a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzY2hvb2wlMjBidWlsZGluZyUyMGV4dGVyaW9yfGVufDF8fHx8MTc2MTIzODU2N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Instalaciones de Fe y Alegría 39"
                className="rounded-lg shadow-xl w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Misión, Visión y Valores */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl mb-4 text-gray-900">Nuestra Identidad Institucional</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Principios y valores que orientan nuestra labor educativa
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <Card className="border-t-4 border-red-600">
              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-red-100 rounded-full p-3">
                    <Target className="h-8 w-8 text-red-600" />
                  </div>
                  <CardTitle className="text-gray-900">Misión</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  Somos una institución educativa católica que brinda educación de calidad a niños, 
                  niñas y adolescentes de sectores populares, promoviendo su formación integral mediante 
                  la vivencia de valores cristianos, el desarrollo de competencias y el compromiso con 
                  la transformación social de su comunidad.
                </p>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-red-600">
              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-red-100 rounded-full p-3">
                    <Globe className="h-8 w-8 text-red-600" />
                  </div>
                  <CardTitle className="text-gray-900">Visión</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  Ser una institución educativa reconocida por su calidad académica y formación en valores, 
                  que contribuye significativamente al desarrollo integral de nuestros estudiantes, 
                  preparándolos como ciudadanos competentes, críticos y comprometidos con la construcción 
                  de una sociedad más justa y solidaria.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mb-8">
            <h3 className="text-3xl text-gray-900">Valores Institucionales</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center border-t-4 border-red-600 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto bg-red-100 rounded-full p-4 w-20 h-20 flex items-center justify-center mb-4">
                  <Heart className="h-10 w-10 text-red-600" />
                </div>
                <CardTitle className="text-gray-900">Fe y Espiritualidad</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Vivencia de la fe cristiana y valores evangélicos como fundamento de nuestra 
                  comunidad educativa, promoviendo el desarrollo espiritual de toda la comunidad.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-t-4 border-red-600 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto bg-red-100 rounded-full p-4 w-20 h-20 flex items-center justify-center mb-4">
                  <Handshake className="h-10 w-10 text-red-600" />
                </div>
                <CardTitle className="text-gray-900">Solidaridad</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Compromiso activo con los más necesitados y promoción de la justicia social, 
                  formando estudiantes sensibles a la realidad de su entorno.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-t-4 border-red-600 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto bg-red-100 rounded-full p-4 w-20 h-20 flex items-center justify-center mb-4">
                  <Award className="h-10 w-10 text-red-600" />
                </div>
                <CardTitle className="text-gray-900">Excelencia</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Búsqueda constante de la calidad educativa y mejora continua en todos nuestros 
                  servicios, procesos y prácticas pedagógicas.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-t-4 border-red-600 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto bg-red-100 rounded-full p-4 w-20 h-20 flex items-center justify-center mb-4">
                  <Users className="h-10 w-10 text-red-600" />
                </div>
                <CardTitle className="text-gray-900">Responsabilidad</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Compromiso serio con nuestras obligaciones educativas y el desarrollo integral 
                  de cada uno de nuestros estudiantes.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Propuesta Educativa */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl mb-4 text-gray-900">Propuesta Educativa</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Educación integral que transforma vidas y construye futuro
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <Card className="border-l-4 border-red-600">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="bg-red-100 rounded-lg p-3">
                    <Lightbulb className="h-8 w-8 text-red-600" />
                  </div>
                  <CardTitle className="text-gray-900">Pedagogía Ignaciana</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">
                  Nuestro modelo pedagógico se inspira en la espiritualidad ignaciana, 
                  promoviendo el desarrollo de personas conscientes, competentes, compasivas y comprometidas.
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li>• Contextualización de los aprendizajes</li>
                  <li>• Experiencia directa y reflexión</li>
                  <li>• Acción transformadora</li>
                  <li>• Evaluación continua del proceso</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-red-600">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="bg-red-100 rounded-lg p-3">
                    <Users className="h-8 w-8 text-red-600" />
                  </div>
                  <CardTitle className="text-gray-900">Educación Popular</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">
                  Comprometidos con la educación como medio de transformación social, 
                  promoviendo la participación activa y crítica de toda la comunidad educativa.
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li>• Participación de las familias</li>
                  <li>• Vinculación con la comunidad</li>
                  <li>• Promoción social</li>
                  <li>• Defensa de derechos</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Niveles Educativos */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl mb-4 text-gray-900">Niveles Educativos</h2>
            <p className="text-xl text-gray-600">
              Acompañamiento integral en cada etapa del desarrollo
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols- gap-8">
            

            <Card className="border-l-4 border-red-600">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="bg-red-100 rounded-lg p-3">
                    <BookOpen className="h-8 w-8 text-red-600" />
                  </div>
                  <CardTitle className="text-gray-900">Nivel Primaria</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">
                  Educación primaria completa de 1º a 6º grado. Fortalecemos las competencias 
                  comunicativas, matemáticas, científicas y ciudadanas.
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Áreas curriculares:</p>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>• Comunicación</li>
                    <li>• Matemática</li>
                    <li>• Ciencia y Tecnología</li>
                    <li>• Personal Social</li>
                    <li>• Educación Religiosa</li>
                    <li>• Arte y Cultura</li>
                    <li>• Educación Física</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-red-600">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="bg-red-100 rounded-lg p-3">
                    <Award className="h-8 w-8 text-red-600" />
                  </div>
                  <CardTitle className="text-gray-900">Nivel Secundaria</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">
                  Educación secundaria de 1º a 5º año. Preparamos adolescentes para la educación 
                  superior y la vida, con énfasis en pensamiento crítico y liderazgo.
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Énfasis formativos:</p>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>• Orientación vocacional</li>
                    <li>• Liderazgo juvenil</li>
                    <li>• Emprendimiento social</li>
                    <li>• Competencias digitales</li>
                    <li>• Proyecto de vida</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Infraestructura y Servicios */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl mb-4 text-gray-900">Infraestructura y Servicios</h2>
            <p className="text-xl text-gray-600">
              Espacios y recursos para un aprendizaje de calidad
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <div className="relative overflow-hidden rounded-lg shadow-lg group">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1655800466797-8ab2598b4274?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzY2hvb2wlMjBjbGFzc3Jvb20lMjBlZHVjYXRpb258ZW58MXx8fHwxNzYxMjIyNjU1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Aulas modernas"
                className="w-full h-64 object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                <div className="p-6 text-white">
                  <h3 className="text-2xl mb-2">Aulas Equipadas</h3>
                  <p className="text-gray-200">Espacios amplios con mobiliario ergonómico y recursos didácticos</p>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-lg shadow-lg group">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1542725752-e9f7259b3881?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsaWJyYXJ5JTIwYm9va3MlMjBsZWFybmluZ3xlbnwxfHx8fDE3NjExNDY1OTF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Biblioteca"
                className="w-full h-64 object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                <div className="p-6 text-white">
                  <h3 className="text-2xl mb-2">Biblioteca Escolar</h3>
                  <p className="text-gray-200">Centro de recursos bibliográficos y promoción de la lectura</p>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-lg shadow-lg group">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1522134939204-9b9957145632?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFjaGVyJTIwc3R1ZGVudCUyMGNsYXNzcm9vbXxlbnwxfHx8fDE3NjExNDY3NTJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Laboratorios"
                className="w-full h-64 object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                <div className="p-6 text-white">
                  <h3 className="text-2xl mb-2">Laboratorios</h3>
                  <p className="text-gray-200">Espacios para ciencias, tecnología y computación</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <Building2 className="h-12 w-12 text-red-600 mx-auto mb-3" />
              <p className="text-gray-700">Laboratorio de Cómputo</p>
              <p className="text-sm text-gray-500 mt-1">Tecnología educativa</p>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <Heart className="h-12 w-12 text-red-600 mx-auto mb-3" />
              <p className="text-gray-700">Servicio de Tópico</p>
              <p className="text-sm text-gray-500 mt-1">Atención de primeros auxilios</p>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <Users className="h-12 w-12 text-red-600 mx-auto mb-3" />
              <p className="text-gray-700">Áreas Deportivas</p>
              <p className="text-sm text-gray-500 mt-1">Educación física y recreación</p>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <BookOpen className="h-12 w-12 text-red-600 mx-auto mb-3" />
              <p className="text-gray-700">Sala de Profesores</p>
              <p className="text-sm text-gray-500 mt-1">Coordinación docente</p>
            </div>
          </div>
        </div>
      </section>

      {/* Compromiso con la Comunidad */}
      <section className="py-16 bg-red-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl mb-6">Compromiso con El Agustino</h2>
              <div className="space-y-4 text-red-50">
                <p>
                  Fe y Alegría Nº 39 está profundamente comprometido con la comunidad de El Agustino. 
                  Trabajamos día a día para ser agentes de cambio y transformación social, ofreciendo 
                  una educación de calidad que brinda oportunidades reales de desarrollo a nuestros 
                  estudiantes y sus familias.
                </p>
                <p>
                  Nuestra labor trasciende las aulas. Involucramos a las familias en el proceso educativo, 
                  promovemos la participación comunitaria y fomentamos el desarrollo integral de la persona 
                  en todas sus dimensiones: intelectual, espiritual, social y emocional.
                </p>
                <p>
                  Como parte de la red internacional Fe y Alegría, presente en más de 20 países, 
                  compartimos la visión de construir una sociedad más justa, fraterna y solidaria, 
                  donde todos tengan acceso a una educación de calidad que les permita desarrollar 
                  plenamente sus potencialidades.
                </p>
                <div className="bg-red-700 p-6 rounded-lg mt-6">
                  <p className="italic text-lg">
                    "Fe y Alegría empieza donde termina el asfalto, donde no llega el agua, 
                    donde la ciudad pierde su nombre"
                  </p>
                  <p className="text-sm mt-2 text-red-200">- Lema del Movimiento Fe y Alegría</p>
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1665664660924-255a6167f498?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJ1JTIwc2Nob29sJTIwc3R1ZGVudHN8ZW58MXx8fHwxNzYxMjM4NTY2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Comunidad educativa"
                className="rounded-lg shadow-2xl w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Información de Contacto */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl mb-4 text-red-400">Fe y Alegría Nº 39</h3>
              <p className="text-gray-300 mb-2">
                Educación Popular Integral
              </p>
              <p className="text-gray-400 text-sm">
                Movimiento de Promoción Social y Educación Popular
              </p>
            </div>
            <div>
              <h4 className="text-lg mb-4">Ubicación</h4>
              <div className="space-y-2 text-gray-300">
                <p>📍 El Agustino</p>
                <p>Lima, Perú</p>
              </div>
            </div>
            <div>
              <h4 className="text-lg mb-4">Contacto</h4>
              <div className="space-y-2 text-gray-300">
                <p>📧 info@feyalegria39.edu.pe</p>
                <p>🌐 feyalegria39.org.pe</p>
              </div>
            </div>
            <div>
              <h4 className="text-lg mb-4">Horario de Atención</h4>
              <div className="space-y-2 text-gray-300">
                <p>Lunes - Viernes</p>
                <p>7:30 AM - 3:00 PM</p>
                <p className="text-sm text-gray-400 mt-4">
                  Secretaría y Administración:<br/>8:00 AM - 4:00 PM
                </p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-400 mb-2">
              Parte de la Red Internacional Fe y Alegría
            </p>
            <p className="text-gray-500">
              &copy; 2024 Fe y Alegría Nº 39. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AboutUs;