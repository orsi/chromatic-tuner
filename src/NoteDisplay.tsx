import React from "react";
import { Text, View } from "react-native";
import AccuracySlide from "./AccuracySlide";
import { TAccidental } from "./pitch.service";

interface NoteDisplayProps {
  accidental: TAccidental;
  cents: number;
  note: string;
  octave: number;
}

export default ({ accidental, cents, note, octave }: NoteDisplayProps) => {
  return (
    <View>
      <View
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
        }}
      >
        <AccuracySlide cents={cents} />
      </View>
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: 32,
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
        <View style={{ alignItems: "center" }}>
          <Text style={{ fontSize: 10 }}>
            cents
          </Text>
          <Text style={{ fontSize: 16 }}>
            {cents}
          </Text>
        </View>
      </View>
    </View>
  );
};
