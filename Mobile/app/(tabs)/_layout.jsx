import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "@/constants/colors";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor:COLORS.primary,
        headerTitleStyle:{
            color:COLORS.textPrimary,
            fontWeight:"600"
        },
        headerShadowVisible:false,
        tabBarStyle:{
            backgroundColor:COLORS.cardBackground,
            borderWidth:1,
            borderTopColor:COLORS.border
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon:({color,size})=>(<Ionicons 
          name="home-outline"
          size={size} color={color}
          />)
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon:({color,size})=>(<Ionicons 
            name="compass"
            size={size} color={color}
            />)
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon:({color,size})=>(<Ionicons 
            name="person-outline"
            size={size} color={color}
            />)
        }}
      />
    </Tabs>
  );
}
