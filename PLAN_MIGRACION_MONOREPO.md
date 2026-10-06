# Plan de Migración a Monorepo (React Web + React Native)

Este documento detalla los pasos seguros y profesionales para convertir tu proyecto actual en un monorepo, manteniendo la versión web intacta y añadiendo soporte para aplicación móvil, todo trabajando desde una rama de Git segura.

---

## FASE 0: Protección del Código (Gestión de Ramas)

Antes de mover un solo archivo, vamos a proteger tu código actual. La regla de oro es no hacer grandes refactorizaciones directamente en `main`.

### Pasos desde Antigravity:
1. Puedes pedirme directamente a mí (tu asistente) que cree la rama, o puedes hacerlo tú abriendo la terminal en el IDE.
2. Ejecuta el comando para crear y cambiar a la nueva rama:
   ```bash
   git checkout -b feature/migracion-monorepo
   ```
3. A partir de este momento, estás en un "universo paralelo". Cualquier cambio que hagamos se quedará aquí. Si rompemos el proyecto y no sabemos cómo arreglarlo, basta con ejecutar `git checkout main` y todo volverá a la normalidad al instante.

---

## FASE 1: Reestructuración de Carpetas (Workspaces)

Vamos a configurar npm/yarn para que entienda que ahora este repositorio contiene múltiples "proyectos" que pueden hablar entre sí.

### Pasos:
1. **Crear carpetas raíz:**
   En la raíz de `/Partidos`, crea dos carpetas nuevas:
   * `apps/` (Alojará la interfaz de la web y la de móvil).
   * `packages/` (Alojará la lógica y utilidades que compartirán ambas).

2. **Mover tu web actual:**
   * Selecciona todo el contenido actual de tu proyecto (`src`, `public`, `package.json`, `vite.config.js`, `.eslintrc.cjs`, etc.), **excepto** la carpeta `.git` y el archivo `.gitignore`.
   * Muévelo todo dentro de la nueva carpeta `apps/web/`.

3. **Configurar el cerebro del Monorepo:**
   * En la raíz absoluta del proyecto (`/Partidos/`), crea un nuevo archivo `package.json` muy sencillo con este contenido:
     ```json
     {
       "name": "partidos-workspace",
       "private": true,
       "workspaces": [
         "apps/*",
         "packages/*"
       ]
     }
     ```
   * Ejecuta `npm install` (o `yarn`) en la raíz para que registre la nueva estructura.

---

## FASE 2: Extraer el "Cerebro" (Lógica Compartida)

El secreto de que esto funcione sin duplicar código es sacar de la web todo lo que no sea "pantalla".

### Pasos:
1. **Crear el paquete central:**
   * Crea una carpeta `packages/core/`.
   * Dentro, crea su propio `package.json` para definirlo como un paquete independiente:
     ```json
     {
       "name": "@partidos/core",
       "version": "1.0.0",
       "main": "index.js"
     }
     ```

2. **Mover utilidades y datos:**
   * Localiza tus archivos de lógica en `apps/web`. Por ejemplo: `src/data/countryFlags.js` y `scripts/fetchPartidos.js`.
   * Muévelos a `packages/core/`.
   * Crea un archivo `packages/core/index.js` que exporte estas funciones. Por ejemplo:
     ```javascript
     export * from './countryFlags';
     export * from './fetchPartidos';
     ```

---

## FASE 3: Conectar y Reparar la Web

Al sacar la lógica, la web actual tendrá errores de importación. Vamos a conectarla con el nuevo paquete `core`.

### Pasos:
1. **Declarar dependencia:**
   * Abre `apps/web/package.json` y añade tu nuevo paquete en las dependencias:
     ```json
     "dependencies": {
       "@partidos/core": "*",
       ... otras dependencias
     }
     ```
2. **Actualizar importaciones en React:**
   * Ve a los componentes que usaban esos archivos (ej. `MatchList.jsx`, `AdminCompetitions.jsx`).
   * Cambia las rutas relativas por el nombre del paquete:
     ```javascript
     // ANTES:
     // import { countryFlags } from '../data/countryFlags';
     
     // AHORA:
     // import { countryFlags } from '@partidos/core';
     ```
3. **Prueba de fuego:**
   * Abre la terminal, entra en `apps/web/` y ejecuta `npm run dev`.
   * La web debe funcionar **exactamente igual que antes de empezar**. Si es así, hemos triunfado en la primera etapa.

---

## FASE 4: Nace la App Móvil

Con la base lista y sólida, incorporar la aplicación móvil es muy sencillo.

### Pasos:
1. **Inicializar Expo:**
   * En la terminal, sitúate en la carpeta `apps/`.
   * Ejecuta: `npx create-expo-app mobile`
   * Esto creará un proyecto React Native totalmente configurado dentro de `apps/mobile/`.

2. **Conectar al Core:**
   * Al igual que hicimos con la web, ve a `apps/mobile/package.json` y añade la dependencia:
     ```json
     "dependencies": {
       "@partidos/core": "*"
     }
     ```
   * Ejecuta `npm install` desde la raíz del proyecto para que los enlaces se regeneren.

3. **Construir usando el Core:**
   * Ahora puedes ir a `apps/mobile/App.js`.
   * Usarás los componentes visuales del móvil (`<View>`, `<Text>`), pero importarás los datos igual que en la web:
     ```javascript
     import { Text, View } from 'react-native';
     import { countryFlags } from '@partidos/core'; // La misma lógica!
     ```

---

## FASE 5: Guardar y Unir en GitHub

Cuando estemos satisfechos con la estructura (o si queremos guardar progreso):

1. **Guardar el trabajo en la rama segura:**
   ```bash
   git add .
   git commit -m "Arquitectura monorepo inicializada y lógica extraída al core"
   git push origin feature/migracion-monorepo
   ```

2. **Revisión en GitHub (Pull Request):**
   * Ve a la página de tu repositorio en GitHub.es.
   * Verás un aviso verde sugiriendo hacer un "Compare & Pull Request".
   * Esto te permite ver todos los archivos que se han movido y comprobar que la rama `main` sigue a salvo.
   * Si todo está correcto, puedes hacer click en "Merge pull request" para incorporar definitivamente esta nueva y potente estructura a tu código principal.
