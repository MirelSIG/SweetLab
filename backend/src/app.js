const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const recipeRoutes = require('./routes/recipeRoutes');

const app = express();

const frontendBuildCandidates = [
	// From backend root (when started via `cd backend && node src/server.js`)
	path.resolve(process.cwd(), '../frontend/dist/sweetlab-frontend/browser'),
	path.resolve(process.cwd(), '../frontend/dist/sweetlab-frontend'),
	
	// From project root
	path.resolve(process.cwd(), 'frontend/dist/sweetlab-frontend/browser'),
	path.resolve(process.cwd(), 'frontend/dist/sweetlab-frontend'),
	
	// From __dirname (backend/src)
	path.resolve(__dirname, '../../frontend/dist/sweetlab-frontend/browser'),
	path.resolve(__dirname, '../../frontend/dist/sweetlab-frontend'),
	
	// Render.com specific paths
	'/opt/render/project/src/frontend/dist/sweetlab-frontend/browser',
	'/opt/render/project/src/frontend/dist/sweetlab-frontend',
	'/opt/render/project/frontend/dist/sweetlab-frontend/browser',
	'/opt/render/project/frontend/dist/sweetlab-frontend'
];

let frontendBuildDir = null;
let frontendIndexHtml = null;

console.log('[APP] process.cwd():', process.cwd());
console.log('[APP] __dirname:', __dirname);
console.log('[APP] Contents of process.cwd():', fs.readdirSync(process.cwd()).join(', '));

// Check if ../frontend exists
const parentFrontendPath = path.resolve(process.cwd(), '../frontend');
if (fs.existsSync(parentFrontendPath)) {
	console.log('[APP] ../frontend exists, contents:', fs.readdirSync(parentFrontendPath).join(', '));
	const distPath = path.resolve(parentFrontendPath, 'dist');
	if (fs.existsSync(distPath)) {
		console.log('[APP]   dist/ exists, contents:', fs.readdirSync(distPath).join(', '));
	}
}

for (const candidate of frontendBuildCandidates) {
	const exists = fs.existsSync(candidate);
	console.log(`[APP] Checking: ${candidate} -> ${exists ? 'FOUND' : 'not found'}`);
	if (exists) {
		frontendBuildDir = candidate;
		frontendIndexHtml = path.join(frontendBuildDir, 'index.html');
		console.log('[APP] ✓ Frontend build found at:', frontendBuildDir);
		break;
	}
}

if (!frontendBuildDir) {
	console.warn('[APP] ✗ WARNING: Frontend build not found at any candidate path. Frontend will not be served.');
}

// Middleware para permitir peticiones desde el frontend
app.use(cors());

// Middleware para leer JSON en el cuerpo de las peticiones
app.use(express.json());

// Usar las rutas definidas
app.use('/api', recipeRoutes);

if (frontendBuildDir) {
	// Servir archivos estáticos del frontend
	app.use(express.static(frontendBuildDir));

	// Fallback SPA: para rutas que no son API ni archivos estáticos, servir index.html
	app.get('*', (req, res) => {
		console.log(`[ROUTE] GET ${req.path} -> serving ${frontendIndexHtml}`);
		if (!frontendIndexHtml) {
			return res.status(404).send('Frontend not available');
		}
		res.sendFile(frontendIndexHtml);
	});
} else {
	// Si no hay frontend, retornar error en cualquier ruta que no sea API
	app.get('*', (req, res) => {
		console.log(`[ROUTE] GET ${req.path} -> 404 (no frontend)`);
		res.status(404).json({ error: 'Frontend build not found' });
	});
}

module.exports = app;

