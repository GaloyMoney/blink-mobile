import React from "react"

import { Story, UseCase } from "../../../../.storybook/views"
import GaloySliderButton from "./galoy-slider-button"

export default {
  title: "Galoy Slider Button",
  component: GaloySliderButton,
}

export const Default = () => {
  const [loading, setLoading] = React.useState(false)
  const [loading2, setLoading2] = React.useState(false)

  return (
    <Story>
      <UseCase text="Default">
        <GaloySliderButton
          isLoading={loading}
          initialText="Slide to confirm"
          loadingText="Confirming..."
          onSwipe={() => setLoading(true)}
        />
      </UseCase>
      <UseCase text="Disabled slider">
        <GaloySliderButton
          isLoading={loading2}
          disabled={true}
          initialText="Disabled"
          loadingText="..."
          onSwipe={() => setLoading2(true)}
        />
      </UseCase>
    </Story>
  )
}
