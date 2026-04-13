
const xmlrpc = require('xmlrpc');

const ODOO_CONFIG = {
    url: 'srv.seishin.com.mx', // Solo el host para createSecureClient
    port: 443,
    db: 'testcont1',
    username: 'admin',
    apiKey: '1234'
};

const common = xmlrpc.createSecureClient({ host: ODOO_CONFIG.url, port: ODOO_CONFIG.port, path: '/xmlrpc/2/common' });

console.log('--- Iniciando prueba de conexión Odoo ---');
console.log(`Intentando conectar a: ${ODOO_CONFIG.url}:${ODOO_CONFIG.port}`);

common.methodCall('authenticate', [ODOO_CONFIG.db, ODOO_CONFIG.username, ODOO_CONFIG.apiKey, {}], (err, uid) => {
    if (err) {
        console.error('❌ ERROR FATAL DE CONEXIÓN:', err);
        return;
    }
    if (uid === false) {
        console.error('❌ CREDENCIALES INCORRECTAS (admin / 1234)');
        return;
    }
    console.log('✅ AUTENTICACIÓN EXITOSA. UID:', uid);

    const models = xmlrpc.createSecureClient({ host: ODOO_CONFIG.url, port: ODOO_CONFIG.port, path: '/xmlrpc/2/object' });

    console.log('Consultando empleados...');
    models.methodCall('execute_kw', [
        ODOO_CONFIG.db,
        uid,
        ODOO_CONFIG.apiKey,
        'hr.employee',
        'search_read',
        [[]],
        { fields: ['name', 'display_name', 'department_id'], limit: 5 }
    ], (err, res) => {
        if (err) {
            console.error('❌ ERROR AL CONSULTAR:', err);
            return;
        }
        console.log('✅ CONSULTA EXITOSA. Empleados encontrados:', res.length);
        console.log('Primer empleado:', res[0]?.name);
    });
});
