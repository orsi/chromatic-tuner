import { frequencies } from "./frequencies.json";
import React, { useEffect, useState } from "react";
import { SafeAreaView, Text, View } from "react-native";
import Recording from "react-native-recording";
import pitchfinder from "pitchfinder";

const environment = process.env.NODE_ENV;
const SAMPLE_RATE = 22050;
const BUFFER_SIZE = 2048;

const App = () => {
  const [currentFrequency, setCurrentFrequency] = useState<number | null>(null);
  const [lastFrequenct, setLastFrequency] = useState<number>();

  // frequency pitch detection
  const detectPitch = pitchfinder.YIN({ sampleRate: SAMPLE_RATE });
  const onRecordingData = (data: Float32Array) => {
    const frequency = detectPitch(data);
    setCurrentFrequency(frequency);
  };

  // test function
  const onTestRecordingData = () => {
    const isNull = Math.random() < .3;
    if (isNull) {
      setCurrentFrequency(null);
    } else {
      const randomFrequency = Math.round(Math.random() * 5000 + 20);
      setCurrentFrequency(randomFrequency);
    }
  };

  // effects
  useEffect(() => {
    if (environment === "development") {
      const intervalId = setInterval(onTestRecordingData, 250);
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

  useEffect(() => {
    if (currentFrequency != null) {
      setLastFrequency(currentFrequency);
    }
  }, [currentFrequency]);

  const Wrapper: React.FC = ({ children }) => (
    <SafeAreaView
      style={{
        alignItems: "center",
        backgroundColor: "white",
        borderColor: "red",
        borderWidth: 2,
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
      }}
    >
      {children}
    </SafeAreaView>
  );

  if (!currentFrequency) {
    // no frequency detected
    return (
      <Wrapper>
        <View
          style={{
            justifyContent: "center",
            borderColor: "blue",
            borderWidth: 2,
            height: "100%",
            width: "100%",
          }}
        >
          <Text style={{ textAlign: "center", fontSize: 32 }}>No Audio</Text>
          <Text style={{ textAlign: "center", fontSize: 16 }}>
            Last: {lastFrequenct}Hz
          </Text>
        </View>
      </Wrapper>
    );
  }

  let lowNote = frequencies[0];
  let highNote = frequencies[1];
  if (
    currentFrequency > lowNote.frequency &&
    currentFrequency < highNote.frequency
  ) {
    // noop
    // seems we hit the lowest note
  } else {
    for (let i = 2; i < frequencies.length; i++) {
      const currentItem = frequencies[i];
      lowNote = highNote;
      highNote = currentItem;
      if (currentItem.frequency > currentFrequency) {
        break;
      }
    }
  }

  if (currentFrequency > highNote.frequency) {
    // frequency detected is beyond playable range probably
    return (
      <Wrapper>
        <Text style={{ fontSize: 32 }}>{currentFrequency}Hz</Text>
      </Wrapper>
    );
  }

  // calculate closest note and distance
  const distance = (currentFrequency - lowNote.frequency) /
    (highNote.frequency - lowNote.frequency);
  const closestNote = distance < .5 ? lowNote : highNote;
  const cents = Math.round((.5 - distance) * 100);
  const accuracy = 1 - (Math.abs(cents) / 50);

  // determine color gradient for indicating accuracy to note
  let backgroundColor = `rgba(255,0,0,1)`;
  if (accuracy >= 0.9) {
    backgroundColor = `rgba(0,255,0,1)`;
  } else if (accuracy >= 0.6) {
    backgroundColor = `rgba(255,255,0,1)`;
  }

  return (
    <Wrapper>
      <View style={{ borderColor: "yellow", borderWidth: 2, flex: 1 }}>
        {/* Frequency Detection Display */}
        <Text
          style={{ fontSize: 36 }}
        >
          {currentFrequency}Hz
        </Text>
      </View>
      <View
        style={{
          borderColor: "green",
          borderWidth: 2,
          flex: 2,
        }}
      >
        {/* Note Display */}
        <View
          style={{
            backgroundColor: backgroundColor,
            padding: 24,
          }}
        >
          <Text style={{ fontSize: 64 }}>
            {closestNote.note}
          </Text>
        </View>

        {/* Accuracy Indicator */}
        <View
          style={{
            alignItems: "center",
            borderColor: "purple",
            borderWidth: 2,
          }}
        >
          <Text>
            Accuracy: {Math.round(accuracy * 100)}%
          </Text>
          <Text style={{ fontSize: 16 }}>{cents} cents</Text>
          <View
            style={{
              alignItems: "center",
              position: "relative",
              width: "100%",
            }}
          >
            <View
              style={{
                backgroundColor: "blue",
                height: 50,
                width: 2,
              }}
            />
            <View
              style={{
                backgroundColor: "red",
                height: 10,
                position: "absolute",
                top: "50%",
                left: cents,
                width: 2,
              }}
            />
          </View>
          <Text>{cents === 0 ? `perfect!` : cents < 0 ? `up` : `down`}</Text>
        </View>
      </View>
    </Wrapper>
  );
};

export default App;
