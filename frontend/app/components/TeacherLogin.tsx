import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Lock, Mail, Eye, EyeOff } from "lucide-react";

interface TeacherLoginProps {
  onLogin: (email: string, password: string) => void;
  onBack: () => void;
}

export function TeacherLogin({ onLogin, onBack }: TeacherLoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      onLogin(email, password);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Image and Info */}
        <div className="hidden lg:block">
          <div className="text-center mb-8">
            <h1 className="text-4xl mb-2 text-red-600">Fe y Alegría</h1>
            <p className="text-gray-600">Sistema de Gestión Educativa</p>
          </div>
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1600792170156-7fdc12ed6733?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzY2hvb2wlMjBzdHVkZW50cyUyMHVuaWZvcm0lMjBlZHVjYXRpb258ZW58MXx8fHwxNzU4OTQ1NTQ2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Estudiantes"
            className="rounded-lg shadow-xl w-full max-w-md mx-auto"
          />
        </div>

        {/* Right Side - Login Form */}
        <div>
          <Card className="w-full max-w-md mx-auto shadow-2xl border-0">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto bg-red-100 rounded-full p-4 w-20 h-20 flex items-center justify-center">
                <Lock className="h-10 w-10 text-red-600" />
              </div>
              <CardTitle className="text-3xl text-gray-900">Acceso Docentes</CardTitle>
              <CardDescription className="text-gray-600">
                Ingrese sus credenciales institucionales para acceder al sistema
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700">
                    Correo Institucional
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="nombre@feyalegria.edu.pe"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-12 border-gray-300 focus:border-red-500 focus:ring-red-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700">
                    Contraseña
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 h-12 border-gray-300 focus:border-red-500 focus:ring-red-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-red-600 hover:bg-red-700 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={onBack}
                    className="text-red-600 hover:text-red-700 underline"
                  >
                    ← Volver al inicio
                  </button>
                </div>
              </form>

              <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
                <h4 className="text-sm text-red-800 mb-2">Demo - Credenciales de prueba:</h4>
                <p className="text-xs text-red-600">
                  Email: profesor@feyalegria.edu.pe<br />
                  Contraseña: demo123
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default TeacherLogin;