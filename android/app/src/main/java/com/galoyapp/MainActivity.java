package com.galoyapp;

import android.os.Bundle;

import com.facebook.react.ReactActivity;

      import com.facebook.react.ReactActivityDelegate;
      import com.facebook.react.ReactRootView;

public class MainActivity extends ReactActivity {

  @Override
  protected ReactActivityDelegate createReactActivityDelegate() {
    return new ReactActivityDelegate(this, getMainComponentName()) {
      // https://docs.swmansion.com/react-native-gesture-handler/docs/guides/migrating-off-rnghenabledroot/
    };
  }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(null);
    }

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "GaloyApp";
    }

    @Override
    public int checkPermission(String permission, int pid, int uid) {
        return 0;
    }

    @Override
    public int checkSelfPermission(String permission) {
        return 0;
    }

    @Override
    public boolean shouldShowRequestPermissionRationale(String permission) {
        return false;
    }
}
