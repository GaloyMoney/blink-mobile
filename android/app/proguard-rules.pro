# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.jni.** { *; }
-keep public class com.horcrux.svg.** {*;}

# GeeTest SDK has already been obfuscated, please do not obfuscate it again
-dontwarn com.geetest.sdk.**
-keep class com.geetest.sdk.**{*;}

-keep class com.swmansion.reanimated.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }

-keep public class com.shopify.reactnative.skia.* {*;}

# inapp browser
-keepattributes *Annotation*
-keepclassmembers class ** {
  @org.greenrobot.eventbus.Subscribe <methods>;
}
-keep enum org.greenrobot.eventbus.ThreadMode { *; }

-dontwarn com.samsung.** 
-keep class com.samsung.** { *; }
