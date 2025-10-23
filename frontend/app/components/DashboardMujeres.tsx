import { useState } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { AttendanceDashboard } from "./admin/AttendanceDashboard";
import { DevicesList } from "./admin/DevicesList";
import { CaptureStation } from "./admin/CaptureStation";
import { EnrollmentManagement } from "./admin/EnrollmentManagement";
import { PoliciesSettings } from "./admin/PoliciesSettings";
import { ReportsModule } from "./admin/ReportsModule";
import { 
  LogOut, 
  Camera, 
  BarChart3, 
  Monitor,
  UserCheck,
  Settings,
  Bell,
  LayoutDashboard
} from "lucide-react";

interface DashboardMujeresProps {
  userEmail: string;
  onLogout: () => void;
}

type View = 'dashboard' | 'devices' | 'capture' | 'enrollment' | 'policies' | 'reports';

export function DashboardMujeres({ userEmail, onLogout }: DashboardMujeresProps) {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [selectedDevice, setSelectedDevice] = useState<string>('');

  const handleOpenCapture = (deviceId: string) => {
    setSelectedDevice(deviceId);
    setActiveView('capture');
  };

  const handleBackToDevices = () => {
    setActiveView('devices');
    setSelectedDevice('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl text-red-600">Fe y Alegría Nº 39</h1>
              <span className="ml-4 text-gray-500">|</span>
              <span className="ml-4 text-gray-700">Panel de Administración</span>
              <Badge variant="outline" className="ml-4">
                Mujeres
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm text-gray-700">Administrador</p>
                  <p className="text-xs text-gray-500">{userEmail}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onLogout}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <Tabs value={activeView} onValueChange={(value) => setActiveView(value as View)} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="devices" className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              Puestos
            </TabsTrigger>
            <TabsTrigger value="enrollment" className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              Enrolamiento
            </TabsTrigger>
            <TabsTrigger value="policies" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Políticas
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Reportes
            </TabsTrigger>
            {activeView === 'capture' && (
              <TabsTrigger value="capture" className="flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Captura
              </TabsTrigger>
            )}
          </TabsList>

          {/* Dashboard de Asistencia */}
          <TabsContent value="dashboard">
            <AttendanceDashboard />
          </TabsContent>

          {/* Puestos de Captura */}
          <TabsContent value="devices">
            <DevicesList onOpenCapture={handleOpenCapture} />
          </TabsContent>

          {/* Vista de Captura */}
          <TabsContent value="capture">
            <CaptureStation 
              deviceId={selectedDevice} 
              onBack={handleBackToDevices}
            />
          </TabsContent>

          {/* Enrolamiento */}
          <TabsContent value="enrollment">
            <EnrollmentManagement />
          </TabsContent>

          {/* Políticas y Umbrales */}
          <TabsContent value="policies">
            <PoliciesSettings />
          </TabsContent>

          {/* Reportes */}
          <TabsContent value="reports">
            <ReportsModule />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default DashboardMujeres;