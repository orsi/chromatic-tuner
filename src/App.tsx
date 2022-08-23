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

const SAMPLE_RATE = 22050;
const BUFFER_SIZE = 2056;

const getAndroidPermissions = async () => {
  await PermissionsAndroid.requestMultiple([
    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
  ]);
};

const App = () => {
  const frequency = useRef<number | null>();
  const note = useRef<IPitchedNote | null>();
  const [detectedFrequency, setDetectedFrequency] = useState<number | null>();
  const [currentNote, setCurrentNote] = useState<IPitchedNote | null>();

  // frequency pitch detection
  const detectPitch = pitchfinder.YIN({ sampleRate: SAMPLE_RATE });
  const onRecordingData = (data: Float32Array) => {
    // we save the frequency into a ref in order to prevent
    // react from rerendering on every frequency detection
    const pitch = detectPitch(data);
    frequency.current = pitch;
    if (frequency.current != null) {
      note.current = getPitchedNote(frequency.current);
      setCurrentNote(note.current);
      setDetectedFrequency(Math.round(frequency.current));
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
