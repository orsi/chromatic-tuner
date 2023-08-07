// AudioStreamBridge.m
#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(AudioStream, NSObject)

RCT_EXTERN_METHOD(start:(NSString *)name location:(NSString *)location date:(nonnull NSNumber *)date)

@end
