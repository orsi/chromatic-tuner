import {NativeEventEmitter, NativeModules} from 'react-native';
const {AudioStream} = NativeModules;
const AudioStreamEventEmitter = new NativeEventEmitter(AudioStream);

interface IAudioStreamOptions {
  bufferSize: number;
  sampleRate: number;
}
interface IAudioStreamModule {
  setup: (options: any, callback: (data: Float32Array) => void) => void;
  start: () => void;
  stop: () => void;
  getBufferSize: () => number;
  getSampleRate: () => number;
}

export default {
  setup: (
    options: IAudioStreamOptions | null | undefined,
    callback: (data: Float32Array) => void,
  ) => {
    AudioStream.setup(options);
    AudioStreamEventEmitter.addListener('onAudio', callback);
  },
  start: AudioStream.start,
  stop: AudioStream.stop,
  getBufferSize: AudioStream.getBufferSize,
  getSampleRate: AudioStream.getSampleRate,
} as IAudioStreamModule;
