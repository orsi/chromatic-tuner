import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Recording from "react-native-recording";
import pitchfinder from "pitchfinder";
import { ACCIDENTAL_MODE, getPitchedNote, IPitchedNote } from "./pitch.service";

const DEFAULT_NOTE: IPitchedNote = {
  accidental: "natural",
  cents: 0,
  frequency: 440,
  note: "A",
  octave: 4,
};
const TARGET_SIZE = 200;
const TARGET_RGBA = "rgba(0,0,0,.15)";
const GOOD_RGBA = "rgba(0,255,125,.6)";
const ACCURACY_GOOD = 10;
const SAMPLE_RATE = 44100;
const BUFFER_SIZE = 8192;
const PitchFinder = pitchfinder.YIN({ sampleRate: SAMPLE_RATE });

const getAndroidPermissions = async () => {
  await PermissionsAndroid.requestMultiple([
    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
  ]);
};

const App = () => {
  const frequency = useRef<number | null>();
  const note = useRef<IPitchedNote | null>();
  const xAnimation = useRef(new Animated.Value(0)).current;
  const yAnimation = useRef(new Animated.Value(0)).current;

  const windowWidth = Dimensions.get("window").width;
  const windowHeight = Dimensions.get("window").height;
  const [isPortraitMode, setIsPortraitMode] = useState(
    windowWidth < windowHeight,
  );
  const [currentFrequency, setCurrentFrequency] = useState<number>(
    DEFAULT_NOTE.frequency,
  );
  const [accidentalMode, setAccidentalMode] = useState(ACCIDENTAL_MODE.SHARP);
  const currentNote = getPitchedNote(currentFrequency, accidentalMode);

  const onPressAccidentalToggleButton = () => {
    setAccidentalMode(
      accidentalMode !== ACCIDENTAL_MODE.SHARP
        ? ACCIDENTAL_MODE.SHARP
        : ACCIDENTAL_MODE.FLAT,
    );
  };

  // derived state
  const isGood = currentNote.cents != null &&
    currentNote.cents > -ACCURACY_GOOD &&
    currentNote.cents < ACCURACY_GOOD;
  // if close enough, lock to center
  const interp = isGood ? 0 : currentNote.cents / 50;
  const absCent = currentNote.cents != null ? Math.abs(currentNote.cents) : 0;
  const red = Math.floor(absCent / 50 * 50) + 200;
  const green = Math.floor((1 - (absCent / 50)) * 255);

  useEffect(() => {
    // android permissions
    if (Platform.OS === "android") {
      getAndroidPermissions();
    }

    // setup and start Recording
    const onRecordingData = (data: Float32Array) => {
      // we save the frequency into a ref in order to prevent
      // react from rerendering on every frequency detection
      const pitch = PitchFinder(data);
      frequency.current = pitch;
      if (frequency.current != null) {
        setCurrentFrequency(frequency.current);
      }
    };
    Recording.init({
      bufferSize: BUFFER_SIZE,
      sampleRate: SAMPLE_RATE,
    });
    Recording.start();
    Recording.addRecordingEventListener(onRecordingData);

    // determine orientation
    const onDimensionsChange = () => {
      const width = Dimensions.get("window").width;
      const height = Dimensions.get("window").height;
      setIsPortraitMode(width < height);
    };

    onDimensionsChange();
    const dimensionsChange = Dimensions.addEventListener(
      "change",
      onDimensionsChange,
    );

    return () => {
      Recording.stop();
      dimensionsChange.remove();
    };
  }, []);

  useEffect(() => {
    if (isPortraitMode) {
      Animated.timing(xAnimation, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }).start();
      Animated.timing(yAnimation, {
        toValue: -interp * windowHeight / 2,
        duration: 100,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(xAnimation, {
        toValue: interp * windowWidth / 2,
        duration: 100,
        useNativeDriver: true,
      }).start();
      Animated.timing(yAnimation, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }).start();
    }
  }, [currentNote]);

  return (
    <SafeAreaView
      style={{
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "white",
        width: "100%",
        height: "100%",
      }}
    >
      {/* Sharp or flat toggle */}
      <View
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          marginTop: isPortraitMode ? 64 : 32,
          marginRight: isPortraitMode ? 32 : 64,
        }}
      >
        <TouchableOpacity
          onPress={onPressAccidentalToggleButton}
          style={{
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#DDDDDD",
            borderRadius: 45,
            width: 45,
            height: 45,
          }}
        >
          <Text
            style={{
              fontSize: 32,
              fontWeight: "300",
              textAlign: "center",
              color: "rgba(0,0,0,.5)",
              paddingTop: 5,
            }}
          >
            {accidentalMode === ACCIDENTAL_MODE.SHARP ? "♭" : "♯"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Current detected frequency */}
      <Text
        style={{
          fontSize: 16,
          fontWeight: "300",
          marginTop: 16,
          textAlign: "center",
          position: "absolute",
          bottom: 32,
        }}
      >
        {Math.round(currentFrequency)}Hz
      </Text>

      {/* Target */}
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          position: "absolute",
          backgroundColor: TARGET_RGBA,
          borderRadius: TARGET_SIZE,
          height: TARGET_SIZE,
          width: TARGET_SIZE,
        }}
      >
        {/* Cents Tracker */}
        <Animated.View
          style={{
            backgroundColor: isGood
              ? GOOD_RGBA
              : `rgba(${red},${green},50, .6)`,
            borderRadius: TARGET_SIZE,
            height: TARGET_SIZE,
            left: 0,
            position: "absolute",
            top: 0,
            transform: [
              { translateX: xAnimation },
              { translateY: yAnimation },
            ],
            width: TARGET_SIZE,
          }}
        />

        <View style={{ flexDirection: "row" }}>
          <View>
            <Text style={{ fontSize: 96 }}>
              {currentNote.note}
            </Text>
          </View>
          <View style={{ justifyContent: "space-between" }}>
            <Text
              style={{
                fontSize: 36,
                fontWeight: "200",
              }}
            >
              {currentNote.accidental === "sharp"
                ? `♯`
                : currentNote.accidental === "flat"
                ? `♭`
                : ` `}
            </Text>
            <Text
              style={{
                fontSize: 24,
                fontWeight: "300",
              }}
            >
              {currentNote.octave}
            </Text>
          </View>
        </View>

        <Text style={{ fontSize: 10 }}>
          cents
        </Text>
        <Text style={{ fontSize: 16 }}>
          {currentNote.cents}
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default App;
