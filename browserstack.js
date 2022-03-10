/* eslint-disable @typescript-eslint/no-var-requires */
const wd = require("wd")
// const asserters = wd.asserters

const desiredCaps = {
  // Set your BrowserStack access credentials
  'browserstack.user': `${process.env.BROWSERSTACK_USER}`,
  'browserstack.key': `${process.env.BROWSERSTACK_ACCESS_KEY}`,

  // Set URL of the application under test
  'app': `bs://${process.env.BROWSERSTACK_APP_ID}`,

  // Specify device and os_version for testing
  'device': 'Google Pixel 3',
  'os_version': '9.0',

  // Set other BrowserStack capabilities
  'project': 'Galoy Mobile',
  'build': 'Galoy Mobile Android App',
  'name': 'first_test'
};

// Initialize the remote Webdriver using BrowserStack remote URL
// and desired capabilities defined above
const driver = wd.promiseRemote("http://hub-cloud.browserstack.com/wd/hub");

// Test case for the BrowserStack sample Android app. 
// If you have uploaded your app, update the test case here. 
driver.init(desiredCaps)
  .then(() => console.log("RUNNNING!"))
  // .then(function () {
  //   return driver.waitForElementByAccessibilityId('btc-welcomefirstscreen', asserters.isDisplayed, 30000);
  // })
  // .then(function (searchElement) {
  //   return searchElement.click();
  // })
  .fin(function () {
    // Invoke driver.quit() after the test is done to indicate that the test is completed.
    return driver.quit();
  })
  .done();
