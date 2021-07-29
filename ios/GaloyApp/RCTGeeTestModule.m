// RCTGeeTestModule.m
#import "RCTGeeTestModule.h"
#import <GT3Captcha/GT3Captcha.h>

@implementation RCTGeeTestModule
{
  bool hasListeners;
}

- (NSArray<NSString *> *)supportedEvents {
    return @[
      @"GT3BaseListener-->onDialogResult-->",
      @"GT3BaseListener-->onSuccess-->",
      @"GT3BaseListener-->onFailed-->"
    ];
}

-(void)startObserving {
    hasListeners = YES;
}

-(void)stopObserving {
    hasListeners = NO;
}

// To export a module named RCTGeeTestModule
RCT_EXPORT_MODULE();

- (GT3CaptchaManager *)manager {
    if (!_manager) {
        _manager = [[GT3CaptchaManager alloc] init];
        _manager.delegate = self;
    }
    return _manager;
}

RCT_EXPORT_METHOD(setUp)
{
    [self.manager registerCaptcha:nil];
}

RCT_EXPORT_METHOD(tearDown)
{
  [self.manager stopGTCaptcha];
}

RCT_EXPORT_METHOD(handleRegisteredGeeTestCaptcha:(NSString *)params)
{
    NSData *jsonData = [params dataUsingEncoding:NSUTF8StringEncoding];
    NSError *error;
  
    NSDictionary *jsonDictionary = [NSJSONSerialization JSONObjectWithData:jsonData options:0 error:&error];

    if (error) {
        [self sendEventWithName:@"GT3BaseListener-->onFailed-->" body:@{@"error": [error localizedDescription]}];
    }
    
    [self.manager configureGTest:[jsonDictionary objectForKey:@"gt"]
                       challenge:[jsonDictionary objectForKey:@"challenge"]
                         success:[jsonDictionary objectForKey:@"success"]
                        withAPI2:@""];
    [self.manager startGTCaptchaWithAnimated:YES];
}

- (BOOL)shouldUseDefaultRegisterAPI:(GT3CaptchaManager *)manager {
    return NO;
}

- (void)gtCaptcha:(GT3CaptchaManager *)manager didReceiveCaptchaCode:(NSString *)code result:(NSDictionary *)result message:(NSString *)message {
    NSError *error;
    NSData *jsonData = [NSJSONSerialization dataWithJSONObject:result options:0 error:&error];
  
    if (error) {
        [self sendEventWithName:@"GT3BaseListener-->onFailed-->" body:@{@"error": [error localizedDescription]}];
    }
  
    NSString * resultString = [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];
    [self sendEventWithName:@"GT3BaseListener-->onDialogResult-->" body:@{@"result":resultString}];
}

- (void)gtCaptcha:(GT3CaptchaManager *)manager errorHandler:(GT3Error *)error {
    if (error) {
        [self sendEventWithName:@"GT3BaseListener-->onFailed-->" body:@{@"error": [error localizedDescription]}];
    }
}

@end
