require('dotenv').config();
const express = require('express');
const xmlrpc = require('xmlrpc');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*'
}));
app.use(express.json());

// Extraer el host directamente de la URL base configurada (Render o Local)
const odooUrl = process.env.ODOO_BASE_URL || 'https://srv.seishin.com.mx';
const odooHost = odooUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
const isHttps = odooUrl.startsWith('https');

// Configuración leída estrictamente desde variables de entorno (Render envs o archivo .env local)
const ODOO_CONFIG = {
    host: odooHost,
    port: isHttps ? 443 : 80,
    db: process.env.ODOO_DB,
    username: process.env.ODOO_USER,
    apiKey: process.env.ODOO_PASSWORD
};

// Se recomienda usar el cliente según el protocolo con XML-RPC
const ClientModel = isHttps ? xmlrpc.createSecureClient : xmlrpc.createClient;
const common = ClientModel({ host: ODOO_CONFIG.host, port: ODOO_CONFIG.port, path: '/xmlrpc/2/common' });
const models = ClientModel({ host: ODOO_CONFIG.host, port: ODOO_CONFIG.port, path: '/xmlrpc/2/object' });

console.log('--- Servidor Proxy Odoo (XML-RPC) Iniciado ---');
console.log(`Configurado en: ${ODOO_CONFIG.host} | DB: ${ODOO_CONFIG.db} | URL Completa: ${odooUrl}`);

// [XML-RPC] Solicitar tabla hr.employee
app.get('/api/empleados', (req, res) => {
    if(!ODOO_CONFIG.db || !ODOO_CONFIG.username || !ODOO_CONFIG.apiKey) {
        return res.status(500).json({ error: 'Configuración faltante en el servidor (Revisa tus variables de entorno en Render o archivo .env local)' });
    }

    console.log('[GET] /api/empleados - Autenticando vía XML-RPC...');

    common.methodCall('authenticate', [ODOO_CONFIG.db, ODOO_CONFIG.username, ODOO_CONFIG.apiKey, {}], (err, uid) => {
        if (err) {
            console.error('Error de red XML-RPC:', err);
            return res.status(500).json({ error: 'Error de red con Odoo XML-RPC', details: err.message });
        }
        if (!uid) {
            console.error('Autenticación fallida con Odoo.');
            return res.status(401).json({ error: 'Credenciales de Odoo incorrectas o usuario sin permisos.' });
        }

        console.log(`Autenticado. UID: ${uid}. Consultando XML-RPC "hr.employee"...`);

        models.methodCall('execute_kw', [
            ODOO_CONFIG.db,
            uid,
            ODOO_CONFIG.apiKey,
            'hr.employee',
            'search_read',
            [[['active', '=', true]]],
            {
                fields: ['id', 'name', 'display_name', 'department_id', 'work_phone', 'barcode', 'job_id'],
                limit: 500
            }
        ], (err, employees) => {
            if (err) {
                console.error('Error XML-RPC search_read:', err);
                return res.status(500).json({ error: 'Acesso denegado o error consultando empleados', details: err.message });
            }
            console.log(`Enviando ${employees.length} empleados sincronizados.`);
            res.json({ empleados: employees });
        });
    });
});

// [XML-RPC] Registrar nueva asistencia
app.post('/api/asistencia', (req, res) => {
    const payload = req.body;

    common.methodCall('authenticate', [ODOO_CONFIG.db, ODOO_CONFIG.username, ODOO_CONFIG.apiKey, {}], (err, uid) => {
        if (err || !uid) return res.status(401).json({ error: 'Fallo de autenticación XML-RPC al registrar' });

        models.methodCall('execute_kw', [
            ODOO_CONFIG.db,
            uid,
            ODOO_CONFIG.apiKey,
            'hr.attendance',
            'create',
            [payload]
        ], (err, result) => {
            if (err) {
                console.error('Error XML-RPC create attendance:', err);
                return res.status(500).json({ error: 'Fallo al escribir en hr.attendance' });
            }
            res.json({ success: true, id: result });
        });
    });
});

// En Render o entornos de producción, el backend también sirve la parte frontend web estática
const DIST_PATH = path.join(__dirname, '../dist');
app.use(express.static(DIST_PATH));

// Redireccionar rutas de React a index.html si no son llamadas a /api/
const router = express.Router();
router.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(DIST_PATH, 'index.html'));
});
app.use(router);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`>>> PROXY ODOO LISTO EN EL PUERTO ${PORT} - MODO ${process.env.NODE_ENV || 'DESARROLLO'} <<<`);
});
