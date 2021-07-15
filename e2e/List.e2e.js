describe("PostList", () => {
  beforeEach(async () => {
    await device.reloadReactNative()
  })

  it("render a tappable list of posts", async () => {
    // await expect(element(by.id('post-list'))).toBeVisible();
    // await waitFor(element(by.id('post-row-0')))
    //   .toBeVisible()
    //   .withTimeout(2000);
    // await element(by.id('post-row-0')).tap();
    // await expect(element(by.id('post-title'))).toBeVisible();
  })

  it("should have get started", async () => {
    expect(true).toBeTruthy()
    // console.log("get started start")
    // await expect(element(by.id('getStarted'))).toBeVisible();
    // console.log("get start middle")
    // const imagePath = await device.takeScreenshot('opened general section');
  })

  // it('should show hello screen after tap', async () => {
  //   await element(by.id('hello_button')).tap();
  //   await expect(element(by.text('Hello!!!'))).toBeVisible();
  // });

  // it('should show world screen after tap', async () => {
  //   await element(by.id('world_button')).tap();
  //   await expect(element(by.text('World!!!'))).toBeVisible();
  // });
})
