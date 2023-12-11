// AudioStreamBridge.m
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface
RCT_EXTERN_MODULE(AudioStream, RCTEventEmitter)

RCT_EXTERN_METHOD(start)
RCT_EXTERN_METHOD(stop)

@end
