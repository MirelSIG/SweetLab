const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const recipeRoutes = require('./routes/recipeRoutes');

const app = express();

const frontendBuildCandidates = [
	path.resolve(process.cwd(), '../frontend/dist/sweetlab-frontend/browser'),
	path.resolve(process.cwd(), '../frontend/dist/sweetlab-frontend'),
	path.resolve(process.cwd(), 'frontend/dist/sweetlab-frontend/browser'),
	path.resolve(process.cwd(), 'frontend/dist/sweetlab-frontend'),
	path.resolve(__dirname, '../../frontend/dist/sweetlab-frontend/browser'),
	path.resolve(__dirname, '../../frontend/dist/sweetlab-frontend'),
	'/opt/render/project/src/frontend/dist/sweetlab-frontend/browser',
	'/opt/render/project/src/frontend/dist/sweetlab-frontend'
];

let frontendBuildDir = null;
let frontendIndexHtml = null;

console.log('[APP] process.cwd():', process.cwd());
console.log('[APP] __dirname:', __dirname);

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

