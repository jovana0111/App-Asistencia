import { User, PlusCircle } from "lucide-react";
import { useCallback, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Image,
} from "react-native";

import { DateTimeInput } from "../components/DateTimeInput";
import { Empleado, RegistroAsistencia, useApp } from "../context/AppContext";
import { useColors } from "../hooks/useColors";
import { TURNOS, getTurnoDatetimes, todayDate } from "../utils/dateFormat";
import logo from "../../assets/images/logo.png";

export default function RegistroScreen() {
  const colors = useColors();
  const { areas, empleados, addRegistro } = useApp();

  const [busqueda, setBusqueda] = useState("");
  const [sugerencias, setSugerencias] = useState<Empleado[]>([]);
  const [empleadoSel, setEmpleadoSel] = useState<Empleado | null>(null);
  const [turnoIdx, setTurnoIdx] = useState(0);

  const getInitialTimes = () => getTurnoDatetimes(0, new Date());
  const initial = getInitialTimes();
  const [entrada, setEntrada] = useState(initial.entrada);
  const [salida, setSalida] = useState(initial.salida);

  const actualizarHorasTurno = (idx: number) => {
    const base = new Date();
    const { entrada: e, salida: s } = getTurnoDatetimes(idx, base);
    setEntrada(e);
    setSalida(s);
  };

  const handleTurnoChange = (idx: number) => {
    setTurnoIdx(idx);
    actualizarHorasTurno(idx);
  };

  const onBusquedaChange = (text: string) => {
    setBusqueda(text);
    setEmpleadoSel(null);
    if (text.length > 0) {
      const filtered = empleados.filter((e) =>
        e.nombre.toLowerCase().includes(text.toLowerCase())
      );
      setSugerencias(filtered.slice(0, 6));
    } else {
      setSugerencias([]);
    }
  };

  const seleccionarEmpleado = (emp: Empleado) => {
    setEmpleadoSel(emp);
    setBusqueda(emp.nombre);
    setSugerencias([]);
  };

  const getAreaNombre = () => {
    if (!empleadoSel) return "";
    const area = areas.find((a) => a.id === empleadoSel.areaId);
    return area?.nombre ?? "";
  };

  const handleAgregarLista = useCallback(() => {
    if (!empleadoSel) {
      Alert.alert("Error", "Selecciona un empleado");
      return;
    }
    if (!entrada || !salida) {
      Alert.alert("Error", "Completa las horas de entrada y salida");
      return;
    }
    const registro: RegistroAsistencia = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      empleadoId: empleadoSel.id,
      empleadoNombre: empleadoSel.nombre,
      areaNombre: getAreaNombre(),
      turno: TURNOS[turnoIdx].nombre,
      fecha: todayDate(),
      entrada,
      salida,
    };
    addRegistro(registro);
    Alert.alert("Agregado", `${empleadoSel.nombre} en lista`);
    setBusqueda("");
    setEmpleadoSel(null);
    actualizarHorasTurno(turnoIdx);
  }, [empleadoSel, entrada, salida, turnoIdx, areas, addRegistro]);

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      backgroundColor: colors.headerBg,
      paddingTop: 14,
      paddingBottom: 18,
      paddingHorizontal: 20,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    logo: { width: 38, height: 38, borderRadius: 8 },
    headerTextWrap: { flex: 1 },
    headerTitle: {
      fontSize: 18,
      fontWeight: "700" as const,
      color: colors.headerFg,
      letterSpacing: -0.3,
    },
    headerSub: {
      fontSize: 11,
      color: "rgba(241,230,210,0.65)",
      marginTop: 1,
    },
    scroll: { flex: 1 },
    sectionLabel: {
      fontSize: 10,
      fontWeight: "700" as const,
      color: colors.secondary,
      letterSpacing: 1.1,
      textTransform: "uppercase",
      marginHorizontal: 16,
      marginTop: 16,
      marginBottom: 8,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      marginHorizontal: 16,
      marginBottom: 10,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    fieldLabel: {
      fontSize: 10,
      fontWeight: "600" as const,
      color: colors.secondary,
      letterSpacing: 0.7,
      textTransform: "uppercase",
      marginBottom: 5,
    },
    input: {
      backgroundColor: colors.background,
      borderWidth: 1.2,
      borderColor: colors.border,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 14,
      color: colors.foreground,
      marginBottom: 12,
    },
    areaDisplay: {
      backgroundColor: colors.accent,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderWidth: 1.2,
      borderColor: colors.border,
    },
    areaText: {
      fontSize: 14,
      color: empleadoSel ? colors.primary : colors.mutedForeground,
      fontWeight: '600',
    },
    sugerencias: {
      backgroundColor: colors.card,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 12,
      marginTop: -6,
      overflow: "hidden",
    },
    sugerencia: {
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    sugerenciaText: { fontSize: 13, color: colors.foreground, flex: 1 },
    sugerenciaArea: { fontSize: 11, color: colors.secondary },
    turnoRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
    turnoBtn: {
      flex: 1,
      paddingVertical: 10,
      paddingHorizontal: 6,
      borderRadius: 10,
      borderWidth: 1.2,
      borderColor: colors.border,
      alignItems: "center",
      backgroundColor: colors.background,
    },
    turnoBtnActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    turnoBtnLabel: { fontSize: 12, fontWeight: "700" as const, color: colors.mutedForeground },
    turnoBtnLabelActive: { color: "#fff" },
    turnoBtnHour: { fontSize: 10, color: colors.mutedForeground, marginTop: 1 },
    turnoBtnHourActive: { color: "rgba(255,255,255,0.75)" },
    timeRow: { flexDirection: "row", gap: 8 },
    timeHalf: { flex: 1 },
    addBtn: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "center",
      gap: 8,
      marginHorizontal: 16,
      marginBottom: 20,
    },
    addBtnText: {
      fontSize: 15,
      fontWeight: "700" as const,
      color: "#fff",
      letterSpacing: 0.3,
    },
    emptyBanner: {
      backgroundColor: "#FFF8F0",
      borderLeftWidth: 3,
      borderLeftColor: colors.primary,
      borderRadius: 8,
      padding: 10,
      marginHorizontal: 16,
      marginTop: 10,
    },
    emptyBannerText: { fontSize: 12, color: colors.primary },
    bottomPad: { height: 60 },
  });

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Image
          source={logo as any}
          style={s.logo}
          resizeMode="contain"
        />
        <View style={s.headerTextWrap}>
          <Text style={s.headerTitle}>Registro de Asistencia</Text>
          <Text style={s.headerSub}>
            {new Date().toLocaleDateString("es-MX", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </Text>
        </View>
      </View>

      {empleados.length === 0 && (
        <View style={s.emptyBanner}>
          <Text style={s.emptyBannerText}>
            Sin empleados. Ve a "Empleados" para agregar.
          </Text>
        </View>
      )}

      <ScrollView style={s.scroll} keyboardShouldPersistTaps="handled">
        <Text style={s.sectionLabel}>Datos del empleado</Text>
        <View style={s.card}>
          <Text style={s.fieldLabel}>Buscar empleado</Text>
          <TextInput
            style={[s.input, sugerencias.length > 0 && { marginBottom: 4 }]}
            placeholder="Escriba el nombre..."
            placeholderTextColor={colors.mutedForeground}
            value={busqueda}
            onChangeText={onBusquedaChange}
          />
          {sugerencias.length > 0 && (
            <View style={s.sugerencias}>
              {sugerencias.map((emp) => {
                const area = areas.find((a) => a.id === emp.areaId);
                return (
                  <Pressable
                    key={emp.id}
                    style={s.sugerencia}
                    onPress={() => seleccionarEmpleado(emp)}
                  >
                    <User size={13} color={colors.secondary} />
                    <Text style={s.sugerenciaText}>{emp.nombre}</Text>
                    <Text style={s.sugerenciaArea}>{area?.nombre}</Text>
                  </Pressable>
                );
              })}
            </View>
          )}
          <Text style={s.fieldLabel}>Area asignada</Text>
          <View style={s.areaDisplay}>
            <Text style={s.areaText}>
              {getAreaNombre() || (empleadoSel ? "Sin area" : "—")}
            </Text>
          </View>
        </View>

        <Text style={s.sectionLabel}>Turno y horario</Text>
        <View style={s.card}>
          <View style={s.turnoRow}>
            {TURNOS.map((_, idx) => (
              <Pressable
                key={idx}
                style={[s.turnoBtn, turnoIdx === idx && s.turnoBtnActive]}
                onPress={() => handleTurnoChange(idx)}
              >
                <Text style={[s.turnoBtnLabel, turnoIdx === idx && s.turnoBtnLabelActive]}>
                  {idx === 0 ? "1er Turno" : "2do Turno"}
                </Text>
                <Text style={[s.turnoBtnHour, turnoIdx === idx && s.turnoBtnHourActive]}>
                  {idx === 0 ? "08:00 – 20:00" : "20:00 – 08:00"}
                </Text>
              </Pressable>
            ))}
          </View>
          <View style={s.timeRow}>
            <View style={s.timeHalf}>
              <DateTimeInput label="Entrada" value={entrada} onChange={setEntrada} />
            </View>
            <View style={s.timeHalf}>
              <DateTimeInput label="Salida" value={salida} onChange={setSalida} />
            </View>
          </View>
        </View>
        <View style={s.bottomPad} />
      </ScrollView>

      <Pressable
        style={({ pressed }: { pressed: boolean }) => [
          s.addBtn,
          pressed && { opacity: 0.88 },
        ]}
        onPress={handleAgregarLista}
      >
        <PlusCircle size={18} color="#fff" />
        <Text style={s.addBtnText}>Agregar a la lista</Text>
      </Pressable>
    </View>
  );
}
