// AudioStreamBridge.m
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface
RCT_EXTERN_MODULE(AudioStream, RCTEventEmitter)

RCT_EXTERN_METHOD(setup: (NSDictionary *)options)
RCT_EXTERN_METHOD(start)
RCT_EXTERN_METHOD(stop)
RCT_EXTERN_METHOD(getBufferSize)
RCT_EXTERN_METHOD(getSampleRate)

@end
