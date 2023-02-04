#import <RCTAppDelegate.h>
#import <UIKit/UIKit.h>
#import <UserNotifications/UNUserNotificationCenter.h>

// https://github.com/react-native-push-notification/ios/issues/388
@interface AppDelegate : RCTAppDelegate <UNUserNotificationCenterDelegate>

@end
