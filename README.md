# 🏫 Sistema de Control Escolar Inteligente (SCEI)

### Basado en reconocimiento facial para la gestión de asistencia y control parental

---

## 📘 Descripción general

El **Sistema de Control Escolar Inteligente (SCEI)** es una aplicación desarrollada con el propósito de **automatizar el control de asistencia** en instituciones educativas mediante reconocimiento facial.  
Busca **optimizar los procesos administrativos**, **reducir errores humanos** y **fortalecer la comunicación entre el colegio y los padres de familia**, ofreciendo una herramienta moderna y accesible para la gestión escolar.

---

## 🎯 Objetivo del proyecto

Diseñar e implementar una plataforma web que permita:
- Registrar la asistencia de los estudiantes mediante un sistema de reconocimiento facial.  
- Generar reportes automáticos diarios, semanales y mensuales.  
- Facilitar el acceso de los padres a la información de asistencia de sus hijos.  
- Centralizar los registros académicos en una base de datos unificada.

---

## ⚙️ Arquitectura tecnológica

| Componente | Tecnología |
|-------------|-------------|
| **Backend** | Django (Python) |
| **Frontend** | HTML5, CSS3, JavaScript |
| **Base de datos** | SQLite |
| **Framework CSS (opcional)** | Bootstrap / TailwindCSS |
| **Entorno de desarrollo** | Visual Studio Code, GitHub |

---

## 📂 Estructura del repositorio

```bash
backend/
├── venv/
├── src/
│   ├── config/         # Configuración global de Django
│   ├── attendance/     # App principal de asistencia
│   ├── users/          # App de usuarios y roles
│   ├── devices/        # App de kioscos / cámaras
│   ├── reports/        # App de reportes
│   ├── config_app/     # Políticas y configuración
│   └── manage.py
└── requirements.txt
```

---

## ⚙️ Instrucciones para ejecutar el Backend (Django)

### 🧩 1. Clonar el repositorio

```bash
git clone https://github.com/usuario/C24_5_2025-2_G13B_ControlEscolarInteligente.git
cd C24_5_2025-2_G13B_ControlEscolarInteligente/backend
```

### 🐍 2. Crear y activar el entorno virtual

Recomendado: usar Python `3.13` o `3.12`.

**En Windows (PowerShell o Git Bash):**
```bash
python -m venv venv
source venv/Scripts/activate
```

**En Linux / macOS:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### 📦 3. Instalar dependencias

Desde la carpeta `backend/src` (donde se encuentra `manage.py`):

```bash
cd src
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

### 🛠️ 4. Aplicar migraciones de base de datos

Esto creará las tablas necesarias para usuarios, sesiones y el panel administrativo:

```bash
python manage.py migrate
```

### 👥 4.1 Cargar usuarios demo para pruebas

Para simular datos de administradores, profesores, padres y alumnos:

```bash
python manage.py seed_demo_users --count 20 --reset
```

Este comando crea como minimo:

- 20 administradores
- 20 profesores
- 20 padres de familia
- 20 alumnos
- familias, preferencias, asistencias y metricas faciales demo en `alumno_metrics`

Datos utiles para pruebas:

- Password demo de usuarios `auth.User`: `DemoSCEI2026!`
- Padres: `padre001@demo.scei.pe` hasta `padre020@demo.scei.pe`
- DNI del hijo para login del padre: `50000001` hasta `50000020`

### 👤 5. Crear superusuario (opcional)

Si deseas acceder al panel de administración:

```bash
python manage.py createsuperuser
```

Luego completa los datos:

- Username: admin
- Email address: admin@tecsup.edu.pe
- Password: ********

### 🚀 6. Ejecutar el servidor de desarrollo

```bash
python manage.py runserver
```

El servidor se iniciará en:

🌐 http://127.0.0.1:8000/

### 🧭 7. Endpoints de prueba

**🖥️ Panel de administración:**

👉 http://127.0.0.1:8000/admin/

(usar el superusuario creado)

**🧩 API de prueba:**

👉 http://127.0.0.1:8000/api/attendance/test/

Si devuelve:

```json
{ "message": "Backend Django funcionando correctamente ✅" }
```

todo está correcto.

---

## 📁 Estructura básica del backend

```bash
backend/
├── venv/
├── src/
│   ├── config/              # Configuración global de Django
│   ├── attendance/          # App principal de asistencia
│   ├── users/               # App de usuarios y roles
│   ├── devices/             # App de kioscos / cámaras
│   ├── reports/             # App de reportes
│   ├── config_app/          # Políticas y configuración
│   └── manage.py
└── requirements.txt
```
