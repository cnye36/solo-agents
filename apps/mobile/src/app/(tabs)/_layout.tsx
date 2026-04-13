import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { AppDataProvider } from "@/providers/app-data-provider";
import { colors } from "@/constants/theme";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

function TabIcon({
  name,
  color,
  size,
}: {
  name: IoniconName;
  color: string;
  size: number;
}) {
  return <Ionicons name={name} size={size} color={color} />;
}

export default function TabsLayout() {
  return (
    <AppDataProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            borderTopWidth: 1,
            height: Platform.OS === "ios" ? 82 : 64,
            paddingTop: 8,
            paddingBottom: Platform.OS === "ios" ? 24 : 10,
          },
          tabBarActiveTintColor: colors.text,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: "600",
          },
        }}
      >
        <Tabs.Screen
          name="chat"
          options={{
            title: "Chat",
            tabBarIcon: ({ color, size, focused }) => (
              <TabIcon
                name={focused ? "chatbubble-ellipses" : "chatbubble-ellipses-outline"}
                color={color}
                size={size}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="tools"
          options={{
            title: "Tools",
            tabBarIcon: ({ color, size, focused }) => (
              <TabIcon
                name={focused ? "apps" : "apps-outline"}
                color={color}
                size={size}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="knowledge"
          options={{
            title: "Knowledge",
            tabBarIcon: ({ color, size, focused }) => (
              <TabIcon
                name={focused ? "library" : "library-outline"}
                color={color}
                size={size}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="more"
          options={{
            title: "More",
            tabBarIcon: ({ color, size, focused }) => (
              <TabIcon
                name={focused ? "grid" : "grid-outline"}
                color={color}
                size={size}
              />
            ),
          }}
        />
      </Tabs>
    </AppDataProvider>
  );
}
