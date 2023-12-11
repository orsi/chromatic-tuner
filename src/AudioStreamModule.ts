import {NativeEventEmitter, NativeModules} from 'react-native';
const {AudioStream} = NativeModules;
const AudioStreamEventEmitter = new NativeEventEmitter(AudioStream);

export default {
  start: (callback: (data: Float32Array) => void) => {
    AudioStream.start();
    return AudioStreamEventEmitter.addListener('onAudio', callback);
  },
  stop: AudioStream.stop,
} as const;
