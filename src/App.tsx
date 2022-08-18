import React, { useEffect, useState } from "react";
import {
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  Text,
  View,
} from "react-native";
import Recording from "react-native-recording";
import pitchfinder from "pitchfinder";
import { getPitchedNote, IPitchedNote } from "./pitch.service";
import NoteDisplay from "./NoteDisplay";

const SAMPLE_RATE = 22050;
const BUFFER_SIZE = 2048;

const getAndroidPermissions = async () => {
  await PermissionsAndroid.requestMultiple([
    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
  ]);
};

const App = () => {
  const [pitchedNote, setPitchedNote] = useState<IPitchedNote | null>();
  const [detectedFrequency, setDetectedFrequency] = useState<number | null>();

  // frequency pitch detection
  const detectPitch = pitchfinder.YIN({ sampleRate: SAMPLE_RATE });
  const onRecordingData = (data: Float32Array) => {
    const frequency = detectPitch(data);
    const roundedFrequency = frequency != null ? Math.round(frequency) : null;
    setDetectedFrequency(
      roundedFrequency,
    );

    if (roundedFrequency) {
      const frequencyNote = getPitchedNote(roundedFrequency);
      if (frequencyNote) {
        setPitchedNote(frequencyNote);
      }
    } else {
      setPitchedNote(null);
    }
  };

  // diagnostic test
  const onTestRecordingData = () => {
    const rand = Math.random();
    const sine = Math.sin(Date.now() / 10000);
    const frequency = Math.round(((sine + 1) / 2) * 2000) + 2000;
    setDetectedFrequency(
      frequency < 20 || frequency > 19000 || rand < .1 ? null : frequency,
    );

    if (frequency) {
      const frequencyNote = getPitchedNote(frequency);
      if (frequencyNote) {
        setPitchedNote(frequencyNote);
      }
    } else {
      setPitchedNote(null);
    }
  };

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      // diagnostic testing
      const intervalId = setInterval(onTestRecordingData, 250);
      return () => {
        clearInterval(intervalId);
      };
    } else {
      // setup and start Recording
      if (Platform.OS === "android") {
        getAndroidPermissions();
      }
      Recording.init({
        bufferSize: BUFFER_SIZE,
        sampleRate: SAMPLE_RATE,
      });
      Recording.start();
      Recording.addRecordingEventListener(onRecordingData);
      return () => {
        Recording.stop();
      };
    }
  }, []);

  return (
    <SafeAreaView
      style={{
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "white",
        width: "100%",
        height: "100%",
      }}
    >
      <View
        style={{
          justifyContent: "center",
          width: "100%",
          height: "100%",
        }}
      >
        <NoteDisplay
          accidental={pitchedNote?.accidental}
          cents={pitchedNote?.cents}
          note={pitchedNote?.note}
          octave={pitchedNote?.octave}
        />
        <Text
          style={{
            fontSize: 16,
            fontWeight: "300",
            marginTop: 16,
            textAlign: "center",
          }}
        >
          {detectedFrequency ? `${detectedFrequency}Hz` : ` `}
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default App;
