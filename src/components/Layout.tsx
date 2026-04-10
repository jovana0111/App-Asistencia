import { View, StyleSheet, Pressable, Text } from "react-native";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Clock, Users, List as ListIcon } from "lucide-react";
import { useColors } from "../hooks/useColors";

export default function Layout() {
  const colors = useColors();
  const navigate = useNavigate();
  const location = useLocation();
  const s = styles(colors);

  const tabs = [
    { name: "Registro", path: "/registro", icon: Clock },
    { name: "Empleados", path: "/empleados", icon: Users },
    { name: "Lista", path: "/lista", icon: ListIcon },
  ];

  return (
    <View style={s.container}>
      <View style={s.mainWrapper}>
        <View style={s.content}>
          <Outlet />
        </View>
        <View style={s.tabBar}>
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.path;
            return (
              <Pressable
                key={tab.path}
                style={s.tabItem}
                onPress={() => navigate(tab.path)}
              >
              <tab.icon
                  size={20}
                  color={isActive ? colors.primary : colors.mutedForeground}
                />
                <Text
                  style={[
                    s.tabText,
                    { color: isActive ? colors.primary : colors.mutedForeground },
                  ]}
                >
                  {tab.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#210706", // Dark background for the desert effect outside the phone
  },
  mainWrapper: {
    flex: 1,
    width: "100%",
    maxWidth: 500,
    alignSelf: "center",
    backgroundColor: colors.background,
    boxShadow: "0 0 20px rgba(0,0,0,0.3)", // Web shadow
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: "row",
    height: 64,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 6,
  },
  tabText: {
    fontSize: 10,
    marginTop: 3,
    fontWeight: "600",
  },
});

