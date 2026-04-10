import { Trash2, Trash, Clipboard, Download, Clock } from "lucide-react";
import { useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
} from "react-native";
import logo from "../../assets/images/logo.png";

import { RegistroAsistencia, useApp } from "../context/AppContext";
import { useColors } from "../hooks/useColors";

function toOdooDatetime(dt: string): string {
  const match = dt.match(/^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2})$/);
  if (match) return `${match[1]} ${match[2]}:00`;
  return dt;
}

function registrosToCSV(registros: RegistroAsistencia[]): string {
  // Excel trick to specify the separator
  const header = "sep=;\nArea;Empleado;Entrada;Salida\n";
  const rows = registros
    .map(
      (r) =>
        `"${r.areaNombre}";"${r.empleadoNombre}";"${toOdooDatetime(r.entrada)}";"${toOdooDatetime(r.salida)}"`
    )
    .join("\n");
  return header + rows;
}

export default function ListaScreen() {
  const colors = useColors();
  const { registros, deleteRegistro, clearRegistros } = useApp();
  const [filtro, setFiltro] = useState<string | null>(null);

  const areasUnicas = Array.from(new Set(registros.map((r) => r.areaNombre)));
  const registrosFiltrados =
    filtro ? registros.filter((r) => r.areaNombre === filtro) : registros;

  const handleExportar = () => {
    if (registros.length === 0) {
      Alert.alert("Sin datos", "No hay registros para exportar");
      return;
    }
    const csv = registrosToCSV(registros);
    const fileName = `asistencia_${new Date().toISOString().slice(0, 10)}.csv`;

    try {
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
    } catch (e) {
      Alert.alert("Error", "No se pudo exportar el archivo");
    }
  };

  const handleDelete = (id: string, nombre: string) => {
    if (confirm(`¿Eliminar el registro de ${nombre}?`)) {
      deleteRegistro(id);
    }
  };

  const handleClear = () => {
    if (confirm("¿Limpiar lista? Esto eliminará todos los registros.")) {
      clearRegistros();
    }
  };

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
    headerInfo: { flex: 1 },
    headerTitle: {
      fontSize: 18,
      fontWeight: "700" as const,
      color: colors.headerFg,
      letterSpacing: -0.3,
    },
    headerCount: {
      fontSize: 11,
      color: "rgba(241,230,210,0.65)",
      marginTop: 1,
    },
    trashBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
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
      paddingHorizontal: 14,
      paddingVertical: 8,
    },
    chip: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 18,
      backgroundColor: colors.background,
      borderWidth: 1.2,
      borderColor: colors.border,
      marginRight: 6,
    },
    chipSel: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    chipText: {
      fontSize: 12,
      fontWeight: "600" as const,
      color: colors.secondary,
    },
    chipTextSel: { color: "#fff" },
    list: { flex: 1 },
    row: {
      backgroundColor: colors.card,
      marginHorizontal: 16,
      marginTop: 8,
      borderRadius: 16,
      padding: 14,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    rowTop: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
      gap: 6,
    },
    areaTag: {
      backgroundColor: colors.primary,
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    areaTagText: {
      fontSize: 10,
      fontWeight: "700" as const,
      color: "#fff",
      letterSpacing: 0.4,
    },
    nombre: {
      fontSize: 14,
      fontWeight: "600" as const,
      color: colors.foreground,
      flex: 1,
    },
    turnoRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      marginBottom: 8,
    },
    turnoText: {
      fontSize: 11,
      color: colors.secondary,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginBottom: 8,
    },
    horario: { flexDirection: "row", gap: 6 },
    horarioItem: {
      flex: 1,
      backgroundColor: colors.background,
      borderRadius: 8,
      padding: 8,
    },
    horarioLabel: {
      fontSize: 9,
      fontWeight: "700" as const,
      color: colors.secondary,
      textTransform: "uppercase",
      letterSpacing: 0.7,
    },
    horarioValue: {
      fontSize: 12,
      fontWeight: "600" as const,
      color: colors.foreground,
      marginTop: 2,
    },
    deleteBtn: { padding: 4 },
    emptyContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingTop: 60,
      gap: 10,
    },
    emptyIcon: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: colors.card,
      alignItems: "center",
      justifyContent: "center",
    },
    emptyTitle: {
      fontSize: 16,
      fontWeight: "700" as const,
      color: colors.foreground,
    },
    emptySub: {
      fontSize: 13,
      color: colors.mutedForeground,
      textAlign: "center",
      paddingHorizontal: 30,
    },
    exportBtn: {
      backgroundColor: colors.secondary,
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "center",
      gap: 8,
      marginHorizontal: 16,
      marginTop: 8,
      marginBottom: 20,
    },
    exportBtnText: {
      fontSize: 14,
      fontWeight: "700" as const,
      color: "#fff",
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
          <Trash2 size={14} color={colors.destructive} />
        </Pressable>
      </View>
      <View style={s.turnoRow}>
        <Clock size={11} color={colors.secondary} />
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
          source={logo as any}
          style={s.logo}
          resizeMode="contain"
        />
        <View style={s.headerInfo}>
          <Text style={s.headerTitle}>Lista de Asistencia</Text>
          <Text style={s.headerCount}>
            {registros.length} registro{registros.length !== 1 ? "s" : ""}
          </Text>
        </View>
        {registros.length > 0 && (
          <Pressable style={s.trashBtn} onPress={handleClear}>
            <Trash size={16} color={colors.headerFg} />
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
        keyExtractor={(item: RegistroAsistencia) => item.id}
        renderItem={renderRow}
        scrollEnabled={registrosFiltrados.length > 0}
        ListEmptyComponent={
          <View style={s.emptyContainer}>
            <View style={s.emptyIcon}>
              <Clipboard size={24} color={colors.mutedForeground} />
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
        style={({ pressed }: { pressed: boolean }) => [
          s.exportBtn,
          pressed && { opacity: 0.85 },
        ]}
          onPress={handleExportar}
        >
          <Download size={18} color="#fff" />
          <Text style={s.exportBtnText}>Exportar CSV / Excel</Text>
        </Pressable>
      )}
    </View>
  );
}
