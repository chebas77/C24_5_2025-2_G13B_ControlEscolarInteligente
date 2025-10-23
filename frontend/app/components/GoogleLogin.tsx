import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

interface GoogleLoginProps {
  onLogin: (email: string, role: 'admin' | 'admin-mujeres' | 'teacher' | 'parent') => void;
  onBack: () => void;
}

export function GoogleLogin({ onLogin, onBack }: GoogleLoginProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Usuarios de demostración para el dominio @feyalegria39.edu.pe
  const demoUsers = {
    'admin.varones@feyalegria39.edu.pe': 'admin',
    'director.varones@feyalegria39.edu.pe': 'admin',
    'admin.mujeres@feyalegria39.edu.pe': 'admin-mujeres',
    'directora.mujeres@feyalegria39.edu.pe': 'admin-mujeres',
    'profesor.silva@feyalegria39.edu.pe': 'teacher',
    'profesor.martinez@feyalegria39.edu.pe': 'teacher',
    'profesor.lopez@feyalegria39.edu.pe': 'teacher',
    'padre.garcia@feyalegria39.edu.pe': 'parent',
    'madre.rodriguez@feyalegria39.edu.pe': 'parent',
    'tutor.mendoza@feyalegria39.edu.pe': 'parent'
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError("");

    try {
      // Simulación de autenticación con Google
      // En una implementación real, aquí usarías Google OAuth API
      
      // Simular una demora de red
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simular selección de cuenta (en una implementación real, Google mostraría el selector)
      const emails = Object.keys(demoUsers);
      const randomEmail = emails[Math.floor(Math.random() * emails.length)];
      
      // Verificar que el email pertenece al dominio autorizado
      if (!randomEmail.endsWith('@feyalegria39.edu.pe')) {
        throw new Error('Solo se permiten cuentas del dominio @feyalegria39.edu.pe');
      }

      const role = demoUsers[randomEmail as keyof typeof demoUsers] as 'admin' | 'admin-mujeres' | 'teacher' | 'parent';
      
      // Simular éxito de autenticación
      onLogin(randomEmail, role);
      
    } catch (err) {
      setError('Error al autenticar con Google. Verifique que su cuenta pertenezca al dominio @feyalegria39.edu.pe');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para demostración - permite seleccionar manualmente un usuario
  const handleDemoLogin = (email: string) => {
    const role = demoUsers[email as keyof typeof demoUsers] as 'admin' | 'admin-mujeres' | 'teacher' | 'parent';
    onLogin(email, role);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl text-gray-900 mb-2">Iniciar Sesión</h2>
          <p className="text-gray-600">Acceda con su cuenta institucional de Fe y Alegría</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Autenticación Institucional</CardTitle>
            <CardDescription>
              Use su cuenta @feyalegria39.edu.pe para acceder al sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              size="lg"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Autenticando...
                </div>
              ) : (
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continuar con Google
                </div>
              )}
            </Button>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="border-t pt-4">
              <p className="text-sm text-gray-600 mb-3">Para demostración, seleccione un usuario:</p>
              
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Administradores - Varones:</p>
                  <div className="space-y-1">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full text-left justify-start text-xs"
                      onClick={() => handleDemoLogin('admin.varones@feyalegria39.edu.pe')}
                    >
                      👨‍💼 admin.varones@feyalegria39.edu.pe
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full text-left justify-start text-xs"
                      onClick={() => handleDemoLogin('director.varones@feyalegria39.edu.pe')}
                    >
                      🏢 director.varones@feyalegria39.edu.pe
                    </Button>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">Administradoras - Mujeres:</p>
                  <div className="space-y-1">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full text-left justify-start text-xs"
                      onClick={() => handleDemoLogin('admin.mujeres@feyalegria39.edu.pe')}
                    >
                      👩‍💼 admin.mujeres@feyalegria39.edu.pe
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full text-left justify-start text-xs"
                      onClick={() => handleDemoLogin('directora.mujeres@feyalegria39.edu.pe')}
                    >
                      🏢 directora.mujeres@feyalegria39.edu.pe
                    </Button>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">Profesores:</p>
                  <div className="space-y-1">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full text-left justify-start text-xs"
                      onClick={() => handleDemoLogin('profesor.silva@feyalegria39.edu.pe')}
                    >
                      👨‍🏫 profesor.silva@feyalegria39.edu.pe
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full text-left justify-start text-xs"
                      onClick={() => handleDemoLogin('profesor.martinez@feyalegria39.edu.pe')}
                    >
                      👩‍🏫 profesor.martinez@feyalegria39.edu.pe
                    </Button>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">Padres de Familia:</p>
                  <div className="space-y-1">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full text-left justify-start text-xs"
                      onClick={() => handleDemoLogin('padre.garcia@feyalegria39.edu.pe')}
                    >
                      👨‍👩‍👧 padre.garcia@feyalegria39.edu.pe
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full text-left justify-start text-xs"
                      onClick={() => handleDemoLogin('madre.rodriguez@feyalegria39.edu.pe')}
                    >
                      👩‍👧‍👦 madre.rodriguez@feyalegria39.edu.pe
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={onBack}
              className="w-full mt-4"
            >
              ← Volver al inicio
            </Button>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Solo cuentas del dominio @feyalegria39.edu.pe pueden acceder al sistema
          </p>
        </div>
      </div>
    </div>
  );
}

export default GoogleLogin;