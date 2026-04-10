import { Feather } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import * as Sharing from "expo-sharing";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { RegistroAsistencia, useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

function toOdooDatetime(dt: string): string {
  const match = dt.match(/^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2})$/);
  if (match) return `${match[1]} ${match[2]}:00`;
  return dt;
}

function registrosToCSV(registros: RegistroAsistencia[]): string {
  const header = "Area,Empleado,Entrada,Salida\n";
  const rows = registros
    .map(
      (r) =>
        `"${r.areaNombre}","${r.empleadoNombre}","${toOdooDatetime(r.entrada)}","${toOdooDatetime(r.salida)}"`
    )
    .join("\n");
  return header + rows;
}

export default function ListaScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { registros, deleteRegistro, clearRegistros } = useApp();
  const [filtro, setFiltro] = useState<string | null>(null);

  const areasUnicas = Array.from(new Set(registros.map((r) => r.areaNombre)));
  const registrosFiltrados =
    filtro ? registros.filter((r) => r.areaNombre === filtro) : registros;

  const handleExportar = async () => {
    if (registros.length === 0) {
      Alert.alert("Sin datos", "No hay registros para exportar");
      return;
    }
    const csv = registrosToCSV(registros);
    const fileName = `asistencia_${new Date().toISOString().slice(0, 10)}.csv`;

    try {
      if (Platform.OS === "web") {
        const BOM = "\uFEFF";
        const blob = new Blob([BOM + csv], {
          type: "text/csv;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        const fileUri = (FileSystem.documentDirectory ?? "") + fileName;
        await FileSystem.writeAsStringAsync(fileUri, csv, {
          encoding: FileSystem.EncodingType.UTF8,
        });
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(fileUri, {
            mimeType: "text/csv",
            dialogTitle: "Exportar Asistencia",
            UTI: "public.comma-separated-values-text",
          });
        }
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (e) {
      Alert.alert("Error", "No se pudo exportar el archivo");
    }
  };

  const handleDelete = (id: string, nombre: string) => {
    Alert.alert("Eliminar", `Eliminar el registro de ${nombre}?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: () => {
          deleteRegistro(id);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        },
      },
    ]);
  };

  const handleClear = () => {
    Alert.alert(
      "Limpiar lista",
      "Esto eliminara todos los registros. Exporta antes si es necesario.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Limpiar todo",
          style: "destructive",
          onPress: () => {
            clearRegistros();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          },
        },
      ]
    );
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
    headerInfo: { flex: 1 },
    headerTitle: {
      fontSize: 20,
      fontWeight: "700" as const,
      color: colors.headerFg,
      fontFamily: "Inter_700Bold",
      letterSpacing: -0.3,
    },
    headerCount: {
      fontSize: 12,
      color: "rgba(241,230,210,0.65)",
      marginTop: 1,
      fontFamily: "Inter_400Regular",
    },
    trashBtn: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: "rgba(241,230,210,0.15)",
      alignItems: "center",
      justifyContent: "center",
    },
    filterBar: {
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    filterScroll: {
      paddingHorizontal: 16,
      paddingVertical: 10,
    },
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: 22,
      backgroundColor: colors.background,
      borderWidth: 1.5,
      borderColor: colors.border,
      marginRight: 8,
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
    list: { flex: 1 },
    row: {
      backgroundColor: colors.card,
      marginHorizontal: 16,
      marginTop: 10,
      borderRadius: 18,
      padding: 16,
      shadowColor: "#210706",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 6,
      elevation: 2,
    },
    rowTop: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 10,
      gap: 8,
    },
    areaTag: {
      backgroundColor: colors.primary,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    areaTagText: {
      fontSize: 11,
      fontWeight: "700" as const,
      color: "#fff",
      fontFamily: "Inter_700Bold",
      letterSpacing: 0.5,
    },
    nombre: {
      fontSize: 15,
      fontWeight: "600" as const,
      color: colors.foreground,
      flex: 1,
      fontFamily: "Inter_600SemiBold",
    },
    turnoRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginBottom: 10,
    },
    turnoText: {
      fontSize: 12,
      color: colors.secondary,
      fontFamily: "Inter_500Medium",
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginBottom: 10,
    },
    horario: { flexDirection: "row", gap: 8 },
    horarioItem: {
      flex: 1,
      backgroundColor: colors.background,
      borderRadius: 10,
      padding: 10,
    },
    horarioLabel: {
      fontSize: 10,
      fontWeight: "700" as const,
      color: colors.secondary,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      fontFamily: "Inter_700Bold",
    },
    horarioValue: {
      fontSize: 13,
      fontWeight: "600" as const,
      color: colors.foreground,
      marginTop: 3,
      fontFamily: "Inter_600SemiBold",
    },
    deleteBtn: { padding: 6 },
    emptyContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingTop: 80,
      gap: 12,
    },
    emptyIcon: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: colors.card,
      alignItems: "center",
      justifyContent: "center",
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: "700" as const,
      color: colors.foreground,
      fontFamily: "Inter_700Bold",
    },
    emptySub: {
      fontSize: 14,
      color: colors.mutedForeground,
      textAlign: "center",
      paddingHorizontal: 40,
      fontFamily: "Inter_400Regular",
    },
    exportBtn: {
      backgroundColor: colors.secondary,
      borderRadius: 16,
      paddingVertical: 17,
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "center",
      gap: 10,
      marginHorizontal: 16,
      marginTop: 10,
      marginBottom: Platform.OS === "web" ? 84 + 16 : 49 + insets.bottom + 16,
      shadowColor: colors.secondary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 10,
      elevation: 4,
    },
    exportBtnText: {
      fontSize: 15,
      fontWeight: "700" as const,
      color: "#fff",
      fontFamily: "Inter_700Bold",
    },
  });

  const renderRow = ({ item }: { item: RegistroAsistencia }) => (
    <View style={s.row}>
      <View style={s.rowTop}>
        {item.areaNombre ? (
          <View style={s.areaTag}>
            <Text style={s.areaTagText}>{item.areaNombre}</Text>
          </View>
        ) : null}
        <Text style={s.nombre} numberOfLines={1}>
          {item.empleadoNombre}
        </Text>
        <Pressable
          style={s.deleteBtn}
          onPress={() => handleDelete(item.id, item.empleadoNombre)}
        >
          <Feather name="trash-2" size={15} color={colors.destructive} />
        </Pressable>
      </View>
      <View style={s.turnoRow}>
        <Feather name="clock" size={12} color={colors.secondary} />
        <Text style={s.turnoText}>{item.turno}</Text>
      </View>
      <View style={s.divider} />
      <View style={s.horario}>
        <View style={s.horarioItem}>
          <Text style={s.horarioLabel}>Entrada</Text>
          <Text style={s.horarioValue}>{item.entrada}</Text>
        </View>
        <View style={s.horarioItem}>
          <Text style={s.horarioLabel}>Salida</Text>
          <Text style={s.horarioValue}>{item.salida}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Image
          source={require("@/assets/images/logo.png")}
          style={s.logo}
          contentFit="contain"
        />
        <View style={s.headerInfo}>
          <Text style={s.headerTitle}>Lista de Asistencia</Text>
          <Text style={s.headerCount}>
            {registros.length} registro{registros.length !== 1 ? "s" : ""}
          </Text>
        </View>
        {registros.length > 0 && (
          <Pressable style={s.trashBtn} onPress={handleClear}>
            <Feather name="trash" size={17} color={colors.headerFg} />
          </Pressable>
        )}
      </View>

      {areasUnicas.length > 1 && (
        <View style={s.filterBar}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.filterScroll}
          >
            <Pressable
              style={[s.chip, !filtro && s.chipSel]}
              onPress={() => setFiltro(null)}
            >
              <Text style={[s.chipText, !filtro && s.chipTextSel]}>Todos</Text>
            </Pressable>
            {areasUnicas.map((area) => (
              <Pressable
                key={area}
                style={[s.chip, filtro === area && s.chipSel]}
                onPress={() => setFiltro(filtro === area ? null : area)}
              >
                <Text style={[s.chipText, filtro === area && s.chipTextSel]}>
                  {area}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}

      <FlatList
        style={s.list}
        data={registrosFiltrados}
        keyExtractor={(item) => item.id}
        renderItem={renderRow}
        scrollEnabled={registrosFiltrados.length > 0}
        ListEmptyComponent={
          <View style={s.emptyContainer}>
            <View style={s.emptyIcon}>
              <Feather name="clipboard" size={30} color={colors.mutedForeground} />
            </View>
            <Text style={s.emptyTitle}>Sin registros</Text>
            <Text style={s.emptySub}>
              Agrega empleados desde la pantalla de Registro
            </Text>
          </View>
        }
        ListFooterComponent={<View style={{ height: 10 }} />}
      />

      {registros.length > 0 && (
        <Pressable
          style={({ pressed }) => [
            s.exportBtn,
            pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
          ]}
          onPress={handleExportar}
        >
          <Feather name="download" size={19} color="#fff" />
          <Text style={s.exportBtnText}>Exportar CSV / Excel</Text>
        </Pressable>
      )}
    </View>
  );
}
