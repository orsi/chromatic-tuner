import React from "react";
import { Text, View } from "react-native";
import AccuracySlide from "./AccuracySlide";
import { IPitchedNote, TAccidental } from "./pitch.service";

interface NoteDisplayProps {
  currentNote?: IPitchedNote | null;
}

export default ({ currentNote }: NoteDisplayProps) => {
  return (
    <View>
      <View
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
        }}
      >
        <AccuracySlide cents={currentNote?.cents} />
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
          }}
        >
          <Text style={{ fontSize: 96, textAlign: "center" }}>
            {currentNote?.note ?? " "}
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
            {currentNote?.accidental === "sharp"
              ? `♯`
              : currentNote?.accidental === "flat"
              ? `♭`
              : ` `}
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
            {currentNote?.octave ?? " "}
          </Text>
        </View>
        <View style={{ alignItems: "center" }}>
          <Text style={{ fontSize: 10 }}>
            {currentNote?.cents ? "cents" : " "}
          </Text>
          <Text style={{ fontSize: 16 }}>
            {currentNote?.cents ?? " "}
          </Text>
        </View>
      </View>
    </View>
  );
};
