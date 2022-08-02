import { frequencies } from "./frequencies.json";
import React, { useEffect, useState } from "react";
import { SafeAreaView, View } from "react-native";
import Recording from "react-native-recording";
import pitchfinder from "pitchfinder";
import FrequencyDisplay from "./FrequencyDisplay";
import NoteDisplay from "./NoteDisplay";
import AccuracySlide from "./AccuracySlide";

const SAMPLE_RATE = 22050;
const BUFFER_SIZE = 2048;

export type TAccidental = "natural" | "sharp" | "flat";
interface IPitchedNote {
  accidental: TAccidental;
  accuracy: number;
  cents: number;
  note: string;
  octave: number;
  frequency: number;
}

const App = () => {
  const [pitchedNote, setPitchedNote] = useState<IPitchedNote>({
    accidental: "natural",
    accuracy: 1,
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
      const frequencyNote = getNote(roundedFrequency);
      if (frequencyNote) {
        setPitchedNote(frequencyNote);
      }
    }
  };

  // test function
  const onTestRecordingData = () => {
    const sine = Math.sin(Date.now() / 100000);
    const frequency = Math.round(((sine + 1) / 2) * 5000);
    setDetectedFrequency(
      frequency < 20 || frequency > 19000 ? null : frequency,
    );

    if (frequency) {
      const frequencyNote = getNote(frequency);
      if (frequencyNote) {
        setPitchedNote(frequencyNote);
      }
    }
  };

  const getNote = (frequency: number): IPitchedNote => {
    if (frequency > frequencies[frequencies.length - 1].frequency + 100) {
      return {
        accidental: "natural",
        accuracy: 1,
        cents: 0,
        frequency: 0,
        note: `\\`,
        octave: 8,
      };
    }

    let lowNote = frequencies[0];
    let highNote = frequencies[1];
    if (
      frequency > lowNote.frequency &&
      frequency < highNote.frequency
    ) {
      // noop
      // seems we hit the lowest note
    } else {
      for (let i = 2; i < frequencies.length; i++) {
        const currentItem = frequencies[i];
        lowNote = highNote;
        highNote = currentItem;
        if (currentItem.frequency > frequency) {
          break;
        }
      }
    }

    // calculate closest note and distance
    const distance = (frequency - lowNote.frequency) /
      (highNote.frequency - lowNote.frequency);
    const closestNote = distance < .5 ? lowNote : highNote;
    const cents = Math.round((.5 - distance) * 100);
    const accuracy = 1 - (Math.abs(cents) / 50);

    return {
      accidental: closestNote.accidental as TAccidental,
      accuracy: accuracy,
      cents: cents,
      frequency: closestNote.frequency,
      note: closestNote.note,
      octave: closestNote.octave,
    };
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
          accuracy={pitchedNote.accuracy}
          cents={pitchedNote.cents}
        />
      </View>
    </SafeAreaView>
  );
};

export default App;
