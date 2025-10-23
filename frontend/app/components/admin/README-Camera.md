# Módulo de Cámara - Sistema de Captura de Asistencia

## 📍 Ubicación en el Sistema

El módulo de cámara se encuentra en:
```
Panel Administrador → Puestos de Captura → [Botón "Abrir Puesto"] → Vista de Captura con Cámara
```

## 🎯 Componentes Creados

### 1. `CameraCapture.tsx`
Componente principal que maneja la cámara web del navegador.

**Características:**
- ✅ Acceso a cámara usando `getUserMedia` API
- ✅ Preview en vivo del video
- ✅ Marco de detección facial con esquinas visuales
- ✅ Estados visuales claros (esperando, analizando, verificado, rechazado)
- ✅ Captura de frames para análisis
- ✅ Badges en tiempo real con Score y Liveness
- ✅ Control de inicio/detención de cámara

**Estados del Sistema:**
1. **Idle** (Inactivo): Cámara apagada, muestra placeholder
2. **Waiting** (Esperando): Cámara activa, marco azul, esperando captura
3. **Analyzing** (Analizando): Marco amarillo pulsante, procesando
4. **Verified** (Verificado): Marco verde, asistencia registrada ✓
5. **Rejected** (Rechazado): Marco rojo, verificación fallida ✕

### 2. `CaptureStation.tsx` (Actualizado)
Vista completa del puesto de captura que integra `CameraCapture`.

**Incluye:**
- ✅ Componente de cámara integrado
- ✅ Panel de información del dispositivo
- ✅ Estadísticas de sesión en tiempo real
- ✅ Historial de últimos 5 registros
- ✅ Tabla con detalles completos (hora, estudiante, código, score, liveness, resultado)
- ✅ Instrucciones para el usuario
- ✅ Opción de marcado manual
- ✅ Avisos legales de privacidad

## 🎨 Diseño y Estilos

### Colores Institucionales Mantenidos
- **Rojo** (#DC2626): Botones principales, encabezados
- **Negro/Gris**: Textos, bordes
- **Blanco**: Fondos, contraste
- **Azul** (Estados): Esperando rostro
- **Amarillo** (Estados): Procesando
- **Verde** (Estados): Verificado exitosamente
- **Rojo** (Estados): Verificación fallida

### Marco de Detección Facial
```
┌────────┐
│        │  ← Esquinas blancas (8x8px)
│   👤   │  ← Marco principal (264x320px)
│        │  ← Borde 4px con color según estado
└────────┘
```

### Overlay de Video
- Gradiente inferior: Muestra texto de estado
- Badges superiores: Score y Liveness (cuando hay resultado)
- Indicador central: Ícono según estado actual

## 🔧 Flujo Técnico

### 1. Inicio de Cámara
```javascript
startCamera()
  ↓
getUserMedia({ video: true })
  ↓
stream → videoRef.current.srcObject
  ↓
Estado: 'waiting'
```

### 2. Captura de Asistencia
```javascript
captureFrame()
  ↓
Canvas.drawImage(video)
  ↓
Canvas.toDataURL('image/jpeg')
  ↓
Estado: 'analyzing' (simulado 2s)
  ↓
Verificación (simulada con scores aleatorios)
  ↓
Estado: 'verified' o 'rejected' (3s)
  ↓
Registro agregado al historial
  ↓
Estado: 'waiting' (listo para siguiente captura)
```

### 3. Detener Cámara
```javascript
stopCamera()
  ↓
stream.getTracks().forEach(track => track.stop())
  ↓
Estado: 'idle'
```

## 📊 Datos Mostrados

### En Tiempo Real (durante captura)
- Estado de la cámara (activa/inactiva)
- Dispositivo/puesto actual
- Hora actual
- Instrucciones contextuales

### Después de Captura
- **Score de confianza**: 0-100% (verde ≥85%, amarillo ≥75%, rojo <75%)
- **Liveness check**: OK/Fail (detecta persona real vs foto)
- **Resultado**: Verificado ✓ / Rechazado ✕

### Historial (Últimos 5 registros)
| Hora | Estudiante | Código | Score | Liveness | Resultado |
|------|-----------|--------|-------|----------|-----------|
| 08:15:32 | García Pérez, Juan | EST-001 | 94.5% | OK | ✓ Verificado |
| 08:16:05 | Rodríguez Silva, Miguel | EST-002 | 89.2% | OK | ✓ Verificado |
| 08:16:40 | López Martínez, Carlos | EST-003 | 68.1% | Fail | ✕ Rechazado |

## 🎯 Integración con Backend Django

### Flujo Propuesto (Frontend → Backend)

1. **Captura de Frame**
```javascript
const imageData = canvas.toDataURL('image/jpeg');
// Enviar a Django
fetch('/api/verify-attendance/', {
  method: 'POST',
  body: JSON.stringify({
    device_id: deviceId,
    image: imageData, // Base64
    timestamp: new Date().toISOString()
  })
});
```

2. **Respuesta del Backend**
```json
{
  "verified": true,
  "student": {
    "name": "García Pérez, Juan Carlos",
    "code": "EST-2024-001",
    "grade": "5to",
    "section": "A"
  },
  "score": 94.5,
  "liveness": true,
  "attendance_id": "ATT-20240120-001"
}
```

3. **WebSocket (Opcional para tiempo real)**
```javascript
// Conectar WebSocket
const ws = new WebSocket('ws://backend/capture/stream/');

// Enviar frames periódicamente
ws.send(JSON.stringify({
  type: 'frame',
  data: frameData
}));

// Recibir resultados
ws.onmessage = (event) => {
  const result = JSON.parse(event.data);
  updateUIWithResult(result);
};
```

## 🔐 Privacidad y Seguridad

### Implementado
- ✅ Solicitud de permisos de cámara del navegador
- ✅ Procesamiento local en el cliente (simulado)
- ✅ Avisos legales visibles
- ✅ No se almacenan imágenes completas (solo vectores/resultados)
- ✅ Limpieza de stream al desmontar componente

### Mensajes Legales
```
"Procesamiento local de captura. Solo se registran 
resultados aprobados."

"Los datos se procesan conforme a las políticas 
internas de privacidad institucional."
```

## 💡 Microcopy (Textos del Sistema)

### Estados de Captura
| Estado | Texto Mostrado |
|--------|----------------|
| Idle | "Cámara inactiva" |
| Waiting | "Ajuste su posición dentro del marco." |
| Analyzing | "Procesando rostro, por favor manténgase quieto." |
| Verified | "Asistencia registrada correctamente." |
| Rejected | "No se detectó coincidencia. Intente nuevamente." |

### Instrucciones
- "Mire al frente y parpadee"
- "Ajuste su posición dentro del marco"
- "Mantenga una expresión neutral"
- "Espere la confirmación del sistema"

### Errores
- "No se pudo acceder a la cámara. Verifique los permisos."
- "Error de conexión con el servidor."
- "Tiempo de espera agotado. Intente nuevamente."

## 🧪 Testing y Demostración

### Modo Simulado Actual
El sistema actualmente simula:
- Scores aleatorios (70-100%)
- Liveness aleatorio (80% de éxito)
- Delay de 2s para análisis
- Autoretorno a estado 'waiting' después de 3s

### Para Producción
Reemplazar la simulación con llamadas reales al backend Django:
```javascript
// Reemplazar esto:
setTimeout(() => {
  const randomScore = Math.random() * 100;
  // ...simulación
}, 2000);

// Con esto:
const response = await fetch('/api/verify', {
  method: 'POST',
  body: JSON.stringify({ image: imageData })
});
const result = await response.json();
setCaptureState(result.verified ? 'verified' : 'rejected');
```

## 📱 Navegadores Compatibles

### Requerimientos
- ✅ Chrome 53+
- ✅ Firefox 36+
- ✅ Safari 11+
- ✅ Edge 79+

### API Utilizada
- `navigator.mediaDevices.getUserMedia()`
- Canvas API para captura de frames
- HTML5 Video element

## 🎬 Acceso al Módulo

### Desde el Dashboard
1. Login como administrador (admin.varones@feyalegria39.edu.pe)
2. Ir a pestaña "Puestos"
3. Seleccionar dispositivo (ej: KSK-001)
4. Click en "Abrir Puesto de Captura"
5. Click en "Iniciar Cámara"
6. Permitir acceso a cámara en el navegador
7. Posicionarse dentro del marco
8. Click en "Capturar Asistencia"

---

## 🔄 Próximos Pasos para Integración Real

1. **Backend Django**: Endpoint `/api/verify-attendance/`
2. **Procesamiento Facial**: Integrar librería de reconocimiento (ej: face-api.js, DeepFace)
3. **WebSocket**: Para streaming en tiempo real
4. **Base de datos**: Almacenar plantillas faciales y registros
5. **Notificaciones**: Sistema de alertas para eventos
6. **Reportes**: Exportar datos de capturas
