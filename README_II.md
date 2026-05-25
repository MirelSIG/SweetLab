README_II — SweetLab (versión para presentaciones y público no técnico)

Propósito y visión

- SweetLab es una aplicación de laboratorio de recetas: un espacio para explorar, crear, editar y organizar recetas culinarias con imágenes y metadatos (ingredientes, pasos, porciones, dificultad, etiquetas).
- Visión: facilitar la experimentación culinaria compartiendo recetas en un entorno simple, visual y controlado, pensado tanto para cocineros aficionados como para usuarios que desean documentar procesos y variantes.

Audiencia objetivo (para la presentación)

- Stakeholders no técnicos: gerentes de producto, patrocinadores, responsables de contenidos, equipo de marketing.
- Usuarios finales: cocineros aficionados, food bloggers, profesores de gastronomía que quieran un repositorio personal de recetas.
- Audiencia técnica ligera: integradores o proveedores que despliegan la app (ops/infra), pero explicado con lenguaje simple.

Propuesta de valor (qué comunica cada diapositiva)

1. Problema: recopilar y versionar recetas suele ser disperso — notas en papel, fotos en el móvil, enlaces en distintas redes.
2. Solución SweetLab: un sitio único para almacenar recetas con imágenes locales, búsqueda, edición controlada por roles y flujo de publicación simple.
3. Diferenciadores: edición con control de administrador, manejo local de imágenes (sin depender de servicios externos), interfaz clara y responsive.
4. Resultados esperados: más orden en las recetas, historial de cambios, capacidad de compartir y reutilizar procedimientos.

Resumen funcional (alto nivel)

- Navegación principal: listado de recetas, búsqueda por nombre/ingredientes/tags, panel de detalle con pasos e ingredientes.
- CRUD controlado: creación, edición y eliminación disponibles solo para administradores.
- Gestión de imágenes: la app puede usar imágenes locales aportadas por el usuario y gestiona rutas normalizadas para robustez.
- Autenticación simple: usuarios administradores inician sesión con nombre y contraseña; la sesión se mantiene con tokens seguros.

Arquitectura (explicación no técnica)

- Frontend: Interfaz de usuario que corre en el navegador (páginas que ves y usas). Implementado con una tecnología moderna para interfaces reactivas.
- Backend: Servicio que guarda recetas, usuarios y autentica (funciona "detrás" del sitio). Expone una API para que la interfaz hable con la base de datos.
- Base de datos: almacena recetas, usuarios y metadatos. Es un repositorio rápido y flexible preparado para datos tipo documento.
- Interacción típica: el navegador pide la lista de recetas al backend → el backend devuelve datos → el navegador los muestra; cuando se crea/edita una receta, el navegador envía los datos de vuelta al backend para guardar.

Tecnologías y versiones (estado del repositorio)

- Node.js: v22.21.1 (entorno de desarrollo local). Nota: los entornos de CI/hosting recientes usan Node.js 24.x en los logs de despliegue.
- Frontend:
  - Angular: ^18.2.0 (framework para aplicaciones web modernas)
  - TypeScript: ~5.5.4 (superconjunto de JS que añade tipos)
  - zone.js, rxjs: dependencias Angular estándar
- Backend:
  - Node.js + Express: Express ^4.19.2 (servidor web y rutas HTTP)
  - Mongoose: ^8.8.1 (conector para la base de datos tipo documento)
  - bcryptjs, jsonwebtoken: bibliotecas para seguridad y autenticación basada en tokens
- Base de datos:
  - MongoDB (compatible con Mongoose 8.x). Recomendación de despliegue: MongoDB 6.x o servicio gestionado compatible.
- Testing / utilidades:
  - Jest ^29.7.0 y Supertest ^6.3.4 usados para pruebas automáticas en backend.
- Notas de despliegue:
  - Las pruebas de despliegue anteriores se compilaron con Node 24.14.1 en la plataforma de hosting (ver logs).
  - El frontend se compila con `ng build` y el resultado (carpeta `dist/.../browser`) es servido por el backend en producción.

Seguridad y control de acceso (explicado sencillo)

- Acceso por roles: la app distingue entre usuarios normales y administradores; las acciones sensibles (editar, eliminar) son sólo para administradores.
- Autenticación: cuando un administrador inicia sesión, el sistema emite un token seguro (JWT) que el navegador guarda temporalmente; ese token acredita las operaciones posteriores.

Aspectos operativos y de mantenimiento (no técnicos pero prácticos)

- Cómo ver la app localmente (de forma resumida): instalar dependencias en `frontend` y `backend`, compilar frontend, y arrancar backend; el backend sirve la interfaz en `http://localhost:4000`.
- Logs y errores comunes observados: durante despliegues pueden aparecer restricciones de tamaño de CSS (budgets) o puerto ocupado localmente (puerto 4000). Estos son errores de operación, no de concepto.
- Copias de seguridad: la base de datos debe respaldarse periódicamente; las imágenes pueden guardarse en almacenamiento de objetos si se escala el proyecto.

Sugerencia de estructura para la presentación (diapositivas)

1. Portada: nombre del proyecto, tagline corto (ej.: "SweetLab — laboratorio de recetas").
2. Problema + oportunidad: demostrar con ejemplos reales de desorden de recetas.
3. Demo visual (capturas): home/listado, ficha de receta, edición.
4. Cómo funciona (simplificado): 3 cajas (navegador, servidor, base de datos) con flechas.
5. Beneficios para usuarios y para el negocio.
6. Roadmap / próximas funciones (colaboración, versionado de recetas, compartir enlaces públicos).
7. Requisitos técnicos resumidos y opciones de hosting.
8. Contacto y cómo probar (instrucciones rápidas para demo local o URL de staging).

Material para el mapa mental y conceptual (nodos principales)

- Nodo central: SweetLab
  - Subnodos:
    - Usuarios: Admin, Usuario lector
    - Funcionalidades: Buscar, Crear, Editar, Eliminar, Subir imágenes
    - Datos: Receta (título, ingredientes, pasos, tags, tiempo, dificultad, imagen)
    - Seguridad: Autenticación (JWT), Roles
    - Infraestructura: Frontend (Angular), Backend (Node/Express), DB (MongoDB)
    - Operaciones: Build, Deploy, Backups, Monitoreo
    - KPIs: número de recetas, tasa de edición, engagement de usuarios

Sugerencias de visuales y assets para la presentación

- Capturas de pantalla: home, panel de detalle, formulario de edición, badge de admin.
- Diagrama simple: caja frontal (navegador) → API → DB.
- Mapa mental: usar herramienta como MindMeister, XMind o draw.io con los nodos anteriores.
- Paleta de colores y tipografía: usar los colores cálidos del proyecto (naranjas) para acentos y tipografías legibles para títulos y cuerpo.

Checklist para preparar la presentación (acciónables)

- [ ] Recolectar 4–6 capturas de pantalla limpias.
- [ ] Crear diagrama de arquitectura (PNG/SVG).
- [ ] Preparar 8–10 diapositivas según estructura sugerida.
- [ ] Ensayar demo local (arrancar backend y abrir `http://localhost:4000`).

Próximos pasos recomendados (técnico y no técnico)

- Validar copy y mensaje con stakeholders: ¿"creación" o "experimentación"? (texto del hero es configurable).
- Preparar una demo en un entorno accesible (staging) para stakeholders.
- Documentar el proceso de despliegue (pasos para compilar frontend, variables de entorno y cómo restaurar DB).

Contacto y notas finales

- Este documento es la base para derivar un mapa mental, guion de presentación y diapositivas.
- Si quieres, genero automáticamente:
  - Un archivo SVG con el diagrama arquitectura simplificado.
  - Un guion de presentación con notas del orador por diapositiva.

---
Generado desde el repositorio SweetLab — README_II.md (material para presentaciones).


Despliegue y hosting: Docker, GitHub Pages y Render.com
---------------------------------------------------

Despliegue con Docker (recomendado para entornos de desarrollo reproducibles)

- Propósito: ejecutar la aplicación completa (frontend + backend + base de datos) en contenedores aislados para reproducir entornos locales o staging sin instalar dependencias manualmente.
- Qué hay en este repositorio: hay un `docker-compose.yml` en la raíz del repositorio que orquesta los servicios necesarios (backend, posible servicio de base de datos y/o proxy). Revisar el archivo para ver los nombres de servicios exactos y variables expuestas.
- Cómo usar (resumen):

  1. Crear/ajustar el fichero `.env` con las variables necesarias (p. ej. `MONGO_URI`, `JWT_SECRET`).
  2. Construir y levantar los contenedores:

```bash
docker compose build
docker compose up -d
```

  3. Verificar servicios:

```bash
docker compose ps
docker logs -f <service-name>
```

- Notas operativas:
  - En el `docker-compose.yml` se suele apuntar `MONGO_URI` a `mongodb://mongo:27017/sweetlab` si hay un servicio `mongo` definido en el compose.
  - Para persistencia de datos, definir un volumen para la base de datos en `docker-compose.yml`.
  - Para producción, crear imágenes y subirlas a un registro (Docker Hub, GitHub Container Registry) y desplegarlas en el entorno de destino.

Despliegue del frontend en GitHub Pages (solo frontend, estático)

- Propósito: publicar únicamente la interfaz (frontend) en un hosting estático gratuito. GitHub Pages sirve archivos estáticos (HTML/CSS/JS) pero no ejecuta código de servidor.
- Cuándo usarlo: si quieres mostrar una demo estática de la UI o servir la parte cliente separada. Si el backend se mantiene en un servicio distinto (Render, Heroku, VPS), el frontend debe configurarse para llamar al backend público con la URL correcta.
- Pasos rápidos:

  1. Generar build de producción del frontend:

```bash
cd frontend
npm ci
npm run build -- --configuration production
# Salida: dist/sweetlab-frontend/browser
```

  2. Publicar `dist/sweetlab-frontend/browser` en GitHub Pages:
     - Opción A: usar la rama `gh-pages` y herramientas como `angular-cli-ghpages` o `gh-pages` para empujar la carpeta.
     - Opción B: configurar una GitHub Action que haga el build y despliegue a Pages automáticamente.

- Consideraciones:
  - GitHub Pages no ejecuta el backend. Debes desplegar el backend en un servicio separado y configurar el `apiBaseUrl` del frontend para apuntar al backend público.
  - Debes gestionar CORS en el backend para permitir peticiones desde el dominio de Pages.

Despliegue full‑stack en Render.com (backend que sirve frontend)

- Propósito: alojar la aplicación completa (backend Node.js) en Render; el backend puede servir la build del frontend y exponer la API.
- Observaciones desde logs de despliegue previos:
  - El pipeline de build detectado en intentos previos fue: `cd frontend && npm ci && npm run build:prod && cd ../backend && npm ci`.
  - En el entorno de despliegue se usó Node.js 24.x (los logs muestran Node 24.14.1) aunque el desarrollo local se probó con Node 22.x.
  - Se observó un fallo en la build por exceder presupuestos CSS (`src/app/app.component.css exceeded maximum budget`) — en ese caso hay dos alternativas: reducir el tamaño de CSS o ajustar los budgets de Angular en `angular.json`.

- Pasos sugeridos para Render:

  1. En Render, crear un servicio web de tipo "Web Service" apuntando al repositorio.
  2. Establecer el comando de build (según logs probados):

```bash
cd frontend && npm ci && npm run build:prod && cd ../backend && npm ci
```

  3. Establecer las variables de entorno en el panel de Render: `MONGO_URI`, `JWT_SECRET`, y cualquier otra que la aplicación requiera.
  4. Establecer el comando de inicio a `npm start` en la carpeta `backend` (o `node src/server.js`). El backend debe servir la carpeta `dist/.../browser` tras la fase de build.

- Consideraciones y recomendaciones:
  - Ajustar budgets de Angular o reducir el CSS si el build falla por tamaño.
  - Verificar la versión de Node seleccionada en Render para coincidir con las dependencias (usa la documentación de Render para fijar la versión de Node en el despliegue).
  - Asegurar que los assets (imágenes) referenciados en el frontend estén incluidos en la salida `dist` o accesibles desde rutas públicas.

Ejemplo de problemas ya detectados y cómo mitigarlos:

- Error: `EADDRINUSE` al iniciar localmente — causa: puerto 4000 ocupado. Solución: detener el proceso que use el puerto o cambiar la variable `PORT`.
- Error en build Render: CSS excede budget. Solución: reducir reglas CSS o editar `angular.json` para ajustar budgets.

---
Actualizado: se incorporan estas notas al material de presentación para dejar claro el flujo de despliegue en diferentes entornos (local, Pages estático y Render gestionado).