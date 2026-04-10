import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const EMPLEADOS_DEFAULT = [
  "ADAME GUTIERREZ ALMA GABRIELA",
  "AGUILAR CARREON ANA GENOVEVA",
  "AGUILAR CARREON ISIDRA",
  "ALEJANDRO FALCON",
  "ANA LILIA VELAZQUEZ GOMEZ",
  "ANDRADE MORA HUGO CESAR",
  "APARICIO VELAZQUEZ ANGEL ADOLFO",
  "ARISTEO SILVA TORRES",
  "BAUTISTA",
  "BRIONES ROBLES MIGUEL ANGEL",
  "CALZADA ORTIZ NANCY EDITH",
  "CAMPOS VARGAS JULIO",
  "CANALES MENA EDUARDO YONATHAN",
  "CAPUCHINO DELGADO JUAN DE LA CRUZ",
  "CARRERAS BAEZ CELENA",
  "CASTORENA CONTRERAS SERGIO EMMANUEL",
  "CASTORENA CONTRERAS VICTOR ALFONSO",
  "CELENA",
  "CHAVARRIA MACIAS ROBERTO DANIEL",
  "CHRISTOPHER BERNAL",
  "CRUZ GARCIA MIGUEL ANGEL",
  "CRUZ TRUJILLO JESUS ALEJANDRO",
  "CUELLAR MACIAS CESAR",
  "DAVDI",
  "DE LA CRUZ VILLA MARIA GUADALUPE",
  "DE SANTIAGO GARCIA JOSE ALFREDO",
  "DELGADO ARANDA JUAN ANDRES",
  "DELGADO RODRIGUEZ LUIS JULIAN",
  "DUEÑAS HUERTA JUAN CARLOS",
  "DUEÑAS MONTOYA JUAN DIEGO",
  "DUEÑAS VALADEZ MICHELLE SARAHI",
  "DURON JUAN ORLANDO",
  "EDUARDO",
  "ERIK RAUL ALBA BRIONES",
  "ESPARZA DE LOERA ANA ROSA",
  "ESPARZA RODRIGUEZ ULISES IVAN",
  "ESQUIVEL AVILA SERGIO ALEJANDRO",
  "GARCIA ESQUIVEL MIGUEL",
  "GARCIA JOSE REFUGIO",
  "GARCIA MARES JOSE DE JESUS",
  "GARCIA RAMOS MARCO ANTONIO",
  "GONZALEZ BRANDO FILIBERTO",
  "GONZALEZ ELIZALDE MARIELA",
  "GUILLEN MANRRIQUEZ RAUL URIEL",
  "GUSTAVO",
  "GUTIERREZ HERNANDEZ DIANA LIZETH",
  "GUTIERREZ HERNANDEZ MIREYA",
  "HERNANDEZ JIMENEZ PEDRO",
  "HERNANDEZ TORRES VIRIDIANA",
  "HERRADA ALBA JONATHAN GEOVANNI",
  "HERRERA CORDOVA ANA ROSA",
  "HERRERA MORENO JUANA NIEVES",
  "HERRERA RUVALCABA AYDE GUADALUPE",
  "IBARRA RUVALCABA DAVID EDUARDO",
  "JOVANA",
  "JUANA",
  "JUAREZ CHABLE ROSA ANGELICA",
  "JUAREZ CHABLE SERGIO CECILIO",
  "LARA DE LUNA GONZALO",
  "LAZARIN RODRIGUEZ BRAULIO",
  "LOPEZ MOYA JUANA MARIA",
  "LOYOLA GARCIA ALAN RAMON",
  "LUCIANA",
  "MACIAS BRENDA NALLELY",
  "MANUEL BUENROSTRO",
  "MARCIAL LUEVANO HARON ORACIO",
  "MARTINEZ RODRIGUEZ JAIME",
  "MARTINEZ RODRIGUEZ TERESA DE JESUS",
  "MELENDEZ CAPUCHINO VICTOR MANUEL",
  "MORENO DE LA ROSA SAMUEL IVAN",
  "MUÑOZ GUERRERO BRAYAN EDUARDO",
  "MUÑOZ HERNANDEZ MARIA DEL CARMEN",
  "NOEL NUÑEZ JORGE FABIAN",
  "NORMA DE LOERA",
  "NUÑEZ SALINAS WALTER GUSTAVO",
  "OMAR ALFREDO ARELLANO",
  "ORTIZ GUZMAN DANIEL ISRAEL",
  "PEREZ ROCHA DIANA JACQUELINE",
  "PIÑA CHAVEZ KAREN LIZETH",
  "RAMIREZ CRUZ JUAN JESUS",
  "RAMIREZ GONZALEZ MARCO ANTONIO",
  "RAMIREZ HERNANDEZ FERNANDA ZOE",
  "RAMIREZ MARTINEZ JESSICA JOANNA",
  "RANGEL AREVALO RAUL OSBALDO",
  "REYES OVALLE DANIEL",
  "REYES TAVARES LINDA ISAURA",
  "RIVERA FRANCISCO JAVIER",
  "RIVERA RAMOS DAYANA SOFIA",
  "RIVERA RAMOS JHOAN DE JESUS",
  "RODRIGUEZ DONDIEGO ALVARO MATEO",
  "RODRIGUEZ FRANCO EZEQUIEL DE JESUS",
  "ROMERO SAUL FIDEL",
  "SAMUEL ACEVES",
  "SANCHEZ CAMILO JONATHA DANIEL",
  "SANTANA ZAMARRIPA ARIANA",
  "SAUCEDO LOMELI EDUARDO",
  "TAVARES GUTIERREZ HECTOR MANUEL",
  "TORRES DE LA CRUZ ADAN",
  "VAZQUEZ LOPEZ OSCAR HUMBERTO",
  "VELAZQUEZ CAPUCHINO JOSE ARMANDO",
  "VELAZQUEZ GONZALES TERESA",
  "VENEGAS LUIS ENRIQUE",
  "VICTOR",
  "ZACARIAS RAMOS GLORIA",
  "ZAPATA ESCOBAR JOSE EMILIANO",
  "ZARATE TORRES ANGEL ANDRES",
  "ZAVALA SALAS JOSE ALFREDO",
];

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
  updateEmpleado: (id: string, nombre: string, areaId: string) => void;
  deleteEmpleado: (id: string) => void;
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

      let loadedAreas: Area[] = areasStr ? JSON.parse(areasStr) : [];
      let loadedEmpleados: Empleado[] = empleadosStr ? JSON.parse(empleadosStr) : [];
      let loadedRegistros: RegistroAsistencia[] = registrosStr ? JSON.parse(registrosStr) : [];

      // Cargar empleados por defecto si no se han cargado antes
      const defaultsLoaded = localStorage.getItem("asistencia_defaults_loaded");
      if (!defaultsLoaded) {
        let generalArea = loadedAreas.find(
          (a) => a.nombre.toUpperCase() === "GENERAL"
        );
        if (!generalArea) {
          generalArea = { id: genId(), nombre: "GENERAL" };
          loadedAreas.push(generalArea);
        }

        EMPLEADOS_DEFAULT.forEach((nombre) => {
          const exists = loadedEmpleados.some(
            (e) => e.nombre.toLowerCase() === nombre.toLowerCase()
          );
          if (!exists) {
            loadedEmpleados.push({
              id: genId() + Math.random().toString(36).substr(2, 5),
              nombre: nombre.trim(),
              areaId: generalArea!.id,
            });
          }
        });

        localStorage.setItem("asistencia_defaults_loaded", "true");
        localStorage.setItem(STORAGE_KEYS.AREAS, JSON.stringify(loadedAreas));
        localStorage.setItem(
          STORAGE_KEYS.EMPLEADOS,
          JSON.stringify(loadedEmpleados)
        );
      }

      setAreas(loadedAreas);
      setEmpleados(loadedEmpleados);
      setRegistros(loadedRegistros);
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

  const updateEmpleado = useCallback(
    (id: string, nombre: string, areaId: string) => {
      const updated = empleados.map((e) =>
        e.id === id ? { ...e, nombre: nombre.trim(), areaId } : e
      );
      setEmpleados(updated);
      saveEmpleados(updated);
    },
    [empleados]
  );

  const deleteEmpleado = useCallback(
    (id: string) => {
      const updated = empleados.filter((e) => e.id !== id);
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
        updateEmpleado,
        deleteEmpleado,
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

