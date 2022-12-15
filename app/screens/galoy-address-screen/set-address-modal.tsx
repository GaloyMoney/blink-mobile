import { useI18nContext } from "@app/i18n/i18n-react"
import { palette } from "@app/theme"
import { useMutation } from "@galoymoney/client"
import React from "react"
import { Modal, Platform, StatusBar, TouchableWithoutFeedback, View } from "react-native"
import { Button, Input, Text } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"
import crashlytics from "@react-native-firebase/crashlytics"
import { CustomIcon } from "@app/components/custom-icon"
import { useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import useMainQuery from "@app/hooks/use-main-query"

const styles = EStyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: palette.white,
    borderRadius: 20,
    padding: 35,
    shadowColor: palette.midGrey,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "90%",
    marginTop: Platform.OS === "android" ? StatusBar.currentHeight : 40,
  },
  buttonStyle: {
    backgroundColor: palette.primaryButtonColor,
    color: palette.white,
    marginTop: 32,
  },
  cancelTextContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  cancelText: {
    color: palette.primaryButtonColor,
  },
  errorStyle: {
    color: palette.error,
    marginTop: 16,
  },
  explainerText: {
    fontFamily: "Roboto",
    fontStyle: "normal",
    fontWeight: "400",
    fontSize: 15,
    lineHeight: 24,
  },
  titleText: {
    fontFamily: "Roboto",
    fontStyle: "normal",
    fontWeight: "500",
    fontSize: 18,
    lineHeight: 24,
    color: palette.lapisLazuli,
  },
  newAddressContainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: palette.inputBackground,
    borderRadius: 8,
    height: 50,
    marginTop: 16,
  },
  newAddressText: {
    fontFamily: "Roboto",
    fontStyle: "normal",
    fontWeight: "500",
    fontSize: 18,
    lineHeight: 24,
    color: palette.lapisLazuli,
  },
  backText: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  rightIconTextStyle: {
    color: palette.secondaryText,
  },
  inputContainerStyle: {
    backgroundColor: palette.inputBackground,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    overflow: "hidden",
    borderColor: palette.inputBackground,
  },
  containerStyle: { paddingLeft: 0, paddingRight: 0 },
  fieldLabelStyle: {
    color: palette.inputLabel,
    fontSize: 18,
    lineHeight: 24,
    fontFamily: "Roboto",
    fontWeight: "500",
    marginBottom: 16,
  },
})

type SetAddressModalProps = {
  modalVisible: boolean
  toggleModal?: () => void
}

export const SetAddressModal = ({ modalVisible, toggleModal }: SetAddressModalProps) => {
  const { LL } = useI18nContext()
  const { refetch: refetchMainQuery } = useMainQuery()
  const [address, setAddress] = React.useState("")
  const [error, setError] = React.useState("")
  const [newAddress, setNewAddress] = React.useState("")
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>()

  const [updateUsername, { loading }] = useMutation.userUpdateUsername({
    onError: (error) => {
      setError(LL.GaloyAddressScreen.somethingWentWrong())
      crashlytics().recordError(error)
    },
    onCompleted: (result) => {
      if (result.userUpdateUsername.errors.length > 0) {
        if (result.userUpdateUsername.errors[0].message === "username not available") {
          setError(LL.GaloyAddressScreen.addressNotAvailable({ bankName: "BBW" }))
        } else {
          crashlytics().recordError(
            new Error(result.userUpdateUsername.errors[0].message),
          )
          setError(LL.GaloyAddressScreen.somethingWentWrong())
        }
      } else if (result.userUpdateUsername.user) {
        setNewAddress(result.userUpdateUsername.user.username)
        refetchMainQuery()
      }
    },
  })

  const handleSubmit = async () => {
    setError("")
    await updateUsername({
      variables: {
        input: {
          username: address,
        },
      },
    })
  }

  const handleOnChangeText = (value) => {
    setError("")
    setAddress(value)
  }
  return (
    <View style={styles.centeredView}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          toggleModal()
        }}
      >
        <View style={styles.modalView}>
          {!newAddress && (
            <>
              <Input
                rightIcon={<Text style={styles.rightIconTextStyle}>@pay.galoy.io</Text>}
                inputContainerStyle={styles.inputContainerStyle}
                containerStyle={styles.containerStyle}
                onChangeText={handleOnChangeText}
                autoComplete={"off"}
                label={LL.GaloyAddressScreen.buttonTitle({ bankName: "BBW" })}
                labelStyle={styles.fieldLabelStyle}
              />
              {!error && (
                <Text style={styles.explainerText}>
                  {LL.GaloyAddressScreen.notAbleToChange({ bankName: "BBW" })}
                </Text>
              )}
              {error && (
                <Text style={styles.errorStyle}>
                  <CustomIcon name="custom-error-icon" color={palette.error} /> {error}
                </Text>
              )}
              <Button
                title={LL.GaloyAddressScreen.buttonTitle({ bankName: "BBW" })}
                buttonStyle={styles.buttonStyle}
                loading={loading}
                onPress={() => handleSubmit()}
                disabled={!address || Boolean(error)}
              />
              <View style={styles.cancelTextContainer}>
                <TouchableWithoutFeedback onPress={() => toggleModal()}>
                  <Text style={styles.cancelText}>{LL.common.cancel()}</Text>
                </TouchableWithoutFeedback>
              </View>
            </>
          )}
          {newAddress && (
            <View>
              <Text style={styles.titleText}>
                {LL.GaloyAddressScreen.yourAddress({ bankName: "BBW" })}
              </Text>
              <View style={styles.newAddressContainer}>
                <Text style={styles.newAddressText}>{newAddress}@pay.bbw.sv</Text>
              </View>
              <Button
                title={LL.MoveMoneyScreen.title()}
                buttonStyle={styles.buttonStyle}
                onPress={() => navigation.popToTop()}
              />
              <TouchableWithoutFeedback onPress={() => toggleModal()}>
                <View style={styles.backText}>
                  <Text style={styles.cancelText}>{LL.common.back()}</Text>
                </View>
              </TouchableWithoutFeedback>
            </View>
          )}
        </View>
      </Modal>
    </View>
  )
}
