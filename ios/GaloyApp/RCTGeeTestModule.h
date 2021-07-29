//  RCTGeeTestModule.h
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
#import <GT3Captcha/GT3Captcha.h>
@interface RCTGeeTestModule : RCTEventEmitter <RCTBridgeModule, GT3CaptchaManagerDelegate>

@property (nonatomic, strong) GT3CaptchaManager *manager;

@end
