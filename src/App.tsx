import { frequencies } from "./frequencies.json";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, useColorScheme, View } from "react-native";
import Recording from "react-native-recording";
import pitchfinder from "pitchfinder";

const environment = process.env.NODE_ENV;
const SAMPLE_RATE = 22050;
const BUFFER_SIZE = 2048;
// const FRAME_RATE = 1;
// const RENDER_FRAME_MS = 1000 / FRAME_RATE;

const commonStyles = StyleSheet.create({
  frequency: {
    fontSize: 36,
  },
  note: {
    fontSize: 64,
  },
  cents: {
    fontSize: 16,
  },
});

const darkModeStyles = StyleSheet.create({
  container: {
    backgroundColor: "black",
    color: "white",
    height: "100%",
    paddingTop: 100, // buffer for top nav
    paddingBottom: 100, // buffer for top nav
  },
});

const lightModeStyles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    color: "black",
    height: "100%",
    paddingTop: 100, // buffer for top nav
    paddingBottom: 100, // buffer for top nav
  },
});

const App = () => {
  const [currentFrequency, setCurrentFrequency] = useState<number | null>(null);
  const isDarkMode = useColorScheme() === "dark";

  // frequency pitch detection
  const detectPitch = pitchfinder.YIN({ sampleRate: SAMPLE_RATE });
  const onRecordingData = (data: Float32Array) => {
    const frequency = detectPitch(data);
    setCurrentFrequency(frequency);
  };

  // test function
  const onTestRecordingData = () => {
    const isNull = Math.random() < .1;
    if (isNull) {
      setCurrentFrequency(null);
    } else {
      const randomFrequency = Math.round(Math.random() * 5000 + 20);
      setCurrentFrequency(randomFrequency);
    }
  };

  // logic and rendering
  const renderNote = (frequency: number | null) => {
    if (!frequency) {
      // no frequency detected
      return <Text style={{ textAlign: "center" }}>No Audio</Text>;
    }

    let lowNote = frequencies[0];
    let highNote = frequencies[1];
    if (frequency > lowNote.frequency && frequency < highNote.frequency) {
      // noop
      // seem we hit the lowest note already
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

    if (frequency > highNote.frequency) {
      // frequency detected is beyond playable range probably
      return <Text style={commonStyles.frequency}>{currentFrequency}Hz</Text>;
    }

    // calculate closest note and distance
    const distance = (frequency - lowNote.frequency) /
      (highNote.frequency - lowNote.frequency);
    const closestNote = distance < .5 ? lowNote : highNote;
    const cents = Math.round((.5 - distance) * 100);
    const accuracy = 1 - (Math.abs(cents) / 50);

    // determine color gradient for indicating accuracy to note
    let backgroundColor = `rgba(255,0,0,1)`;
    if (accuracy > 0.9) {
      backgroundColor = `rgba(255,255,0,1)`;
    } else if (accuracy > 0.6) {
      backgroundColor = `rgba(0,255,0,1)`;
    }

    return (
      <View
        style={{
          alignItems: "center",
        }}
      >
        <Text
          style={commonStyles.frequency}
        >
          {currentFrequency}Hz
        </Text>
        <View
          style={{
            backgroundColor: backgroundColor,
            padding: 24,
            marginTop: 48,
          }}
        >
          <Text style={commonStyles.note}>
            {closestNote.note}
          </Text>
          <Text>
            Accuracy: {Math.round(accuracy * 100)}%
          </Text>
          <Text style={commonStyles.cents}>{cents} cents</Text>
        </View>
      </View>
    );
  };

  // effects
  useEffect(() => {
    if (environment === "development") {
      const intervalId = setInterval(onTestRecordingData, 1500);
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
    <View
      style={isDarkMode ? darkModeStyles.container : lightModeStyles.container}
    >
      {renderNote(currentFrequency)}
    </View>
  );
};

export default App;
