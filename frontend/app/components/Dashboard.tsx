"use client";

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
  LayoutDashboard,
} from "lucide-react";

interface DashboardProps {
  userEmail: string;
  onLogout: () => void;
}

type View =
  | "dashboard"
  | "devices"
  | "capture"
  | "enrollment"
  | "policies"
  | "reports";

export function Dashboard({ userEmail, onLogout }: DashboardProps) {
  const [activeView, setActiveView] = useState<View>("dashboard");
  const [selectedDevice, setSelectedDevice] = useState<string>("");

  // --- Abrir vista de captura ---
  const handleOpenCapture = (deviceId: string) => {
    setSelectedDevice(deviceId);
    setActiveView("capture");
  };

  // --- Volver a lista de dispositivos ---
  const handleBackToDevices = () => {
    setActiveView("devices");
    setSelectedDevice("");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ========================= HEADER ========================= */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* --- Título del sistema --- */}
            <div className="flex items-center">
              <h1 className="text-2xl font-semibold text-red-600">
                Fe y Alegría Nº 39
              </h1>
              <span className="ml-4 text-gray-500">|</span>
              <span className="ml-4 text-gray-700">
                Panel de Administración
              </span>
              <Badge variant="outline" className="ml-4">
                Varones
              </Badge>
            </div>

            {/* --- Usuario y notificaciones --- */}
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

      {/* ========================= MAIN CONTENT ========================= */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs
          value={activeView}
          onValueChange={(value) => setActiveView(value as View)}
          className="space-y-6"
        >
          {/* --- Barra de navegación superior --- */}
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

            {/* Solo mostrar la pestaña de captura cuando esté activa */}
            {activeView === "capture" && (
              <TabsTrigger value="capture" className="flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Captura
              </TabsTrigger>
            )}
          </TabsList>

          {/* ========================= CONTENIDOS ========================= */}

          {/* --- Vista Dashboard de Asistencia --- */}
          <TabsContent value="dashboard">
            <AttendanceDashboard />
          </TabsContent>

          {/* --- Vista Puestos de Captura --- */}
          <TabsContent value="devices">
            <DevicesList onOpenCapture={handleOpenCapture} />
          </TabsContent>

          {/* --- Vista Captura Facial en Vivo --- */}
          <TabsContent value="capture">
            <CaptureStation
              deviceId={selectedDevice}
              onBack={handleBackToDevices}
            />
          </TabsContent>

          {/* --- Vista Enrolamiento --- */}
          <TabsContent value="enrollment">
            <EnrollmentManagement />
          </TabsContent>

          {/* --- Vista Políticas de Seguridad --- */}
          <TabsContent value="policies">
            <PoliciesSettings />
          </TabsContent>

          {/* --- Vista Reportes --- */}
          <TabsContent value="reports">
            <ReportsModule />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default Dashboard;
