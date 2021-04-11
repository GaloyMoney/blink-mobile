import base64 from 'react-native-base64'
import DeviceInfo from 'react-native-device-info'
import NetInfo from "@react-native-community/netinfo";



export const info = (mutateAddDeviceToken) => NetInfo.fetch().then(state => {
  try {

    let brand = DeviceInfo.getBrand();
    let buildNumber = DeviceInfo.getBuildNumber();
    let deviceId = DeviceInfo.getDeviceId();
    DeviceInfo.getHost().then((host) => {
      // "wprd10.hot.corp.google.com"
  
      DeviceInfo.getIpAddress().then((ip) => {
  

        DeviceInfo.getBootloader().then((bootloader) => {
          // "mw8998-002.0069.00"

          DeviceInfo.getDevice().then((device) => {
            // "walleye"

            DeviceInfo.getCarrier().then((carrier) => {
              // "SOFTBANK"


              DeviceInfo.getFirstInstallTime().then((firstInstallTime) => {
                // Android: 1517681764528


                DeviceInfo.getFingerprint().then((fingerprint) => {
                  // "google/walleye/walleye:8.1.0/OPM2.171026.006.G1/4820017:user/release-keys"

                  DeviceInfo.isEmulator().then((isEmulator) => {
                    // false

                    DeviceInfo.isAirplaneMode().then((airplaneModeOn) => {
                      // false

                      DeviceInfo.hasHms().then((hasHms) => {
                        // truev

                        DeviceInfo.hasGms().then((hasGms) => {
                          // true

                          DeviceInfo.isLocationEnabled().then((locationEnabled) => {
                            // true or false

                            DeviceInfo.isBatteryCharging().then((isCharging) => {
                              // true or false

                              DeviceInfo.getBuildId().then((buildId) => {
                                // iOS: "12A269"
                                // tvOS: not available
                                // Android: "13D15"
                                // Windows: not available

                                DeviceInfo.getDisplay().then((display) => {
                                  // "OPM2.171026.006.G1"

                                  DeviceInfo.getDeviceName().then((deviceName) => {
                                    // iOS: "Becca's iPhone 6"
                                    // Android: ?
                                    // Windows: ?

                                    const result = ({state, host, ip, deviceId, brand, buildNumber, bootloader, 
                                      device, carrier, firstInstallTime, fingerprint, isEmulator, airplaneModeOn,
                                      hasHms, hasGms, locationEnabled, isCharging, buildId, display, deviceName})
                  
                                    const b64 = base64.encode(JSON.stringify(result));
                                    console.tron.log({b64, result})

                                    mutateAddDeviceToken({deviceToken: b64})

                                  });
                                  

                                });
                                
                              });

                            });
                            
                          });
                        });
                      });
                    });
                  });



                });
              });
        
              // "92.168.32.44"
            });
          });
        });





      });
  
    });

  } catch (err) {
    console.tron.log({err})
  }

});






DeviceInfo.getFontScale().then((fontScale) => {
  // 1.2
});

DeviceInfo.getFreeDiskStorage().then((freeDiskStorage) => {
  // Android: 17179869184
  // iOS: 17179869184
});



DeviceInfo.getInstallReferrer().then((installReferrer) => {
  // If the app was installed from https://play.google.com/store/apps/details?id=com.myapp&referrer=my_install_referrer
  // the result will be "my_install_referrer"
});

DeviceInfo.getLastUpdateTime().then((lastUpdateTime) => {
  // Android: 1517681764992
});







