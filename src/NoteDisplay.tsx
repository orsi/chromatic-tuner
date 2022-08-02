import React from "react";
import { Text, View } from "react-native";
import { TAccidental } from "./App";

interface NoteDisplayProps {
  accidental: TAccidental;
  cents: number;
  note: string;
  octave: number;
}

export default ({ accidental, cents, note, octave }: NoteDisplayProps) => {
  return (
    <>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          marginLeft: -16,
        }}
      >
        <View
          style={{
            position: "relative",
            width: 96,
          }}
        >
          <Text style={{ fontSize: 96, textAlign: "center" }}>
            {note}
          </Text>
          <Text
            style={{
              fontSize: 36,
              fontWeight: "200",
              position: "absolute",
              top: 0,
              right: 0,
            }}
          >
            {accidental === "sharp" ? `♯` : accidental === "flat" ? `♭` : ``}
          </Text>
          <Text
            style={{
              fontSize: 24,
              fontWeight: "300",
              position: "absolute",
              bottom: 0,
              right: 0,
            }}
          >
            {octave}
          </Text>
        </View>
      </View>
      <View style={{ alignItems: "center" }}>
        <Text style={{ fontSize: 10 }}>
          cents
        </Text>
        <Text style={{ fontSize: 16 }}>
          {cents}
        </Text>
      </View>
    </>
  );
};
