
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
  private uid: number | null = null;

  constructor(config: OdooConfig) {
    this.config = config;
  }

  private async callRaw(path: string, params: any) {
    const response = await fetch(`${this.config.url}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'call',
        params: params,
        id: Math.floor(Math.random() * 1000000),
      }),
    });

    const result = await response.json();
    if (result.error) {
      throw new Error(`Odoo Error: ${result.error.data?.message || result.error.message}`);
    }
    return result.result;
  }

  async authenticate() {
    try {
      // Usamos el endpoint de sesión que es más común en instalaciones modernas
      const result = await this.callRaw('/web/session/authenticate', {
        db: this.config.db,
        login: this.config.username,
        password: this.config.apiKey,
      });

      if (!result || !result.uid) {
        throw new Error("Credenciales de Odoo incorrectas");
      }

      this.uid = result.uid;
      return result.uid;
    } catch (e: any) {
      console.error("Auth error", e);
      // Intentar método común si el de sesión falla (fallback)
      try {
        const result = await this.callRaw('/jsonrpc', {
          service: 'common',
          method: 'authenticate',
          args: [this.config.db, this.config.username, this.config.apiKey, {}]
        });
        if (result) {
          this.uid = result;
          return result;
        }
      } catch {}
      throw e;
    }
  }

  async getEmployees(): Promise<OdooEmployee[]> {
    if (!this.uid) await this.authenticate();

    return this.callRaw('/jsonrpc', {
      service: 'object',
      method: 'execute_kw',
      args: [
        this.config.db,
        this.uid,
        this.config.apiKey,
        'hr.employee',
        'search_read',
        [[['active', '=', true]]],
        { fields: ['id', 'name', 'display_name', 'department_id'] }
      ]
    });
  }

  async registerAttendance(payload: AttendancePayload) {
    if (!this.uid) await this.authenticate();

    return this.callRaw('/jsonrpc', {
      service: 'object',
      method: 'execute_kw',
      args: [
        this.config.db,
        this.uid,
        this.config.apiKey,
        'hr.attendance',
        'create',
        [payload]
      ]
    });
  }
}
