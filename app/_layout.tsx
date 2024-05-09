import React from "react";
import { Stack } from "expo-router";

const AppLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="(dokter)" />
      <Stack.Screen name="(paramedis)" />
      <Stack.Screen name="AHMS" />
      <Stack.Screen name="Register" />
      <Stack.Screen name="Login" />
    </Stack>
  );
};

export default AppLayout;
