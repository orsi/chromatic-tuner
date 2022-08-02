import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, Text, View } from "react-native";

const CROSSHAIR_SIZE = 32;

interface AccuracySlideProps {
  accuracy: number;
  cents: number;
}

export default ({ accuracy, cents }: AccuracySlideProps) => {
  const [width, setWidth] = useState<number>(0);
  const transformation = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const translation = (width * Math.abs((cents + 50) % 100) / 100) -
      (CROSSHAIR_SIZE / 2);
    Animated.timing(transformation, {
      toValue: translation,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [cents, width]);

  const Target = (
    <View
      style={{
        backgroundColor: "rgba(0,100,0,.2)",
        height: 100,
        width: CROSSHAIR_SIZE,
      }}
    />
  );

  const CrossHair = (
    <Animated.View
      style={{
        backgroundColor: "rgba(0,0,0,.6)",
        borderColor: "rgba(0,0,0,.9)",
        borderRadius: 50,
        borderWidth: 1,
        height: CROSSHAIR_SIZE,
        position: "absolute",
        top: "50%",
        left: 0,
        marginTop: -(CROSSHAIR_SIZE / 2),
        transform: [{ translateX: transformation }],
        width: CROSSHAIR_SIZE,
      }}
    />
  );

  return (
    <View
      onLayout={(event) => {
        setWidth(event.nativeEvent.layout.width);
      }}
      style={{
        borderLeftColor: "black",
        borderLeftWidth: 1,
        borderRightColor: "black",
        borderRightWidth: 1,
        alignItems: "center",
        position: "relative",
        width: "90%",
      }}
    >
      {Target}
      {CrossHair}
    </View>
  );
};
