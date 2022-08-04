import React, { useEffect, useState } from "react";
import { SafeAreaView, View } from "react-native";
import Recording from "react-native-recording";
import pitchfinder from "pitchfinder";
import { getPitchedNote, IPitchedNote } from "./pitch.service";
import FrequencyDisplay from "./FrequencyDisplay";
import NoteDisplay from "./NoteDisplay";
import AccuracySlide from "./AccuracySlide";

const SAMPLE_RATE = 22050;
const BUFFER_SIZE = 2048;

const App = () => {
  const [pitchedNote, setPitchedNote] = useState<IPitchedNote>({
    accidental: "natural",
    cents: 0,
    frequency: 440,
    note: "A",
    octave: 4,
  });
  const [detectedFrequency, setDetectedFrequency] = useState<number | null>();

  // frequency pitch detection
  const detectPitch = pitchfinder.YIN({ sampleRate: SAMPLE_RATE });
  const onRecordingData = (data: Float32Array) => {
    const frequency = detectPitch(data);
    const roundedFrequency = frequency !== null ? Math.round(frequency) : null;
    setDetectedFrequency(
      roundedFrequency,
    );

    if (roundedFrequency) {
      const frequencyNote = getPitchedNote(roundedFrequency);
      if (frequencyNote) {
        setPitchedNote(frequencyNote);
      }
    }
  };

  // test function
  const onTestRecordingData = () => {
    const sine = Math.sin(Date.now() / 100000);
    const frequency = Math.round(((sine + 1) / 2) * 5000) + 20;
    setDetectedFrequency(
      frequency < 20 || frequency > 19000 ? null : frequency,
    );

    if (frequency) {
      const frequencyNote = getPitchedNote(frequency);
      if (frequencyNote) {
        setPitchedNote(frequencyNote);
      }
    }
  };

  // effects
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      const intervalId = setInterval(onTestRecordingData, 100);
      return () => {
        clearInterval(intervalId);
      };
    } else {
      // setup and start Recording
      Recording.init({
        bufferSize: BUFFER_SIZE,
        sampleRate: SAMPLE_RATE,
      });
      Recording.start();
      Recording.addRecordingEventListener(onRecordingData);
    }
  }, []);

  return (
    <SafeAreaView
      style={{
        alignItems: "center",
        backgroundColor: "white",
        paddingHorizontal: 20,
        width: "100%",
        height: "100%",
      }}
    >
      <View style={{ flex: 1, justifyContent: "flex-start" }}>
        <FrequencyDisplay frequency={detectedFrequency} />
      </View>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          width: "100%",
        }}
      >
        <NoteDisplay
          accidental={pitchedNote.accidental}
          cents={pitchedNote.cents}
          note={pitchedNote.note}
          octave={pitchedNote.octave}
        />
      </View>
      <View
        style={{
          flex: 1,
          justifyContent: "flex-start",
          alignItems: "center",
          marginTop: 64,
          width: "100%",
        }}
      >
        <AccuracySlide
          cents={pitchedNote.cents}
        />
      </View>
    </SafeAreaView>
  );
};

export default App;
