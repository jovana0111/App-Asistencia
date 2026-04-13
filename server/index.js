
const express = require('express');
const xmlrpc = require('xmlrpc');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Configuración de Odoo
const ODOO_CONFIG = {
    host: 'srv.seishin.com.mx',
    port: 443,
    db: 'testcont1',
    username: 'admin',
    apiKey: '1234'
};

// Clientes XML-RPC robustos
const common = xmlrpc.createSecureClient({ host: ODOO_CONFIG.host, port: ODOO_CONFIG.port, path: '/xmlrpc/2/common' });
const models = xmlrpc.createSecureClient({ host: ODOO_CONFIG.host, port: ODOO_CONFIG.port, path: '/xmlrpc/2/object' });

console.log('--- Servidor Proxy Odoo Iniciado ---');
console.log(`Configurado para: ${ODOO_CONFIG.host} | DB: ${ODOO_CONFIG.db}`);

// Traer Empleados
app.get('/api/empleados', (req, res) => {
    console.log('[GET] /api/empleados - Autenticando...');
    
    common.methodCall('authenticate', [ODOO_CONFIG.db, ODOO_CONFIG.username, ODOO_CONFIG.apiKey, {}], (err, uid) => {
        if (err) {
            console.error('Error de red Odoo:', err);
            return res.status(500).json({ error: 'Error de red con Odoo', details: err.message });
        }
        if (uid === false) {
            console.error('Autenticación fallida');
            return res.status(401).json({ error: 'Credenciales de Odoo incorrectas' });
        }

        console.log(`Autenticado. UID: ${uid}. Consultando empleados...`);
        
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
                console.error('Error de consulta:', err);
                return res.status(500).json({ error: 'Error al leer empleados', details: err.message });
            }
            console.log(`Enviando ${employees.length} empleados.`);
            res.json(employees);
        });
    });
});

// Registrar Asistencia
app.post('/api/asistencia', (req, res) => {
    console.log('[POST] /api/asistencia - Recibido:', req.body.employee_id);
    const payload = req.body;

    common.methodCall('authenticate', [ODOO_CONFIG.db, ODOO_CONFIG.username, ODOO_CONFIG.apiKey, {}], (err, uid) => {
        if (err || !uid) return res.status(401).json({ error: 'Fallo de autenticación' });

        models.methodCall('execute_kw', [
            ODOO_CONFIG.db,
            uid,
            ODOO_CONFIG.apiKey,
            'hr.attendance',
            'create',
            [payload]
        ], (err, result) => {
            if (err) {
                console.error('Error al registrar asistencia:', err);
                return res.status(500).json({ error: 'No se pudo registrar en Odoo' });
            }
            console.log('Asistencia registrada con éxito en Odoo ID:', result);
            res.json({ success: true, id: result });
        });
    });
});

// Servir App en Producción
const DIST_PATH = path.join(__dirname, '../dist');
app.use(express.static(DIST_PATH));
app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(DIST_PATH, 'index.html'));
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`>>> PROXY ODOO LISTO EN EL PUERTO ${PORT}`);
});
