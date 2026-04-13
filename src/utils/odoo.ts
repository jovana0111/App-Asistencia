
export interface OdooConfig {
  url: string;
  db: string;
  username: string;
  apiKey: string;
}

export interface OdooEmployee {
  id: number;
  name: string;
  department_id: [number, string] | false;
}

export class OdooService {
  private config: OdooConfig;

  constructor(config: OdooConfig) {
    this.config = config;
  }

  private async call(model: string, method: string, args: any[], kwargs: any = {}) {
    // Note: In a real production app, you might want to use a proxy to avoid exposing API keys
    // and to handle CORS. For now, we use direct fetch.
    const response = await fetch(`${this.config.url}/jsonrpc`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'call',
        params: {
          service: 'object',
          method: 'execute_kw',
          args: [
            this.config.db,
            this.config.username, // This might need to be uid, but some setups allow login
            this.config.apiKey,
            model,
            method,
            args,
            kwargs
          ],
        },
        id: Math.floor(Math.random() * 1000000),
      }),
    });

    const result = await response.json();
    if (result.error) {
      throw new Error(result.error.data?.message || result.error.message);
    }
    return result.result;
  }

  async authenticate() {
    // Verify credentials by searching for current user or just a ping
    try {
      const response = await fetch(`${this.config.url}/jsonrpc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'call',
          params: {
            service: 'common',
            method: 'authenticate',
            args: [this.config.db, this.config.username, this.config.apiKey, {}]
          },
          id: 1
        })
      });
      const result = await response.json();
      return result.result; // returns uid or false
    } catch (e) {
      console.error("Auth error", e);
      return false;
    }
  }

  async getEmployees(): Promise<OdooEmployee[]> {
    const uid = await this.authenticate();
    if (!uid) throw new Error("No se pudo autenticar con Odoo");

    return this.call('hr.employee', 'search_read', [
      [['active', '=', true]]
    ], {
      fields: ['id', 'name', 'department_id']
    });
  }

  async registerAttendance(employeeId: number, checkIn: string, checkOut: string) {
    const uid = await this.authenticate();
    if (!uid) throw new Error("No se pudo autenticar con Odoo");

    // Odoo expects UTC datetimes in YYYY-MM-DD HH:MM:SS format
    // Assuming checkIn and checkOut are already in local format YYYY-MM-DD HH:MM
    // We might need to adjust them to UTC if Odoo is configured for UTC (default)
    
    return this.call('hr.attendance', 'create', [{
      employee_id: employeeId,
      check_in: checkIn,
      check_out: checkOut,
    }]);
  }
}
