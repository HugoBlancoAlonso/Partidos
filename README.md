# Seguimiento de Partidos (Football Matches Tracker)

> [!WARNING]
> **Esta web se encuentra actualmente en desarrollo.**

Esta aplicación web te permite llevar un registro de todos los partidos de fútbol que has visto en diferentes competiciones. Está desarrollada utilizando React y Vite en el frontend, y utiliza Supabase como backend para la autenticación de usuarios y el almacenamiento de datos.

## 📋 Por hacer (TODO)
*(Nota: Las tareas pendientes se encuentran detalladas en el archivo [`TODO.txt`](./TODO.txt))*
- Anuncios.
- Crear dominio y enlazarlo a vercel.
- Posibilidad de seguir a otros usuarios.
- Añadir DNI y Dirección Fiscal en el Aviso Legal (cuando se monetice la app o se tenga SL).
- Desarrollar estadísticas del perfil (globales, equipo más visto, rango, medallas, etc.).

## ¿Cómo funciona la aplicación?

La aplicación se divide en las siguientes características principales:

1. **Autenticación (Login):**
   Al ingresar a la aplicación, se solicita iniciar sesión o crear una cuenta. Esto es gestionado de manera segura a través de **Supabase**. Una vez logueado, se asocia tu progreso a tu perfil de usuario.

2. **Menú de Competiciones:**
   En el menú principal, verás un listado de las diferentes competiciones de fútbol disponibles. Cada competición muestra de forma visual tu progreso actual (cuántos partidos has visto respecto al total de esa competición).

3. **Listado de Partidos:**
   Al seleccionar una competición, accederás al listado detallado de todos sus partidos (fases, jornadas, etc.). Aquí puedes marcar de forma individual cada partido como "Visto". Esta acción se guarda y sincroniza automáticamente en la base de datos, lo que significa que no perderás tu progreso si cierras el navegador o inicias sesión desde otro dispositivo.

4. **Modo Claro / Oscuro:**
   La aplicación incluye un botón (generalmente un icono de sol/luna) para alternar entre el tema claro (Light Mode) y el tema oscuro (Dark Mode). Tu preferencia de tema se almacena en el navegador para mantenerse en tus futuras visitas.

5. **Nuevas Competiciones y Script Local:**
   Se ha ampliado el catálogo de competiciones disponibles y se han añadido scripts para facilitar la inserción de nuevos torneos.

6. **Privilegios de Cuenta (Admin/Developer):**
   Sistema de roles que otorga permisos especiales (como administrador) para gestionar el contenido de la plataforma.

7. **Aviso Legal:**
   Páginas informativas y legales preparadas para la futura monetización y regulación del sitio web.

---

## 🛠️ Arquitectura Técnica

### Frontend (React + Vite)
El frontend está construido con **React** y empaquetado mediante **Vite**. Su estructura es modular y se centra en componentes funcionales (`src/components/`):
- **App.jsx:** Componente principal que gestiona el estado global (sesión de usuario, carga inicial de competiciones y partidos, tema claro/oscuro) y coordina la navegación de vistas.
- **Hooks personalizados (`src/hooks/`):** Como `useWatchedMatches`, encargado de leer y actualizar los partidos que ha visto el usuario implementando "optimistic updates" para una experiencia instantánea.
- **Componentes de interfaz:** Interfaces divididas en piezas reutilizables como `Login`, `Menu`, `MatchList`, `MatchCard` o `CircularProgress`, cada uno con su archivo de estilos (Vanilla CSS).

### Backend y Base de Datos (Supabase)
Toda la lógica de backend y base de datos se maneja a través de **Supabase** (PostgreSQL + Autenticación). La estructura de datos cuenta con las siguientes tablas principales:
- **`profiles`:** Guarda perfiles de usuarios (ej. nombre de usuario) vinculados a su ID de registro.
- **`competitions`:** Información general de cada torneo o liga (fecha de inicio, total de partidos, etc.).
- **`matches`:** El detalle individual de los encuentros, conectados a su torneo mediante `competition_id`.
- **`watched_matches`:** Tabla puente o relacional que vincula un `user_id` y un `match_id`. Se encarga de guardar el progreso personal de lo que cada usuario ha marcado como "visto".

---

## 🚀 Cómo lanzar la app en un ordenador nuevo (Local)

Si has descargado o clonado este repositorio de GitHub y quieres ejecutar la aplicación en tu propio ordenador, sigue estos pasos:

### 1. Requisitos previos
- Necesitas tener instalado **Node.js** en tu ordenador (preferiblemente la última versión LTS). Puedes descargarlo gratis desde [nodejs.org](https://nodejs.org/).

### 2. Instalar dependencias
Abre una terminal (o consola de comandos), navega hasta la carpeta raíz del proyecto (donde se encuentra el archivo `package.json`) y ejecuta el siguiente comando para descargar e instalar todas las librerías que utiliza el proyecto:

```bash
npm install
```

### 3. Configurar variables de entorno (Supabase)
Como la aplicación se comunica con Supabase, necesita unas credenciales específicas para saber a qué base de datos conectarse:
1. En la carpeta raíz del proyecto, crea un nuevo archivo llamado `.env`.
2. Dentro de ese archivo, debes pegar las credenciales del proyecto. El formato del archivo debe ser el siguiente:

```env
VITE_SUPABASE_URL=aqui_va_la_url_de_supabase
VITE_SUPABASE_ANON_KEY=aqui_va_la_clave_anonima
```
*(Nota: Crea una cuenta en supabase.com y genera tus propias credenciales, ya que sin ellas la aplicación no podrá acceder a los usuarios ni a los partidos guardados).*

### 4. Lanzar la aplicación
Con las dependencias instaladas y las variables listas, ya puedes iniciar el servidor de desarrollo local ejecutando:

```bash
npm run dev
```

En la terminal aparecerá un mensaje indicando que el servidor está corriendo, junto con una URL local (normalmente `http://localhost:5173/`). Solo tienes que abrir ese enlace en tu navegador web para empezar a usar la aplicación.
