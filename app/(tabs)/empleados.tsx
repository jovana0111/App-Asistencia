import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import React, { useState } from "react";
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

import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

export default function EmpleadosScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { areas, empleados, addArea, addEmpleado } = useApp();

  const [nuevaArea, setNuevaArea] = useState("");
  const [nuevoEmp, setNuevoEmp] = useState("");
  const [areaSelId, setAreaSelId] = useState<string>("");
  const [tab, setTab] = useState<"areas" | "empleados">("areas");

  const handleAddArea = () => {
    if (!nuevaArea.trim()) {
      Alert.alert("Error", "Ingresa el nombre del area");
      return;
    }
    addArea(nuevaArea);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setNuevaArea("");
  };

  const handleAddEmpleado = () => {
    if (!nuevoEmp.trim()) {
      Alert.alert("Error", "Ingresa el nombre del empleado");
      return;
    }
    if (!areaSelId) {
      Alert.alert("Error", "Selecciona un area");
      return;
    }
    addEmpleado(nuevoEmp, areaSelId);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setNuevoEmp("");
  };

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
    headerTitle: {
      fontSize: 20,
      fontWeight: "700" as const,
      color: colors.headerFg,
      fontFamily: "Inter_700Bold",
      letterSpacing: -0.3,
    },
    tabRow: {
      flexDirection: "row",
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    tabBtn: {
      flex: 1,
      paddingVertical: 14,
      alignItems: "center",
      borderBottomWidth: 3,
      borderBottomColor: "transparent",
    },
    tabBtnActive: { borderBottomColor: colors.primary },
    tabText: {
      fontSize: 14,
      fontWeight: "600" as const,
      color: colors.mutedForeground,
      fontFamily: "Inter_600SemiBold",
    },
    tabTextActive: { color: colors.primary },
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
    inputRow: { flexDirection: "row", gap: 10 },
    input: {
      flex: 1,
      backgroundColor: colors.background,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 13,
      fontSize: 15,
      color: colors.foreground,
      fontFamily: "Inter_400Regular",
    },
    saveBtn: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      width: 48,
      alignItems: "center",
      justifyContent: "center",
    },
    addEmpBtn: {
      backgroundColor: colors.primary,
      borderRadius: 14,
      paddingVertical: 14,
      flexDirection: "row",
      gap: 8,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 16,
    },
    addEmpBtnText: {
      color: "#fff",
      fontWeight: "700" as const,
      fontSize: 15,
      fontFamily: "Inter_700Bold",
    },
    listSection: {
      backgroundColor: colors.card,
      borderRadius: 20,
      marginHorizontal: 16,
      marginBottom: 12,
      overflow: "hidden",
      shadowColor: "#210706",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.07,
      shadowRadius: 10,
      elevation: 3,
    },
    listHeader: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 18,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    listHeaderText: {
      fontSize: 14,
      fontWeight: "700" as const,
      color: colors.foreground,
      flex: 1,
      fontFamily: "Inter_700Bold",
    },
    badge: {
      fontSize: 12,
      color: colors.secondary,
      backgroundColor: colors.muted,
      paddingHorizontal: 10,
      paddingVertical: 3,
      borderRadius: 20,
      fontFamily: "Inter_600SemiBold",
    },
    listItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 18,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      gap: 12,
    },
    listItemAvatar: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: colors.accent,
      alignItems: "center",
      justifyContent: "center",
    },
    listItemName: {
      fontSize: 14,
      color: colors.foreground,
      fontWeight: "600" as const,
      fontFamily: "Inter_600SemiBold",
    },
    listItemSub: {
      fontSize: 12,
      color: colors.mutedForeground,
      marginTop: 1,
      fontFamily: "Inter_400Regular",
    },
    areaChips: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginTop: 10,
    },
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 9,
      borderRadius: 22,
      borderWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: colors.background,
    },
    chipSel: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    chipText: {
      fontSize: 13,
      fontWeight: "600" as const,
      color: colors.secondary,
      fontFamily: "Inter_600SemiBold",
    },
    chipTextSel: { color: "#fff" },
    emptyBox: {
      padding: 28,
      alignItems: "center",
      gap: 6,
    },
    emptyText: {
      fontSize: 14,
      color: colors.mutedForeground,
      textAlign: "center",
      fontFamily: "Inter_400Regular",
    },
    bottomPad: { height: Platform.OS === "web" ? insets.bottom + 34 : 24 },
    noAreaText: {
      fontSize: 13,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      paddingTop: 4,
    },
  });

  const areasConConteo = areas.map((area) => ({
    ...area,
    count: empleados.filter((e) => e.areaId === area.id).length,
  }));

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Image
          source={require("@/assets/images/logo.png")}
          style={s.logo}
          contentFit="contain"
        />
        <Text style={s.headerTitle}>Gestion de Personal</Text>
      </View>

      <View style={s.tabRow}>
        <Pressable
          style={[s.tabBtn, tab === "areas" && s.tabBtnActive]}
          onPress={() => setTab("areas")}
        >
          <Text style={[s.tabText, tab === "areas" && s.tabTextActive]}>
            Areas ({areas.length})
          </Text>
        </Pressable>
        <Pressable
          style={[s.tabBtn, tab === "empleados" && s.tabBtnActive]}
          onPress={() => setTab("empleados")}
        >
          <Text style={[s.tabText, tab === "empleados" && s.tabTextActive]}>
            Empleados ({empleados.length})
          </Text>
        </Pressable>
      </View>

      <ScrollView style={s.scroll}>
        {tab === "areas" ? (
          <>
            <Text style={s.sectionLabel}>Nueva area</Text>
            <View style={s.card}>
              <Text style={s.fieldLabel}>Nombre del area</Text>
              <View style={s.inputRow}>
                <TextInput
                  style={s.input}
                  placeholder="Ej: Produccion, Ventas..."
                  placeholderTextColor={colors.mutedForeground}
                  value={nuevaArea}
                  onChangeText={setNuevaArea}
                  onSubmitEditing={handleAddArea}
                />
                <Pressable style={s.saveBtn} onPress={handleAddArea}>
                  <Feather name="check" size={20} color="#fff" />
                </Pressable>
              </View>
            </View>

            <Text style={s.sectionLabel}>Areas registradas</Text>
            <View style={s.listSection}>
              <View style={s.listHeader}>
                <Text style={s.listHeaderText}>Lista de areas</Text>
                <Text style={s.badge}>{areas.length}</Text>
              </View>
              {areasConConteo.length === 0 ? (
                <View style={s.emptyBox}>
                  <Feather name="grid" size={28} color={colors.border} />
                  <Text style={s.emptyText}>Aun no hay areas registradas</Text>
                </View>
              ) : (
                areasConConteo.map((area) => (
                  <View key={area.id} style={s.listItem}>
                    <View style={s.listItemAvatar}>
                      <Feather name="grid" size={16} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.listItemName}>{area.nombre}</Text>
                      <Text style={s.listItemSub}>
                        {area.count} empleado{area.count !== 1 ? "s" : ""}
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          </>
        ) : (
          <>
            <Text style={s.sectionLabel}>Nuevo empleado</Text>
            <View style={s.card}>
              <Text style={s.fieldLabel}>Nombre completo</Text>
              <TextInput
                style={[s.input, { marginBottom: 14 }]}
                placeholder="Nombre del empleado"
                placeholderTextColor={colors.mutedForeground}
                value={nuevoEmp}
                onChangeText={setNuevoEmp}
              />
              <Text style={s.fieldLabel}>Seleccionar area</Text>
              {areas.length === 0 ? (
                <Text style={s.noAreaText}>
                  Primero registra un area en la pestana "Areas"
                </Text>
              ) : (
                <View style={s.areaChips}>
                  {areas.map((area) => (
                    <Pressable
                      key={area.id}
                      style={[s.chip, areaSelId === area.id && s.chipSel]}
                      onPress={() => setAreaSelId(area.id)}
                    >
                      <Text style={[s.chipText, areaSelId === area.id && s.chipTextSel]}>
                        {area.nombre}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
              <Pressable style={s.addEmpBtn} onPress={handleAddEmpleado}>
                <Feather name="user-plus" size={18} color="#fff" />
                <Text style={s.addEmpBtnText}>Registrar Empleado</Text>
              </Pressable>
            </View>

            <Text style={s.sectionLabel}>Empleados registrados</Text>
            <View style={s.listSection}>
              <View style={s.listHeader}>
                <Text style={s.listHeaderText}>Lista de empleados</Text>
                <Text style={s.badge}>{empleados.length}</Text>
              </View>
              {empleados.length === 0 ? (
                <View style={s.emptyBox}>
                  <Feather name="users" size={28} color={colors.border} />
                  <Text style={s.emptyText}>Aun no hay empleados</Text>
                </View>
              ) : (
                empleados.map((emp) => {
                  const area = areas.find((a) => a.id === emp.areaId);
                  return (
                    <View key={emp.id} style={s.listItem}>
                      <View style={s.listItemAvatar}>
                        <Feather name="user" size={16} color={colors.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={s.listItemName}>{emp.nombre}</Text>
                        <Text style={s.listItemSub}>{area?.nombre ?? "Sin area"}</Text>
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          </>
        )}
        <View style={s.bottomPad} />
      </ScrollView>
    </View>
  );
}
