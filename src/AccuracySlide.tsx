import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  LayoutChangeEvent,
  LayoutRectangle,
  View,
} from "react-native";

const TARGET_RGBA = "rgba(0,0,0,.05)";
const GOOD_RGBA = "rgba(0,255,125,.6)";
const ACCURATE_GOOD = 10;

interface AccuracySlideProps {
  cents?: number;
}

export default ({ cents }: AccuracySlideProps) => {
  const [viewLayout, setViewLayout] = useState<LayoutRectangle>();
  const xAnimation = useRef(new Animated.Value(1)).current;
  const yAnimation = useRef(new Animated.Value(1)).current;
  const isGood = cents != null && cents > -ACCURATE_GOOD &&
    cents < ACCURATE_GOOD;
  const windowWidth = Dimensions.get("window").width;

  useEffect(() => {
    if (viewLayout == null) return;
    if (cents == null) return;

    // if close enough, lock to center
    const interp = isGood ? 0 : cents / 50;
    const viewWidthAdjustment = viewLayout.height / 2;
    const xValue = interp * (windowWidth / 2) + windowWidth / 2 -
      viewWidthAdjustment;
    const yValue = Math.abs(interp) * 25;

    Animated.timing(xAnimation, {
      toValue: xValue,
      duration: 250,
      useNativeDriver: true,
    }).start();
    Animated.timing(yAnimation, {
      toValue: yValue,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [cents, viewLayout]);

  const Target = ({ height }: { height: number }) => (
    <View
      style={{
        backgroundColor: TARGET_RGBA,
        borderRadius: height / 2,
        borderWidth: 1,
        height: height,
        width: height,
      }}
    />
  );

  const Indicator = ({ height }: { height: number }) => {
    const absCent = cents != null ? Math.abs(cents) : 0;
    const red = Math.floor(absCent / 50 * 50) + 200;
    const green = Math.floor((1 - (absCent / 50)) * 255);
    return (
      <Animated.View
        style={{
          backgroundColor: isGood ? GOOD_RGBA : `rgba(${red},${green},50, .6)`,
          borderRadius: height / 2,
          borderWidth: 1,
          borderColor: `rgba(${red},${green},50, .8)`,
          height: height,
          position: "absolute",
          top: 0,
          left: 0,
          transform: [{ translateX: xAnimation }, { translateY: yAnimation }],
          width: height,
        }}
      />
    );
  };

  const onLayout = (event: LayoutChangeEvent) => {
    setViewLayout(event.nativeEvent.layout);
  };

  return (
    <View
      onLayout={onLayout}
      style={{
        alignItems: "center",
        position: "relative",
        height: "100%",
        width: "100%",
      }}
    >
      {viewLayout && (
        <>
          <Target height={viewLayout.height} />
          <Indicator height={viewLayout.height} />
        </>
      )}
    </View>
  );
};
