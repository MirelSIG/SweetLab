const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const recipeRoutes = require('./routes/recipeRoutes');

const app = express();

const frontendBuildCandidates = [
	path.resolve(__dirname, '../../frontend/dist/sweetlab-frontend/browser'),
	path.resolve(__dirname, '../../frontend/dist/sweetlab-frontend')
];

const frontendBuildDir = frontendBuildCandidates.find((candidate) => fs.existsSync(candidate));
const frontendIndexHtml = frontendBuildDir ? path.join(frontendBuildDir, 'index.html') : null;

// Middleware para permitir peticiones desde el frontend
app.use(cors());

// Middleware para leer JSON en el cuerpo de las peticiones
app.use(express.json());

// Usar las rutas definidas
app.use('/api', recipeRoutes);

if (frontendBuildDir) {
	app.use(express.static(frontendBuildDir));

	app.get(/^\/(?!api).*/, (req, res, next) => {
		if (!frontendIndexHtml) {
			return next();
		}

		return res.sendFile(frontendIndexHtml);
	});
}

module.exports = app;

