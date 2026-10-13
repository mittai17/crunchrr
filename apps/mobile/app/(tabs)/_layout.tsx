import { useWindowDimensions, useColorScheme } from "react-native";
import { Tabs } from "expo-router";
import {
  Home,
  CalendarDays,
  SquareCheck,
  Search,
  Menu,
} from "lucide-react-native";
export default function Layout() {
  const { width } = useWindowDimensions();
  const dark = useColorScheme() === "dark";
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#6d3df5",
        tabBarInactiveTintColor: "#64748b",
        tabBarPosition: width >= 768 ? "left" : "bottom",
        tabBarStyle: {
          height: width >= 768 ? undefined : 80,
          paddingBottom: 20,
          paddingTop: 7,
          backgroundColor: dark ? "#111827" : "#fff",
        },
        headerTitleStyle: {
          fontSize: 24,
          fontWeight: "700",
          color: dark ? "#f1f5f9" : "#111827",
        },
        headerStyle: { backgroundColor: dark ? "#080b14" : "#f6f7fb" },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "crunchrr",
          tabBarLabel: "Home",
          tabBarIcon: ({ color }) => <Home color={color} size={23} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: "Calendar",
          tabBarIcon: ({ color }) => <CalendarDays color={color} size={23} />,
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: "Tasks",
          tabBarIcon: ({ color }) => <SquareCheck color={color} size={23} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color }) => <Search color={color} size={23} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: "More",
          tabBarIcon: ({ color }) => <Menu color={color} size={23} />,
        }}
      />
    </Tabs>
  );
}
