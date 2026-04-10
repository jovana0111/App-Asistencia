import { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useColors } from "../hooks/useColors";
import { parseDatetime } from "../utils/dateFormat";

interface DateTimeInputProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
}

export function DateTimeInput({ label, value, onChange }: DateTimeInputProps) {
  const colors = useColors();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [error, setError] = useState("");

  const handleOpen = () => {
    setDraft(value);
    setError("");
    setEditing(true);
  };

  const handleSave = () => {
    const d = parseDatetime(draft);
    if (!d) {
      setError("Formato: YYYY-MM-DD HH:MM");
      return;
    }
    onChange(draft);
    setEditing(false);
  };

  const s = StyleSheet.create({
    label: {
      fontSize: 11,
      fontWeight: "600" as const,
      color: colors.secondary,
      marginBottom: 6,
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    pill: {
      backgroundColor: colors.background,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    pillText: {
      fontSize: 13,
      color: colors.foreground,
      fontWeight: '600',
    },
    overlay: {
      flex: 1,
      backgroundColor: "rgba(33,7,6,0.45)",
      justifyContent: "center",
      alignItems: "center",
    },
    modal: {
      backgroundColor: colors.card,
      borderRadius: 22,
      padding: 26,
      width: 310,
    },
    modalTitle: {
      fontSize: 17,
      fontWeight: "700" as const,
      color: colors.foreground,
      marginBottom: 6,
    },
    hint: {
      fontSize: 12,
      color: colors.mutedForeground,
      marginBottom: 14,
    },
    input: {
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 13,
      fontSize: 16,
      color: colors.foreground,
      backgroundColor: colors.background,
      marginBottom: 8,
    },
    errorText: {
      fontSize: 12,
      color: colors.destructive,
      marginBottom: 8,
    },
    row: { flexDirection: "row", gap: 10, marginTop: 8 },
    btn: {
      flex: 1,
      paddingVertical: 13,
      borderRadius: 12,
      alignItems: "center",
    },
    btnSave: { backgroundColor: colors.primary },
    btnCancel: { backgroundColor: colors.muted },
    btnText: {
      fontWeight: "700" as const,
      fontSize: 14,
      color: "#fff",
    },
    btnCancelText: {
      fontWeight: "600" as const,
      fontSize: 14,
      color: colors.mutedForeground,
    },
  });

  return (
    <View style={{ marginBottom: 4 }}>
      <Text style={s.label}>{label}</Text>
      <Pressable style={s.pill} onPress={handleOpen}>
        <Text style={s.pillText}>{value || "YYYY-MM-DD HH:MM"}</Text>
      </Pressable>

      <Modal visible={editing} transparent animationType="fade">
        <View style={s.overlay}>
          <View style={s.modal}>
            <Text style={s.modalTitle}>Editar {label}</Text>
            <Text style={s.hint}>Formato: YYYY-MM-DD HH:MM</Text>
            <TextInput
              style={s.input}
              value={draft}
              onChangeText={setDraft}
              autoFocus
              placeholder="2026-04-09 08:00"
              placeholderTextColor={colors.mutedForeground}
              onSubmitEditing={handleSave}
            />
            {!!error && <Text style={s.errorText}>{error}</Text>}
            <View style={s.row}>
              <Pressable
                style={[s.btn, s.btnCancel]}
                onPress={() => setEditing(false)}
              >
                <Text style={s.btnCancelText}>Cancelar</Text>
              </Pressable>
              <Pressable style={[s.btn, s.btnSave]} onPress={handleSave}>
                <Text style={s.btnText}>Guardar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
