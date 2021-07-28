package com.galoyapp;
import android.text.TextUtils;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;

import com.geetest.sdk.GT3ConfigBean;
import com.geetest.sdk.GT3ErrorBean;
import com.geetest.sdk.GT3GeetestUtils;
import com.geetest.sdk.GT3Listener;

import org.json.JSONObject;

import javax.annotation.Nullable;

public class GeeTestModule extends ReactContextBaseJavaModule {

    private GT3GeetestUtils gt3GeetestUtils;
    private GT3ConfigBean gt3ConfigBean;

    GeeTestModule(ReactApplicationContext context) {
        super(context);

    }

    // add to CalendarModule.java
    @Override
    public String getName() {
        return "GeeTestModule";
    }

    @ReactMethod
    public void setUp() {
        gt3GeetestUtils = new GT3GeetestUtils(getCurrentActivity());

        // Configure the bean file
        gt3ConfigBean = new GT3ConfigBean();
        // Set how captcha is presented，1：bind，2：unbind
        gt3ConfigBean.setPattern(1);
        // The default is false
        gt3ConfigBean.setCanceledOnTouchOutside(false);
        // Set language. Use system default language if null
        gt3ConfigBean.setLang(null);
        // Set the timeout for loading webview static files
        gt3ConfigBean.setTimeout(10000);
        // Set the timeout for webview request after user finishing the CAPTCHA verification. The default is 10,000
        gt3ConfigBean.setWebviewTimeout(10000);
        // Set callback listener
        gt3ConfigBean.setListener(new GT3Listener() {
            /**
             * CAPTCHA loading is completed
             * @param duration Loading duration and version info，in JSON format
             */
            @Override
            public void onDialogReady(String duration) {}

            /**
             * Verification result callback
             * @param code 1:success, 0:fail
             */
            @Override
            public void onReceiveCaptchaCode(int code) {}

            /**
             * api2 custom call
             * @param result
             */
            @Override
            public void onDialogResult(String result) {
                gt3GeetestUtils.dismissGeetestDialog();
                WritableMap params = Arguments.createMap();
                params.putString("result", result);
                sendEvent(getReactApplicationContext(), "GT3BaseListener-->onDialogResult-->", params);
            }

            /**
             * Statistic info.
             * @param result
             */
            @Override
            public void onStatistics(String result) {}

            /**
             * Close the CAPTCHA
             * @param num 1 Click the close button to close the CAPTCHA, 2 Click anyplace on screen to close the CAPTCHA, 3 Click return button the close
             */
            @Override
            public void onClosed(int num) {}

            /**
             * Verfication succeeds
             * @param result
             */
            @Override
            public void onSuccess(String result) {
                WritableMap params = Arguments.createMap();
                params.putString("result", result);
                sendEvent(getReactApplicationContext(), "GT3BaseListener-->onSuccess-->", params);
            }

            /**
             * Verification fails
             * @param errorBean Version info, error code & description, etc.
             */
            @Override
            public void onFailed(GT3ErrorBean errorBean) {
                WritableMap params = Arguments.createMap();
                params.putString("error", errorBean.toString());
                sendEvent(getReactApplicationContext(), "GT3BaseListener-->onFailed-->", params);
            }

            /**
             * api1 custom call
             */
            @Override
            public void onButtonClick() {}
        });
        gt3GeetestUtils.init(gt3ConfigBean);
    }

    @ReactMethod
    public void tearDown() {
        getCurrentActivity().runOnUiThread(() -> {
            gt3GeetestUtils.destory();
            gt3GeetestUtils = null;
            gt3ConfigBean = null;
        });
    }

    @ReactMethod
    public void handleRegisteredGeeTestCaptcha(String params) {
        if (!TextUtils.isEmpty(params)) {
            try {
                JSONObject jsonObject = new JSONObject(params);
                getCurrentActivity().runOnUiThread(() -> {
                    gt3GeetestUtils.startCustomFlow();
                    gt3ConfigBean.setApi1Json(jsonObject);
                    gt3GeetestUtils.getGeetest();
                });
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }

    private void sendEvent(ReactContext reactContext,
                           String eventName,
                           @Nullable WritableMap params) {
        reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);
    }


}
