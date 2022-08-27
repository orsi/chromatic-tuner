import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Linking,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  Text,
  TextProps,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import Recording from "react-native-recording";
import pitchfinder from "pitchfinder";
import { ACCIDENTAL_MODE, getPitchedNote, IPitchedNote } from "./pitch.service";

const ACCURACY_GOOD = 10;
const BUFFER_SIZE = 4096;
const DEFAULT_NOTE: IPitchedNote = {
  accidental: "natural",
  cents: 0,
  frequency: 440,
  note: "A",
  octave: 4,
};
const DONATION_LINK =
  `https://www.paypal.com/donate/?business=VEECFWLFK3QCQ&amount=1&no_recurring=0&item_name=a+cup+of+coffee+or+snack%21&currency_code=CAD`;
const GOOD_RGBA = "rgba(0,255,125,.6)";
const SAMPLE_RATE = 22050;
const TARGET_BG_COLOR = "rgb(200,200,200)";
const TARGET_BG_COLOR_DARK = "rgba(255,255,255,.2)";
const TARGET_SIZE = 200;
const BG_COLOR = "rgb(240,240,240)";
const BG_COLOR_DARK = "rgb(20,20,20)";
const TEXT_COLOR = "rgb(0,0,0)";
const TEXT_COLOR_DARK = "rgb(240,240,240)";
const PitchFinder = pitchfinder.YIN({ sampleRate: SAMPLE_RATE });

const getAndroidPermissions = async () => {
  await PermissionsAndroid.requestMultiple([
    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
  ]);
};

const ThemedText: React.FC<TextProps> = (
  { children, style, ...attributes },
) => {
  const scheme = useColorScheme();
  return (
    <Text
      style={[{
        color: scheme === "dark" ? TEXT_COLOR_DARK : TEXT_COLOR,
      }, style]}
      {...attributes}
    >
      {children}
    </Text>
  );
};

const App = () => {
  const scheme = useColorScheme();
  const frequency = useRef<number | null>();
  const xAnimation = useRef(new Animated.Value(0)).current;
  const yAnimation = useRef(new Animated.Value(0)).current;

  const [accidentalMode, setAccidentalMode] = useState(ACCIDENTAL_MODE.SHARP);
  const [isPortraitMode, setIsPortraitMode] = useState(
    Dimensions.get("window").width < Dimensions.get("window").height,
  );
  const [currentFrequency, setCurrentFrequency] = useState<number>(
    DEFAULT_NOTE.frequency,
  );

  // derived state
  const currentNote = getPitchedNote(currentFrequency, accidentalMode);
  const isAccuracyGoodEnough = currentNote.cents != null &&
    currentNote.cents > -ACCURACY_GOOD &&
    currentNote.cents < ACCURACY_GOOD;
  // if close enough, lock to center
  const interp = isAccuracyGoodEnough ? 0 : currentNote.cents / 50;
  const absCent = currentNote.cents != null ? Math.abs(currentNote.cents) : 0;
  const red = Math.floor(absCent / 50 * 50) + 200;
  const green = Math.floor((1 - (absCent / 50)) * 255);

  // handlers
  const onChangeDimensions = () => {
    const width = Dimensions.get("window").width;
    const height = Dimensions.get("window").height;
    setIsPortraitMode(width < height);
  };

  const onPressAccidentalToggleButton = () => {
    setAccidentalMode(
      accidentalMode !== ACCIDENTAL_MODE.SHARP
        ? ACCIDENTAL_MODE.SHARP
        : ACCIDENTAL_MODE.FLAT,
    );
  };

  const onPressDonateLink = async () => {
    // Checking if the link is supported for links with custom URL scheme.
    const supported = await Linking.canOpenURL(DONATION_LINK);

    if (supported) {
      // Opening the link with some app, if the URL scheme is "http" the web link should be opened
      // by some browser in the mobile
      await Linking.openURL(DONATION_LINK);
    }
  };

  const onRecordingData = (data: Float32Array) => {
    // we save the frequency into a ref in order to prevent
    // react from rerendering on every frequency detection
    const pitch = PitchFinder(data);
    frequency.current = pitch;
    if (frequency.current != null) {
      setCurrentFrequency(frequency.current);
    }
  };

  useEffect(() => {
    // android permissions
    if (Platform.OS === "android") {
      getAndroidPermissions();
    }

    // setup and start Recording
    Recording.init({
      bufferSize: BUFFER_SIZE,
      sampleRate: SAMPLE_RATE,
    });
    Recording.start();
    Recording.addRecordingEventListener(onRecordingData);

    // determine orientation
    const dimensionsChange = Dimensions.addEventListener(
      "change",
      onChangeDimensions,
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
        toValue: -interp * Dimensions.get("window").height / 2,
        duration: 100,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(xAnimation, {
        toValue: interp * Dimensions.get("window").width / 2,
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
        alignItems: "center",
        backgroundColor: scheme === "dark" ? BG_COLOR_DARK : BG_COLOR,
        height: "100%",
        justifyContent: "center",
        width: "100%",
      }}
    >
      {/* Current detected frequency */}
      <ThemedText
        style={{
          fontSize: 16,
          fontWeight: "300",
          textAlign: "center",
          position: "absolute",
          bottom: 0,
          padding: 32,
        }}
      >
        {Math.round(currentFrequency)}Hz
      </ThemedText>

      {/* Paypal donation link */}
      <TouchableOpacity
        onPress={onPressDonateLink}
        style={{
          bottom: 0,
          position: "absolute",
          right: 0,
          padding: 32,
        }}
      >
        <ThemedText
          style={{
            fontSize: 12,
            textAlign: "right",
          }}
        >
          💲
        </ThemedText>
      </TouchableOpacity>

      {/* Target */}
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          position: "absolute",
          backgroundColor: scheme === "dark"
            ? TARGET_BG_COLOR_DARK
            : TARGET_BG_COLOR,
          borderRadius: TARGET_SIZE,
          height: TARGET_SIZE,
          width: TARGET_SIZE,
        }}
      >
        {/* Cents Tracker */}
        <Animated.View
          style={{
            backgroundColor: isAccuracyGoodEnough
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
          <View style={{ width: 64 }}>
            {/* Note letter */}
            <ThemedText style={{ fontSize: 96, textAlign: "right" }}>
              {currentNote.note}
            </ThemedText>
          </View>
          <View style={{ justifyContent: "space-between" }}>
            {/* Sharp/flat accidental symbol and toggle */}
            <TouchableOpacity
              onPress={onPressAccidentalToggleButton}
              style={{
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: currentNote.accidental !== "natural"
                  ? "rgba(0,0,0,.1)"
                  : "transparent",
                borderRadius: 32,
                paddingBottom: 8,
                paddingTop: 0,
                paddingHorizontal: 4
              }}
            >
              <ThemedText
                style={{
                  fontSize: 24,
                  textAlign: "center",
                }}
              >
                {currentNote.accidental === "sharp"
                  ? `♯`
                  : currentNote.accidental === "flat"
                  ? `♭`
                  : ` `}
              </ThemedText>
            </TouchableOpacity>

            {/* Octave */}
            <ThemedText
              style={{
                fontSize: 24,
                fontWeight: "300",
              }}
            >
              {currentNote.octave}
            </ThemedText>
          </View>
        </View>

        {/* Cents */}
        <ThemedText style={{ fontSize: 10 }}>
          cents
        </ThemedText>
        <ThemedText style={{ fontSize: 16 }}>
          {currentNote.cents}
        </ThemedText>
      </View>
    </SafeAreaView>
  );
};

export default App;
