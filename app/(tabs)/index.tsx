import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import React, { useCallback, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { DateTimeInput } from "@/components/DateTimeInput";
import { Empleado, RegistroAsistencia, useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { TURNOS, getTurnoDatetimes, todayDate } from "@/utils/dateFormat";

export default function RegistroScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
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
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Agregado", `${empleadoSel.nombre} en lista`);
    setBusqueda("");
    setEmpleadoSel(null);
    actualizarHorasTurno(turnoIdx);
  }, [empleadoSel, entrada, salida, turnoIdx]);

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      backgroundColor: colors.headerBg,
      paddingTop: Platform.OS === "web" ? insets.top + 18 : insets.top + 12,
      paddingBottom: 22,
      paddingHorizontal: 24,
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
    },
    logo: { width: 44, height: 44, borderRadius: 8 },
    headerTextWrap: { flex: 1 },
    headerTitle: {
      fontSize: 20,
      fontWeight: "700" as const,
      color: colors.headerFg,
      fontFamily: "Inter_700Bold",
      letterSpacing: -0.3,
    },
    headerSub: {
      fontSize: 12,
      color: "rgba(241,230,210,0.65)",
      marginTop: 1,
      fontFamily: "Inter_400Regular",
    },
    scroll: { flex: 1 },
    sectionLabel: {
      fontSize: 11,
      fontWeight: "700" as const,
      color: colors.secondary,
      letterSpacing: 1.2,
      textTransform: "uppercase",
      marginHorizontal: 20,
      marginTop: 22,
      marginBottom: 10,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 20,
      marginHorizontal: 16,
      marginBottom: 12,
      shadowColor: "#210706",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.07,
      shadowRadius: 10,
      elevation: 3,
    },
    fieldLabel: {
      fontSize: 11,
      fontWeight: "600" as const,
      color: colors.secondary,
      letterSpacing: 0.8,
      textTransform: "uppercase",
      marginBottom: 6,
    },
    input: {
      backgroundColor: colors.background,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 13,
      fontSize: 15,
      color: colors.foreground,
      fontFamily: "Inter_400Regular",
      marginBottom: 14,
    },
    areaDisplay: {
      backgroundColor: colors.accent,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 13,
      borderWidth: 1.5,
      borderColor: colors.border,
    },
    areaText: {
      fontSize: 15,
      color: empleadoSel ? colors.primary : colors.mutedForeground,
      fontFamily: "Inter_600SemiBold",
    },
    sugerencias: {
      backgroundColor: colors.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 14,
      marginTop: -8,
      overflow: "hidden",
      shadowColor: "#210706",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 4,
    },
    sugerencia: {
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    sugerenciaText: { fontSize: 14, color: colors.foreground, fontFamily: "Inter_500Medium", flex: 1 },
    sugerenciaArea: { fontSize: 12, color: colors.secondary, fontFamily: "Inter_400Regular" },
    turnoRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
    turnoBtn: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 8,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: colors.border,
      alignItems: "center",
      backgroundColor: colors.background,
    },
    turnoBtnActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    turnoBtnLabel: { fontSize: 13, fontWeight: "700" as const, color: colors.mutedForeground, fontFamily: "Inter_700Bold" },
    turnoBtnLabelActive: { color: "#fff" },
    turnoBtnHour: { fontSize: 11, color: colors.mutedForeground, marginTop: 2 },
    turnoBtnHourActive: { color: "rgba(255,255,255,0.75)" },
    timeRow: { flexDirection: "row", gap: 10 },
    timeHalf: { flex: 1 },
    addBtn: {
      backgroundColor: colors.primary,
      borderRadius: 16,
      paddingVertical: 17,
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "center",
      gap: 10,
      marginHorizontal: 16,
      marginBottom: Platform.OS === "web" ? 84 + 16 : 49 + insets.bottom + 16,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 4,
    },
    addBtnText: {
      fontSize: 16,
      fontWeight: "700" as const,
      color: "#fff",
      fontFamily: "Inter_700Bold",
      letterSpacing: 0.3,
    },
    emptyBanner: {
      backgroundColor: "#FFF8F0",
      borderLeftWidth: 3,
      borderLeftColor: colors.primary,
      borderRadius: 10,
      padding: 12,
      marginHorizontal: 16,
      marginTop: 14,
    },
    emptyBannerText: { fontSize: 13, color: colors.primary, fontFamily: "Inter_500Medium" },
    bottomPad: { height: Platform.OS === "web" ? 84 + 80 : 49 + insets.bottom + 80 },
  });

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Image
          source={require("@/assets/images/logo.png")}
          style={s.logo}
          contentFit="contain"
        />
        <View style={s.headerTextWrap}>
          <Text style={s.headerTitle}>Registro de Asistencia</Text>
          <Text style={s.headerSub}>
            {new Date().toLocaleDateString("es-MX", {
              weekday: "long",
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
            style={[s.input, sugerencias.length > 0 && { marginBottom: 6 }]}
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
                    <Feather name="user" size={14} color={colors.secondary} />
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
            {TURNOS.map((turno, idx) => (
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
        style={({ pressed }) => [
          s.addBtn,
          pressed && { opacity: 0.88, transform: [{ scale: 0.98 }] },
        ]}
        onPress={handleAgregarLista}
      >
        <Feather name="plus-circle" size={20} color="#fff" />
        <Text style={s.addBtnText}>Agregar a la lista</Text>
      </Pressable>
    </View>
  );
}
