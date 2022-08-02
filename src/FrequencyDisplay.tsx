import React from "react";
import { Text, View } from "react-native";

interface FrequencyDisplayProps {
  frequency?: number | null;
}

export default ({ frequency }: FrequencyDisplayProps) => {
  return (
    <View style={{ alignItems: "center" }}>
      <Text
        style={{ fontSize: 12, fontWeight: "bold" }}
      >
        DETECTED FREQUENCY
      </Text>
      <Text
        style={{ fontSize: 16, fontWeight: "300", marginTop: 4 }}
      >
        {frequency ? `${frequency}Hz` : `Waiting...`}
      </Text>
    </View>
  );
};
