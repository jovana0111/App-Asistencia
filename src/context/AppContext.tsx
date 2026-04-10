import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export interface Area {
  id: string;
  nombre: string;
}

export interface Empleado {
  id: string;
  nombre: string;
  areaId: string;
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
}

interface AppContextType {
  areas: Area[];
  empleados: Empleado[];
  registros: RegistroAsistencia[];
  addArea: (nombre: string) => void;
  addEmpleado: (nombre: string, areaId: string) => void;
  addRegistro: (registro: RegistroAsistencia) => void;
  deleteRegistro: (id: string) => void;
  clearRegistros: () => void;
  getAreaByEmpleado: (empleadoId: string) => Area | undefined;
  importEmpleados: (data: { nombre: string; area: string }[]) => void;
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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      const areasStr = localStorage.getItem(STORAGE_KEYS.AREAS);
      const empleadosStr = localStorage.getItem(STORAGE_KEYS.EMPLEADOS);
      const registrosStr = localStorage.getItem(STORAGE_KEYS.REGISTROS);
      
      if (areasStr) setAreas(JSON.parse(areasStr));
      if (empleadosStr) setEmpleados(JSON.parse(empleadosStr));
      if (registrosStr) setRegistros(JSON.parse(registrosStr));
    } catch {}
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

  const addArea = useCallback(
    (nombre: string) => {
      const nueva: Area = { id: genId(), nombre: nombre.trim() };
      const updated = [...areas, nueva];
      setAreas(updated);
      saveAreas(updated);
    },
    [areas]
  );

  const addEmpleado = useCallback(
    (nombre: string, areaId: string) => {
      const nuevo: Empleado = { id: genId(), nombre: nombre.trim(), areaId };
      const updated = [...empleados, nuevo];
      setEmpleados(updated);
      saveEmpleados(updated);
    },
    [empleados]
  );

  const addRegistro = useCallback(
    (registro: RegistroAsistencia) => {
      const updated = [registro, ...registros];
      setRegistros(updated);
      saveRegistros(updated);
    },
    [registros]
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
        addArea,
        addEmpleado,
        addRegistro,
        deleteRegistro,
        clearRegistros,
        getAreaByEmpleado,
        importEmpleados,
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

