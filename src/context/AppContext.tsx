
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { OdooConfig, OdooService, AttendancePayload } from "../utils/odoo";

// --- CONFIGURACIÓN DE ODOO ---
const ODOO_CONFIG: OdooConfig = {
  // En desarrollo usamos el proxy definido en vite.config.ts para evitar errores de CORS
  url: (import.meta as any).env.VITE_ODOO_URL || (import.meta as any).env.DEV ? "/odoo-api" : "https://srv.seishin.com.mx",
  db: (import.meta as any).env.VITE_ODOO_DB || "testcont1",
  username: (import.meta as any).env.VITE_ODOO_USERNAME || "admin",
  apiKey: (import.meta as any).env.VITE_ODOO_API_KEY || "0ecd94a3226d0492385157f6d18cb468d4108d26",
};

const odoo = new OdooService(ODOO_CONFIG);

export interface Area {
  id: string;
  nombre: string;
}

export interface Empleado {
  id: string;
  nombre: string;
  areaId: string;
  display_name?: string;
  odooId?: number;
  work_phone?: string;
}

export interface RegistroAsistencia {
  id: string;
  empleadoId: string;
  empleadoNombre: string;
  areaNombre: string;
  turno: string;
  fecha: string;
  entrada: string;
  salida: string;
  odooSync?: boolean;
}

interface AppContextType {
  areas: Area[];
  empleados: Empleado[];
  registros: RegistroAsistencia[];
  loading: boolean;
  odooError: string | null;
  addArea: (nombre: string) => void;
  addEmpleado: (nombre: string, areaId: string) => void;
  updateEmpleado: (id: string, nombre: string, areaId: string) => void;
  deleteEmpleado: (id: string) => void;
  addRegistro: (registro: RegistroAsistencia) => Promise<void>;
  deleteRegistro: (id: string) => void;
  clearRegistros: () => void;
  getAreaByEmpleado: (empleadoId: string) => Area | undefined;
  importEmpleados: (data: { nombre: string; area: string }[]) => void;
  refreshOdooEmployees: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  AREAS: "asistencia_areas",
  EMPLEADOS: "asistencia_empleados",
  REGISTROS: "asistencia_registros",
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [areas, setAreas] = useState<Area[]>([]);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [registros, setRegistros] = useState<RegistroAsistencia[]>([]);
  const [loading, setLoading] = useState(false);
  const [odooError, setOdooError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    refreshOdooEmployees();
  }, []);

  const loadData = () => {
    try {
      const areasStr = localStorage.getItem(STORAGE_KEYS.AREAS);
      const empleadosStr = localStorage.getItem(STORAGE_KEYS.EMPLEADOS);
      const registrosStr = localStorage.getItem(STORAGE_KEYS.REGISTROS);

      let loadedAreas: Area[] = areasStr ? JSON.parse(areasStr) : [];
      let loadedEmpleados: Empleado[] = empleadosStr ? JSON.parse(empleadosStr) : [];
      let loadedRegistros: RegistroAsistencia[] = registrosStr ? JSON.parse(registrosStr) : [];

      setAreas(loadedAreas);
      setEmpleados(loadedEmpleados);
      setRegistros(loadedRegistros);
    } catch { }
  };

  const refreshOdooEmployees = async () => {
    setLoading(true);
    setOdooError(null);
    try {
      const odooEmployees = await odoo.getEmployees();
      
      const newAreas = [...areas];
      const newEmpleados: Empleado[] = odooEmployees.map(oe => {
        const areaName = (oe.department_id && oe.department_id[1]) ? oe.department_id[1] : "GENERAL";
        let area = newAreas.find(a => a.nombre === areaName);
        if (!area) {
          area = { id: Date.now().toString() + Math.random(), nombre: areaName };
          newAreas.push(area);
        }

        return {
          id: `odoo_${oe.id}`,
          nombre: oe.display_name || oe.name,
          display_name: oe.display_name,
          areaId: area.id,
          odooId: oe.id,
          work_phone: oe.work_phone
        };
      });

      setAreas(newAreas);
      setEmpleados(newEmpleados);
      saveAreas(newAreas);
      saveEmpleados(newEmpleados);
    } catch (e: any) {
      setOdooError(e.message || "Error al conectar con Odoo");
    } finally {
      setLoading(false);
    }
  };

  const saveAreas = (data: Area[]) => {
    localStorage.setItem(STORAGE_KEYS.AREAS, JSON.stringify(data));
  };
  const saveEmpleados = (data: Empleado[]) => {
    localStorage.setItem(STORAGE_KEYS.EMPLEADOS, JSON.stringify(data));
  };
  const saveRegistros = (data: RegistroAsistencia[]) => {
    localStorage.setItem(STORAGE_KEYS.REGISTROS, JSON.stringify(data));
  };

  const genId = () =>
    Date.now().toString() + Math.random().toString(36).substr(2, 9);

  // Helper para metadata de producción
  const getProductionMetadata = async () => {
    const meta: any = {
      in_browser: navigator.userAgent.substring(0, 60),
      in_mode: 'browser',
    };

    try {
      const ipRes = await fetch('https://api.ipify.org?format=json').then(r => r.json());
      meta.in_ip_address = ipRes.ip;
    } catch { }

    try {
      const pos = await new Promise<GeolocationPosition>((res, rej) =>
        navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000 })
      );
      meta.in_latitude = pos.coords.latitude;
      meta.in_longitude = pos.coords.longitude;
    } catch { }

    return meta;
  };

  const addArea = useCallback((nombre: string) => {
    const nueva: Area = { id: genId(), nombre: nombre.trim() };
    const updated = [...areas, nueva];
    setAreas(updated);
    saveAreas(updated);
  }, [areas]);

  const addEmpleado = useCallback((nombre: string, areaId: string) => {
    const nuevo: Empleado = { id: genId(), nombre: nombre.trim(), areaId };
    const updated = [...empleados, nuevo];
    setEmpleados(updated);
    saveEmpleados(updated);
  }, [empleados]);

  const updateEmpleado = useCallback((id: string, nombre: string, areaId: string) => {
    const updated = empleados.map((e) =>
      e.id === id ? { ...e, nombre: nombre.trim(), areaId } : e
    );
    setEmpleados(updated);
    saveEmpleados(updated);
  }, [empleados]);

  const deleteEmpleado = useCallback((id: string) => {
    const updated = empleados.filter((e) => e.id !== id);
    setEmpleados(updated);
    saveEmpleados(updated);
  }, [empleados]);

  const addRegistro = useCallback(
    async (registro: RegistroAsistencia) => {
      let updatedRegistro = { ...registro };
      
      const emp = empleados.find(e => e.id === registro.empleadoId);
      if (emp?.odooId) {
        try {
          const checkIn = registro.entrada.length === 16 ? `${registro.entrada}:00` : registro.entrada;
          const checkOut = registro.salida.length === 16 ? `${registro.salida}:00` : registro.salida;
          
          const meta = await getProductionMetadata();
          
          await odoo.registerAttendance({
            employee_id: emp.odooId,
            check_in: checkIn,
            check_out: checkOut,
            ...meta
          });

          updatedRegistro.odooSync = true;
        } catch (e) {
          console.error("Error sincronizando con Odoo", e);
          updatedRegistro.odooSync = false;
        }
      }

      const updated = [updatedRegistro, ...registros];
      setRegistros(updated);
      saveRegistros(updated);
    },
    [registros, empleados]
  );

  const deleteRegistro = useCallback(
    (id: string) => {
      const updated = registros.filter((r) => r.id !== id);
      setRegistros(updated);
      saveRegistros(updated);
    },
    [registros]
  );

  const clearRegistros = useCallback(() => {
    setRegistros([]);
    saveRegistros([]);
  }, []);

  const getAreaByEmpleado = useCallback(
    (empleadoId: string) => {
      const emp = empleados.find((e) => e.id === empleadoId);
      if (!emp) return undefined;
      return areas.find((a) => a.id === emp.areaId);
    },
    [empleados, areas]
  );

  const importEmpleados = useCallback(
    (data: { nombre: string; area: string }[]) => {
      const newAreas = [...areas];
      const newEmpleados = [...empleados];

      data.forEach((item) => {
        let area = newAreas.find(
          (a) => a.nombre.toLowerCase() === item.area.toLowerCase()
        );
        if (!area) {
          area = { id: genId(), nombre: item.area.trim() };
          newAreas.push(area);
        }
        const exists = newEmpleados.some(
          (e) =>
            e.nombre.toLowerCase() === item.nombre.toLowerCase() &&
            e.areaId === area!.id
        );
        if (!exists) {
          newEmpleados.push({
            id: genId(),
            nombre: item.nombre.trim(),
            areaId: area!.id,
          });
        }
      });

      setAreas(newAreas);
      setEmpleados(newEmpleados);
      saveAreas(newAreas);
      saveEmpleados(newEmpleados);
    },
    [areas, empleados]
  );

  return (
    <AppContext.Provider
      value={{
        areas,
        empleados,
        registros,
        loading,
        odooError,
        addArea,
        addEmpleado,
        updateEmpleado,
        deleteEmpleado,
        addRegistro,
        deleteRegistro,
        clearRegistros,
        getAreaByEmpleado,
        importEmpleados,
        refreshOdooEmployees,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
