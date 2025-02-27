import { GaloyErrorBox } from "@app/components/atomic/galoy-error-box"
import { useAppConfig } from "@app/hooks"
import { useI18nContext } from "@app/i18n/i18n-react"
import { SetAddressError } from "@app/types/errors"
import { Button, makeStyles, useTheme } from "@rneui/themed"
import { KeyboardAvoidingView, View, Text, TextInput } from "react-native"
import Modal from "react-native-modal"

export type SetUserNameUIProps = {
  isVisible: boolean
  toggleModal: () => void
  onSetLightningAddress: () => void
  loading: boolean
  error?: SetAddressError
  lnAddress: string
  setLnAddress?: (lightningAddress: string) => void
}

export const SetUserNameUI = ({
  isVisible,
  onSetLightningAddress,
  lnAddress,
  setLnAddress,
  error,
}: SetUserNameUIProps) => {
  const {
    appConfig: {
      galoyInstance: { name: bankName },
    },
  } = useAppConfig()
  const {
    theme: { colors },
  } = useTheme()
  const { LL } = useI18nContext()

  const styles = useStyles()

  const setLightningAddress = () => {
    onSetLightningAddress()
  }

  let errorMessage = ""
  switch (error) {
    case SetAddressError.TOO_SHORT:
      errorMessage = LL.SetAddressModal.Errors.tooShort()
      break
    case SetAddressError.TOO_LONG:
      errorMessage = LL.SetAddressModal.Errors.tooLong()
      break
    case SetAddressError.INVALID_CHARACTER:
      errorMessage = LL.SetAddressModal.Errors.invalidCharacter()
      break
    case SetAddressError.ADDRESS_UNAVAILABLE:
      errorMessage = LL.SetAddressModal.Errors.addressUnavailable()
      break
    case SetAddressError.UNKNOWN_ERROR:
      errorMessage = LL.SetAddressModal.Errors.unknownError()
      break
  }

  return (
    <Modal
      isVisible={isVisible}
      backdropOpacity={100}
      backdropColor={colors.background}
      style={styles.modalStyle}
    >
      <KeyboardAvoidingView behavior="position" enabled>
        <View style={styles.helloContainer}>
          <Text style={styles.helloText}>{LL.SetAddressModal.helloText()}</Text>
        </View>
        <View style={styles.bodyStyle}>
          <Text style={styles.textStyle}>{LL.SetAddressModal.whoAreYou()}</Text>
          <Text style={styles.subTextStyle}>
            {LL.SetAddressModal.usernameHint({ bankName })}
          </Text>
          <View style={styles.textInputContainerStyle}>
            <TextInput
              autoCorrect={false}
              autoComplete="off"
              autoCapitalize="none"
              style={styles.textInputStyle}
              onChangeText={setLnAddress}
              value={lnAddress}
              placeholder={LL.SetAddressModal.placeholder()}
              placeholderTextColor={colors.grey3}
              keyboardType="default"
            />
          </View>
          {errorMessage && <GaloyErrorBox errorMessage={errorMessage} />}
          <Button onPress={setLightningAddress}>{LL.SetAddressModal.save()}</Button>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

const useStyles = makeStyles(({ colors }) => ({
  modalStyle: {
    maxHeight: "100%",
  },
  helloContainer: {
    alignSelf: "center",
    top: -70,
  },
  helloText: {
    fontSize: 96,
    color: colors.primary,
  },
  bodyStyle: {
    alignItems: "stretch",
    rowGap: 20,
    display: "flex",
    height: "30%",
    marginTop: 50,
    flexDirection: "column",
    justifyContent: "space-between",
    alignContent: "center",
    alignSelf: "center",
  },
  textStyle: {
    color: colors.primary,
    fontSize: 24,
    marginTop: 20,
    height: 50,
    width: "100%",
  },
  subTextStyle: {
    textAlign: "center",
    fontSize: 13,
    color: colors.grey1,
  },
  textInputContainerStyle: {
    display: "flex",
    flexDirection: "column",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    minHeight: 60,
    backgroundColor: colors.grey5,
  },
  textInputStyle: {
    paddingTop: 0,
    paddingBottom: 0,
    flex: 1,
    fontSize: 18,
    lineHeight: 18,
    color: colors.black,
  },
}))
