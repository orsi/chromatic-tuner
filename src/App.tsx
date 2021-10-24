import React from 'react';
import {
  StyleSheet,
  useColorScheme,
  Text,
  SafeAreaView,
  View,
} from 'react-native';
import Recording from 'react-native-recording';
import pitchfinder from 'pitchfinder';

const SAMPLE_RATE = 22050;
const BUFFER_SIZE = 2048;
const FRAME_RATE = 1;
const RENDER_FRAME_MS = 1000 / FRAME_RATE;

const darkModeStyles = StyleSheet.create({
  container: {
    backgroundColor: 'black',
    color: 'white',
    height: '100%',
    paddingTop: 100, // buffer for top nav
    paddingBottom: 100, // buffer for top nav
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: 'white',
  },
});

const lightModeStyles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    color: 'black',
    height: '100%',
    paddingTop: 100, // buffer for top nav
    paddingBottom: 100, // buffer for top nav
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: 'black',
  },
});

const App = () => {
  const [isWaitingForAudio, setIsWaitingForAudio] = React.useState(true);
  const [lastFrequency, setLastFrequency] = React.useState<number | null>();
  const detectPitch = pitchfinder.YIN({sampleRate: SAMPLE_RATE});

  const isDarkMode = useColorScheme() === 'dark';

  const onRecordingData = (data: Float32Array) => {
    const frequency = detectPitch(data);
    if (frequency) {
      const roundedFrequency = Number.parseFloat(frequency.toFixed(1));
      console.log(roundedFrequency);
      setLastFrequency(roundedFrequency);
      setIsWaitingForAudio(false);
    } else {
      setIsWaitingForAudio(true);
    }
  };

  React.useEffect(() => {
    // setup and start Recording
    Recording.init({
      bufferSize: BUFFER_SIZE,
      sampleRate: SAMPLE_RATE,
    });
    Recording.start();
    Recording.addRecordingEventListener(onRecordingData);
  }, []);

  return (
    <View
      style={isDarkMode ? darkModeStyles.container : lightModeStyles.container}>
      <Text style={isDarkMode ? darkModeStyles.text : lightModeStyles.text}>
        {lastFrequency && `${lastFrequency}Hz`}
      </Text>
      <Text style={isDarkMode ? darkModeStyles.text : lightModeStyles.text}>
        {isWaitingForAudio ? `Waiting for audio...` : ` `}
      </Text>
    </View>
  );
};

export default App;
