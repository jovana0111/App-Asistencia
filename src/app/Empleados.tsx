import { Check, Edit2, Grid, Trash2, User, UserPlus, Users, RefreshCw } from "lucide-react";
import { useState } from "react";
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
import logo from "../../assets/images/logo.png";

import { useApp, Empleado } from "../context/AppContext";
import { useColors } from "../hooks/useColors";

export default function EmpleadosScreen() {
  const colors = useColors();

  const { 
    areas, 
    empleados, 
    addArea, 
    addEmpleado, 
    updateEmpleado, 
    deleteEmpleado, 
    refreshOdooEmployees,
    loading,
    odooError 
  } = useApp();


  const [nuevaArea, setNuevaArea] = useState("");
  const [nuevoEmp, setNuevoEmp] = useState("");
  const [areaSelId, setAreaSelId] = useState<string>("");
  const [tab, setTab] = useState<"areas" | "empleados">("areas");
  const [editingEmpId, setEditingEmpId] = useState<string | null>(null);

  const handleAddArea = () => {
    if (!nuevaArea.trim()) {
      Alert.alert("Error", "Ingresa el nombre del area");
      return;
    }
    addArea(nuevaArea);
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
    
    if (editingEmpId) {
      updateEmpleado(editingEmpId, nuevoEmp, areaSelId);
      setEditingEmpId(null);
    } else {
      addEmpleado(nuevoEmp, areaSelId);
    }
    
    setNuevoEmp("");
  };

  const handleEdit = (emp: Empleado) => {
    setEditingEmpId(emp.id);
    setNuevoEmp(emp.nombre);
    setAreaSelId(emp.areaId);
    setTab("empleados");
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      "Eliminar Empleado",
      "¿Estas seguro de eliminar este empleado?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", style: "destructive", onPress: () => deleteEmpleado(id) }
      ]
    );
  };

  const cancelEdit = () => {
    setEditingEmpId(null);
    setNuevoEmp("");
    setAreaSelId("");
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
    headerTitle: {
      fontSize: 18,
      fontWeight: "700" as const,
      color: colors.headerFg,
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
      paddingVertical: 12,
      alignItems: "center",
      borderBottomWidth: 3,
      borderBottomColor: "transparent",
    },
    tabBtnActive: { borderBottomColor: colors.primary },
    tabText: {
      fontSize: 13,
      fontWeight: "600" as const,
      color: colors.mutedForeground,
    },
    tabTextActive: { color: colors.primary },
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
    inputRow: { flexDirection: "row", gap: 8 },
    input: {
      flex: 1,
      backgroundColor: colors.background,
      borderWidth: 1.2,
      borderColor: colors.border,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 14,
      color: colors.foreground,
    },
    saveBtn: {
      backgroundColor: colors.primary,
      borderRadius: 10,
      width: 44,
      alignItems: "center",
      justifyContent: "center",
    },
    addEmpBtn: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingVertical: 12,
      flexDirection: "row",
      gap: 6,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 14,
    },
    addEmpBtnText: {
      color: "#fff",
      fontWeight: "700" as const,
      fontSize: 14,
    },
    listSection: {
      backgroundColor: colors.card,
      borderRadius: 16,
      marginHorizontal: 16,
      marginBottom: 10,
      overflow: "hidden",
    },
    listHeader: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    listHeaderText: {
      fontSize: 13,
      fontWeight: "700" as const,
      color: colors.foreground,
      flex: 1,
    },
    badge: {
      fontSize: 11,
      color: colors.secondary,
      backgroundColor: colors.muted,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 16,
    },
    listItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      gap: 10,
    },
    listItemAvatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.accent,
      alignItems: "center",
      justifyContent: "center",
    },
    listItemName: {
      fontSize: 13,
      color: colors.foreground,
      fontWeight: "600" as const,
    },
    listItemSub: {
      fontSize: 11,
      color: colors.mutedForeground,
      marginTop: 1,
    },
    areaChips: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
      marginTop: 8,
    },
    chip: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1.2,
      borderColor: colors.border,
      backgroundColor: colors.background,
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
    emptyBox: {
      padding: 24,
      alignItems: "center",
      gap: 5,
    },
    emptyText: {
      fontSize: 13,
      color: colors.mutedForeground,
      textAlign: "center",
    },
    bottomPad: { height: 60 },
    noAreaText: {
      fontSize: 12,
      color: colors.mutedForeground,
      paddingTop: 3,
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
          source={logo as any}
          style={s.logo}
          resizeMode="contain"
        />
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>Gestion de Personal</Text>
        </View>
        <Pressable 
          style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1, padding: 8 }]} 
          onPress={refreshOdooEmployees}
          disabled={loading}
        >
          <RefreshCw size={20} color={colors.headerFg} style={loading ? { opacity: 0.5 } : {}} />
        </Pressable>
      </View>

      {odooError && (
        <View style={{ backgroundColor: '#FEE2E2', padding: 10, borderBottomWidth: 1, borderBottomColor: '#EF4444' }}>
          <Text style={{ fontSize: 12, color: '#B91C1C', textAlign: 'center' }}>{odooError}</Text>
        </View>
      )}

      {loading && (
        <View style={{ backgroundColor: '#DBEAFE', padding: 10, borderBottomWidth: 1, borderBottomColor: '#3B82F6' }}>
          <Text style={{ fontSize: 12, color: '#1E40AF', textAlign: 'center' }}>Sincronizando con Odoo...</Text>
        </View>
      )}

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
                  <Check size={18} color="#fff" />
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
                  <Grid size={24} color={colors.border} />
                  <Text style={s.emptyText}>Aun no hay areas registradas</Text>
                </View>
              ) : (
                areasConConteo.map((area) => (
                  <View key={area.id} style={s.listItem}>
                    <View style={s.listItemAvatar}>
                      <Grid size={14} color={colors.primary} />
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
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginRight: 16 }}>
              <Text style={s.sectionLabel}>{editingEmpId ? "Editar empleado" : "Nuevo empleado"}</Text>
              {editingEmpId && (
                <Pressable onPress={cancelEdit} style={{ marginTop: 8 }}>
                  <Text style={{ fontSize: 11, color: colors.destructive, fontWeight: '700' }}>CANCELAR EDICION</Text>
                </Pressable>
              )}
            </View>
            <View style={s.card}>
              <Text style={s.fieldLabel}>Nombre completo</Text>
              <TextInput
                style={[s.input, { marginBottom: 12 }]}
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
              <Pressable style={[s.addEmpBtn, editingEmpId ? { backgroundColor: colors.secondary } : null]} onPress={handleAddEmpleado}>
                {editingEmpId ? <Check size={16} color="#fff" /> : <UserPlus size={16} color="#fff" />}
                <Text style={s.addEmpBtnText}>{editingEmpId ? "Guardar Cambios" : "Registrar Empleado"}</Text>
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
                  <Users size={24} color={colors.border} />
                  <Text style={s.emptyText}>Aun no hay empleados</Text>
                </View>
              ) : (
                empleados.map((emp) => {
                  const area = areas.find((a) => a.id === emp.areaId);
                  return (
                    <View key={emp.id} style={s.listItem}>
                      <View style={s.listItemAvatar}>
                        <User size={14} color={colors.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={s.listItemName}>{emp.nombre}</Text>
                        <Text style={s.listItemSub}>{area?.nombre ?? "Sin area"}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', gap: 10 }}>
                        <Pressable onPress={() => handleEdit(emp)}>
                          <Edit2 size={16} color={colors.mutedForeground} />
                        </Pressable>
                        <Pressable onPress={() => handleDelete(emp.id)}>
                          <Trash2 size={16} color={colors.destructive} />
                        </Pressable>
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
