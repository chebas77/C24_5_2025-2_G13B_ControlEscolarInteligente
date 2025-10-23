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



## 📂 Estructura del repositorio