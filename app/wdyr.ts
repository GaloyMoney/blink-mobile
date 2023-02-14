// importing why-did-you-render types
// eslint-disable-next-line
/// <reference types="@welldone-software/why-did-you-render" />

import React from "react"

if (process.env.NODE_ENV === "development") {
  // eslint-disable-next-line
  const whyDidYouRender = require("@welldone-software/why-did-you-render")
  whyDidYouRender(React, {
    trackAllPureComponents: false,
  })
}
