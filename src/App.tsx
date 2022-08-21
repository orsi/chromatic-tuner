import React, { useEffect, useRef, useState } from "react";
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

const SAMPLE_RATE = 11025;
const BUFFER_SIZE = 256;
const UPDATE_FPS = 60;

const getAndroidPermissions = async () => {
  await PermissionsAndroid.requestMultiple([
    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
  ]);
};

const App = () => {
  const lastUpdate = useRef<number>(Date.now());
  const frequency = useRef<number | null>(null);
  const [detectedFrequency, setDetectedFrequency] = useState<number | null>();
  const [currentNote, setCurrentNote] = useState<IPitchedNote | null>();

  // frequency pitch detection
  const detectPitch = pitchfinder.YIN({ sampleRate: SAMPLE_RATE });
  const onRecordingData = (data: Float32Array) => {
    const now = Date.now();
    const delta = now - lastUpdate.current;

    // we save the frequency into a ref in order to prevent
    // react from rerendering on every frequency detection
    const pitch = detectPitch(data);
    const roundedPitch = pitch != null ? Math.round(pitch) : null;
    frequency.current = roundedPitch;

    // only update state variable at a minimal interval in order
    // to limit React rerenders
    if (delta > 1000 / UPDATE_FPS) {
      if (roundedPitch != null) {
        const pitchedNote = getPitchedNote(roundedPitch);
        if (pitchedNote) {
          setDetectedFrequency(roundedPitch);
          setCurrentNote(pitchedNote);
        }
      }
      lastUpdate.current = now;
    }
  };

  useEffect(() => {
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
        <NoteDisplay currentNote={currentNote} />
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
