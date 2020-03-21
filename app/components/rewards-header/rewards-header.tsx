import * as React from "react"
import { useEffect, useState } from "react"
import { Animated, StyleSheet } from "react-native"
import { color } from "../../theme"
import { translate } from "../../i18n"
import I18n from "i18n-js"
import { Button } from "react-native-elements"
import Svg, { Path } from "react-native-svg"
import { palette } from "../../theme/palette"


const RewardsGraphic = props => (
    <Svg viewBox="0 0 392.551 392.551" height={70} width={70} {...props} fill={color.primary}>
        <Path d="M278.635 255.871c35.62-25.665 58.893-67.491 58.893-114.618C337.528 63.354 274.174 0 196.275 0S55.023 63.354 55.023 141.253c0 47.127 23.273 88.953 58.893 114.618l-45.77 92.251c-1.939 3.879-1.422 8.469 1.422 11.83 2.78 3.297 7.176 4.719 11.378 3.491l32.388-9.244 12.218 31.354c1.552 4.008 5.301 6.853 9.632 6.982 2.069 0 7.24 0 10.279-6.012l50.812-102.529 50.877 102.529c1.875 3.685 5.624 6.012 9.762 6.012.129 0 7.758.711 10.149-6.982l12.218-31.354 32.388 9.244c4.202 1.164 8.598-.129 11.378-3.491 2.78-3.297 3.297-7.952 1.422-11.83l-45.834-92.251zm-141.77 98.78l-6.853-17.648c-2.004-5.236-7.822-8.016-13.123-6.465l-18.166 5.172 33.939-68.461c12.671 6.4 26.44 11.055 40.986 13.382l-36.783 74.02zM76.873 141.253c0-65.875 53.592-119.402 119.402-119.402s119.402 53.527 119.402 119.402-53.592 119.402-119.402 119.402S76.873 207.127 76.873 141.253zm198.853 189.22c-5.43-1.552-11.119 1.293-13.123 6.465l-6.853 17.648-36.719-74.085c14.545-2.327 28.251-6.982 40.986-13.382l33.875 68.461-18.166-5.107z" />
        <Path d="M277.924 114.036c-1.358-4.008-4.784-6.917-8.857-7.499l-43.507-6.335-19.459-39.434c-1.875-3.685-5.624-6.077-9.826-6.077s-7.952 2.392-9.826 6.077l-19.459 39.434-43.507 6.335c-4.073.646-7.499 3.491-8.792 7.434-1.293 3.943-.259 8.275 2.78 11.184l31.547 30.707-7.434 43.378c-.711 4.073.776 8.469 4.331 10.667 3.426 2.069 8.469 2.651 11.507.84l38.917-20.493 38.917 20.493c4.267 2.327 17.648-.711 15.515-12.994l-7.176-41.826 31.547-30.707c2.911-2.844 4.01-7.24 2.782-11.184zm-53.657 30.126c-2.521 2.457-3.685 6.077-3.168 9.632l4.655 27.216-24.436-12.8a10.843 10.843 0 00-10.149 0l-24.436 12.8 4.655-27.216c.646-3.556-.517-7.111-3.168-9.632l-19.782-19.265 27.345-3.943c3.556-.517 6.659-2.78 8.21-5.948l12.218-24.824 12.218 24.824c1.616 3.232 4.655 5.495 8.21 5.948l27.345 3.943-19.717 19.265z" />
    </Svg>
)

const styles = StyleSheet.create({
    header: {
        marginVertical: 40,
        alignItems: "center",
    },

    title: {
      fontWeight: "bold",
      marginHorizontal: 40,
      textAlign: "center",
      color: palette.darkGrey,
    },

    titleSats: {
        fontWeight: "bold",
        height: 40,
        marginHorizontal: 40,
        textAlign: "center",
        color: color.primary,
    },

    textButtonClose: {
        backgroundColor: palette.darkGrey,
        paddingHorizontal: 60,
        marginTop: 10,
    },
})

export const RewardsHeader = ({isRewardOpen, balance, close = () => {}}) => {

    const [animationRewardOpening] = useState(new Animated.Value(0))
    const [animationSats] = useState(new Animated.Value(0))

    useEffect(() => {
      Animated.timing(animationRewardOpening, {
        toValue: isRewardOpen,
        duration: 500,
        useNativeDriver: false,
      }).start()
    }, [isRewardOpen])

    useEffect(() => {
      if (!isRewardOpen) {
        animationSats.setValue(0)

        Animated.timing(animationSats, {
          toValue: 1,
          duration: 250,
          useNativeDriver: false,
        }).start()
      }
    }, [balance])

    return (
  <>
    <Animated.View style={styles.header}>
      {!isRewardOpen && <RewardsGraphic />}
      <Animated.Text
        style={[
          styles.title,
          {
            fontSize: animationRewardOpening.interpolate({
              inputRange: [0, 1],
              outputRange: [28, 0.01],
            }),
          },
        ]}
      >
        {translate("RewardsScreen.satAccumulated")}
      </Animated.Text>
      <Animated.Text style={[styles.titleSats,
        {
          fontSize: animationSats.interpolate({
            inputRange: [0, 0.3, 1],
            outputRange: [32, 38, 32],
          }),
        },
      ]}>
        {isRewardOpen
          ? `+${I18n.t("sat", {
            count: balance,
            formatted_number: I18n.toNumber(balance, { precision: 0 }),
          })}`
          : I18n.toNumber(balance, { precision: 0 })
        }
      </Animated.Text>
      {isRewardOpen && (
        <Button
          title={translate("common.close")}
          buttonStyle={styles.textButtonClose}
          onPress={() => close()}
        />
      )}
    </Animated.View>
  </>
)}
