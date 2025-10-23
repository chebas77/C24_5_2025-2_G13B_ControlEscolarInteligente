import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Slider } from "../ui/slider";
import { Switch } from "../ui/switch";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { 
  Settings, 
  AlertCircle, 
  Eye,
  Clock,
  Save,
  RotateCcw
} from "lucide-react";

export function PoliciesSettings() {
  const [threshold, setThreshold] = useState([75]);
  const [requireLiveness, setRequireLiveness] = useState(true);
  const [retentionDays, setRetentionDays] = useState([90]);

  const handleSave = () => {
    // Placeholder para guardar configuración
    alert('Configuración guardada exitosamente');
  };

  const handleReset = () => {
    setThreshold([75]);
    setRequireLiveness(true);
    setRetentionDays([90]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl text-gray-900">Políticas y Umbrales</h2>
        <p className="text-gray-600">
          Configuración del sistema de verificación facial
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Threshold Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Umbral de Confianza (τ)
            </CardTitle>
            <CardDescription>
              Nivel mínimo de coincidencia para aceptar una verificación
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Umbral actual</Label>
                <div className="flex items-center gap-2">
                  <span className="text-2xl text-red-600">{threshold[0]}%</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="text-gray-400 hover:text-gray-600">
                          <AlertCircle className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-sm">
                          Valores altos (≥80%) reducen falsos positivos pero pueden 
                          aumentar falsos rechazos. Valores bajos (≤70%) son más 
                          permisivos pero menos seguros.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              <Slider
                value={threshold}
                onValueChange={setThreshold}
                min={50}
                max={95}
                step={5}
                className="w-full"
              />

              <div className="flex justify-between text-xs text-gray-500">
                <span>50% (Permisivo)</span>
                <span>95% (Estricto)</span>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-blue-900 mb-2">Recomendaciones por nivel</h4>
              <div className="space-y-2 text-sm text-blue-700">
                <div className="flex justify-between">
                  <span>• 70-75%:</span>
                  <span>Uso general, balance</span>
                </div>
                <div className="flex justify-between">
                  <span>• 80-85%:</span>
                  <span>Alta seguridad</span>
                </div>
                <div className="flex justify-between">
                  <span>• 90%+:</span>
                  <span>Máxima seguridad</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Impacto estimado</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Falsos positivos</p>
                  <p className="text-green-600">
                    {threshold[0] >= 80 ? 'Muy Bajo' : threshold[0] >= 70 ? 'Bajo' : 'Medio'}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Falsos rechazos</p>
                  <p className={threshold[0] >= 85 ? 'text-yellow-600' : 'text-green-600'}>
                    {threshold[0] >= 85 ? 'Medio' : 'Bajo'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Liveness Detection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Detección de Vida (Liveness)
            </CardTitle>
            <CardDescription>
              Verificación de que el rostro es de una persona real
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="space-y-1">
                <Label htmlFor="liveness">Exigir Liveness Check</Label>
                <p className="text-sm text-gray-500">
                  Requiere confirmación de presencia física
                </p>
              </div>
              <Switch
                id="liveness"
                checked={requireLiveness}
                onCheckedChange={setRequireLiveness}
              />
            </div>

            {requireLiveness && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Eye className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="text-green-900 mb-2">Liveness Activado</h4>
                      <p className="text-sm text-green-700 mb-3">
                        Se solicitará al estudiante realizar acciones como:
                      </p>
                      <ul className="text-sm text-green-700 space-y-1">
                        <li>• Parpadear naturalmente</li>
                        <li>• Girar levemente la cabeza</li>
                        <li>• Sonreír brevemente</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="mb-3">Beneficios de Liveness</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      <span>Previene uso de fotos o videos</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      <span>Mayor seguridad del sistema</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      <span>Reduce intentos de suplantación</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!requireLiveness && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="text-yellow-900 mb-1">Advertencia</h4>
                    <p className="text-sm text-yellow-700">
                      Desactivar Liveness reduce la seguridad del sistema y permite
                      posibles intentos de suplantación con fotografías.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Data Retention */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Retención de Datos
            </CardTitle>
            <CardDescription>
              Tiempo de almacenamiento de registros de asistencia
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Período de retención</Label>
                <span className="text-2xl text-red-600">{retentionDays[0]} días</span>
              </div>

              <Slider
                value={retentionDays}
                onValueChange={setRetentionDays}
                min={30}
                max={365}
                step={30}
                className="w-full"
              />

              <div className="flex justify-between text-xs text-gray-500">
                <span>30 días</span>
                <span>1 año</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">Almacenamiento estimado</span>
                  <span>
                    {retentionDays[0] >= 180 ? '~500 MB' : retentionDays[0] >= 90 ? '~250 MB' : '~100 MB'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-600 h-2 rounded-full transition-all"
                    style={{ width: `${(retentionDays[0] / 365) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="text-xs text-gray-600 space-y-1">
                <p>• Los datos antiguos se eliminan automáticamente</p>
                <p>• Se mantiene backup de registros críticos</p>
                <p>• Cumple con políticas de privacidad institucional</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Notice */}
        <Card className="border-gray-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Privacidad y Normativa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-700 space-y-3">
              <p>
                El sistema de reconocimiento facial de Fe y Alegría Nº 39 cumple con:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-red-600 rounded-full mt-2"></div>
                  <span>Ley de Protección de Datos Personales (Ley N° 29733)</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-red-600 rounded-full mt-2"></div>
                  <span>Políticas internas de privacidad institucional</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-red-600 rounded-full mt-2"></div>
                  <span>Consentimiento informado de padres de familia</span>
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-700">
                Los datos biométricos se procesan de forma local y solo se almacenan
                vectores matemáticos (plantillas), no imágenes faciales completas.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-6 border-t">
        <Button variant="outline" onClick={handleReset}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Restablecer
        </Button>
        <Button className="bg-red-600 hover:bg-red-700" onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Guardar Cambios
        </Button>
      </div>
    </div>
  );
}
