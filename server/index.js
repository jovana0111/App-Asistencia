
const express = require('express');
const xmlrpc = require('xmlrpc');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Configuración de Odoo (Idealmente usar variables de entorno)
const ODOO_CONFIG = {
    url: 'https://srv.seishin.com.mx',
    db: 'testcont1',
    username: 'admin',
    apiKey: '1234'
};

const getClient = (path) => {
    const isHttps = ODOO_CONFIG.url.startsWith('https');
    return xmlrpc.createSecureClient(ODOO_CONFIG.url + path);
};

// Endpoint para traer empleados
app.get('/api/empleados', (req, res) => {
    const common = getClient('/xmlrpc/2/common');
    const models = getClient('/xmlrpc/2/object');

    console.log('Autenticando en Odoo...');
    common.methodCall('authenticate', [ODOO_CONFIG.db, ODOO_CONFIG.username, ODOO_CONFIG.apiKey, {}], (err, uid) => {
        if (err) {
            console.error('Auth Error:', err);
            return res.status(500).json({ error: 'Error de autenticación', details: err.message });
        }
        if (!uid || uid === false) {
            return res.status(401).json({ error: 'Credenciales incorrectas' });
        }

        console.log('UID obtenido:', uid, '. Consultando empleados...');
        models.methodCall('execute_kw', [
            ODOO_CONFIG.db,
            uid,
            ODOO_CONFIG.apiKey,
            'hr.employee',
            'search_read',
            [[['active', '=', true]]],
            {
                fields: ['name', 'display_name', 'department_id', 'work_phone'],
                limit: 100
            }
        ], (err, empleados) => {
            if (err) {
                console.error('Model Error:', err);
                return res.status(500).json({ error: 'Error al consultar empleados', details: err.message });
            }
            res.json(empleados);
        });
    });
});

// Endpoint para registrar asistencia
app.post('/api/asistencia', (req, res) => {
    const payload = req.body;
    const common = getClient('/xmlrpc/2/common');
    const models = getClient('/xmlrpc/2/object');

    common.methodCall('authenticate', [ODOO_CONFIG.db, ODOO_CONFIG.username, ODOO_CONFIG.apiKey, {}], (err, uid) => {
        if (err || !uid) return res.status(401).json({ error: 'Autenticación fallida' });

        models.methodCall('execute_kw', [
            ODOO_CONFIG.db,
            uid,
            ODOO_CONFIG.apiKey,
            'hr.attendance',
            'create',
            [payload]
        ], (err, result) => {
            if (err) return res.status(500).json({ error: 'Error al crear asistencia', details: err.message });
            res.json({ success: true, id: result });
        });
    });
});

// Servir archivos estáticos en producción
const DIST_PATH = path.join(__dirname, '../dist');
app.use(express.static(DIST_PATH));
app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(DIST_PATH, 'index.html'));
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor Proxy Odoo corriendo en puerto ${PORT}`);
});
