import React from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaView, StatusBar } from "react-native";
import Icon from "react-native-ico-dazzle-line";
import Note from "./screens/Notes";
import ToDo from "./screens/ToDo";

const Tab = createMaterialTopTabNavigator();

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1, paddingTop: StatusBar.currentHeight }}>
      <NavigationContainer>
        <Tab.Navigator
          initialRouteName="Notes"
          backBehavior="initialRoute"
          tabBarPosition="bottom"
          screenOptions={({ route }) => ({
            tabBarIcon: ({ color, size }) => {
              let iconName;

              if (route.name === "Notes") {
                iconName = "notes";
              } else if (route.name === "Tasks") {
                iconName = "clipboard-list";
              }

              return <Icon name={iconName} size={10} />;
            },
            tabBarActiveTintColor: "black",
            tabBarInactiveTintColor: "white",
            tabBarStyle: {
              backgroundColor: "white",
              height: 60,
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
              paddingBottom: 5,
            },
            tabBarLabelStyle: {
              fontSize: 10,
              fontWeight: "600",
              textAlign: "center",
              marginTop: 2,
            },
            tabBarShowIcon: true,
            tabBarIndicatorStyle: {
              backgroundColor: "black",  
              height: 2,
            },
          })}
        >
          <Tab.Screen name="Notes" component={Note} />
          <Tab.Screen name="Tasks" component={ToDo} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
}
