import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

interface GoogleLoginProps {
  onLogin: (email: string, role: 'admin' | 'admin-mujeres' | 'teacher' | 'parent', dniHijo?: string, accessToken?: string) => void;
  onBack: () => void;
}

export function GoogleLogin({ onLogin, onBack }: GoogleLoginProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  // Estado para login de padre
  const [showParentForm, setShowParentForm] = useState(false);
  const [parentEmail, setParentEmail] = useState("");
  const [dniHijo, setDniHijo] = useState("");
  const [parentLoading, setParentLoading] = useState(false);
  const [parentError, setParentError] = useState("");

  // Usuarios de demostración - ahora acepta cualquier dominio
  const demoUsers = {
    'admin.varones@gmail.com': 'admin',
    'director.varones@gmail.com': 'admin',
    'admin.mujeres@gmail.com': 'admin-mujeres',
    'directora.mujeres@gmail.com': 'admin-mujeres',
    'profesor.silva@gmail.com': 'teacher',
    'profesor.martinez@gmail.com': 'teacher',
    'profesor.lopez@gmail.com': 'teacher',
    'padre.garcia@gmail.com': 'parent',
    'madre.rodriguez@gmail.com': 'parent',
    'tutor.mendoza@gmail.com': 'parent'
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

      const role = demoUsers[randomEmail as keyof typeof demoUsers] as 'admin' | 'admin-mujeres' | 'teacher' | 'parent';
      
      // Simular éxito de autenticación
      onLogin(randomEmail, role);
      
    } catch (err) {
      setError('Error al autenticar con Google. Por favor, intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para demostración - permite seleccionar manualmente un usuario
  const handleDemoLogin = (email: string) => {
    const role = demoUsers[email as keyof typeof demoUsers] as 'admin' | 'admin-mujeres' | 'teacher' | 'parent';
    onLogin(email, role);
  };

  // Nuevo: Login real para padres (llamando backend Django)
  const handleParentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setParentLoading(true);
    setParentError("");
    try {
      const res = await fetch("http://localhost:8000/api/reports/padres/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: parentEmail, dni_hijo: dniHijo })
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("accessToken", data.access);
        onLogin(parentEmail, "parent", dniHijo, data.access);
      } else {
        setParentError("Credenciales incorrectas.");
      }
    } catch {
      setParentError("Error al conectar al servidor.");
    } finally {
      setParentLoading(false);
    }
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
              Use su cuenta de correo electrónico para acceder al sistema
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
                      onClick={() => handleDemoLogin('admin.varones@gmail.com')}
                    >
                      👨‍💼 admin.varones@gmail.com
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full text-left justify-start text-xs"
                      onClick={() => handleDemoLogin('director.varones@gmail.com')}
                    >
                      🏢 director.varones@gmail.com
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
                      onClick={() => handleDemoLogin('admin.mujeres@gmail.com')}
                    >
                      👩‍💼 admin.mujeres@gmail.com
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full text-left justify-start text-xs"
                      onClick={() => handleDemoLogin('directora.mujeres@gmail.com')}
                    >
                      🏢 directora.mujeres@gmail.com
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
                      onClick={() => handleDemoLogin('profesor.silva@gmail.com')}
                    >
                      👨‍🏫 profesor.silva@gmail.com
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full text-left justify-start text-xs"
                      onClick={() => handleDemoLogin('profesor.martinez@gmail.com')}
                    >
                      👩‍🏫 profesor.martinez@gmail.com
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
                      onClick={() => handleDemoLogin('padre.garcia@gmail.com')}
                    >
                      👨‍👩‍👧 padre.garcia@gmail.com
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full text-left justify-start text-xs"
                      onClick={() => handleDemoLogin('madre.rodriguez@gmail.com')}
                    >
                      👩‍👧‍👦 madre.rodriguez@gmail.com
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full text-left justify-start text-xs"
                      onClick={() => setShowParentForm(true)}
                    >
                      👨‍👩‍👧 Acceder como padre/madre utilizando email y DNI de hijo
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Formulario real para padres */}
            {showParentForm && (
              <form onSubmit={handleParentLogin} className="mt-4 p-4 bg-gray-100 rounded">
                <h3 className="text-lg font-bold mb-2">Login para Padres</h3>
                <div className="mb-2">
                  <label className="block text-xs font-bold mb-1">Email del padre</label>
                  <input
                    value={parentEmail}
                    onChange={e => setParentEmail(e.target.value)}
                    type="email"
                    required
                    className="w-full border rounded p-2"
                  />
                </div>
                <div className="mb-2">
                  <label className="block text-xs font-bold mb-1">DNI del hijo</label>
                  <input
                    value={dniHijo}
                    onChange={e => setDniHijo(e.target.value)}
                    type="text"
                    required
                    className="w-full border rounded p-2"
                  />
                </div>
                {parentError && <div className="mb-2 text-red-600 text-xs">{parentError}</div>}
                <Button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                  size="lg"
                  disabled={parentLoading}
                >
                  {parentLoading ? 'Autenticando...' : 'Ingresar como padre/madre'}
                </Button>
                <Button
                  variant="outline"
                  className="w-full mt-2"
                  onClick={() => setShowParentForm(false)}
                  type="button"
                >
                  ← Volver
                </Button>
              </form>
            )}

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
            Sistema de Control Escolar Inteligente
          </p>
        </div>
      </div>
    </div>
  );
}

export default GoogleLogin;