
export interface OdooConfig {
  url: string;
  db: string;
  username: string;
  apiKey: string;
}

export interface OdooEmployee {
  id: number;
  name: string;
  display_name: string;
  department_id: [number, string] | false;
}

export interface AttendancePayload {
  employee_id: number;
  check_in: string;
  check_out: string;
  in_browser?: string;
  in_ip_address?: string;
  in_latitude?: number;
  in_longitude?: number;
  in_mode?: 'manual' | 'kiosk' | 'systray' | 'browser';
  out_browser?: string;
  out_ip_address?: string;
  out_latitude?: number;
  out_longitude?: number;
  out_mode?: 'manual' | 'kiosk' | 'systray' | 'browser';
}

export class OdooService {
  private config: OdooConfig;

  constructor(config: OdooConfig) {
    this.config = config;
  }

  private async call(model: string, method: string, args: any[], kwargs: any = {}) {
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
            this.config.username,
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
      
      if (result.error) {
        throw new Error(`Error de Odoo: ${result.error.data?.message || result.error.message}`);
      }
      
      if (result.result === false) {
        throw new Error("Credenciales de Odoo incorrectas (Usuario, Base de datos o API Key)");
      }
      
      return result.result;
    } catch (e: any) {
      console.error("Auth error", e);
      throw e;
    }
  }

  async getEmployees(): Promise<OdooEmployee[]> {
    const uid = await this.authenticate();
    if (!uid) throw new Error("No se pudo autenticar con Odoo");

    return this.call('hr.employee', 'search_read', [
      [['active', '=', true]]
    ], {
      fields: ['id', 'name', 'display_name', 'department_id']
    });
  }

  async registerAttendance(payload: AttendancePayload) {
    const uid = await this.authenticate();
    if (!uid) throw new Error("No se pudo autenticar con Odoo");

    return this.call('hr.attendance', 'create', [payload]);
  }
}
