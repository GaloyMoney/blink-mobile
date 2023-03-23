import * as React from "react"
import { Alert, Dimensions, Keyboard, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import Modal from "react-native-modal"

import CompleteSvg from "@app/modules/market-place/assets/svgs/complete.svg"
import XSvg from "@app/modules/market-place/assets/svgs/x.svg"
import { color } from "@app/theme"
import { fontSize } from "../../theme/typography"
import TextInputComponent from "../text-input-component"
import { useI18nContext } from "@app/i18n/i18n-react"
import { KeyboardAvoidingView } from "react-native"
import { LoadingComponent } from "../loading-component"
import { marketPlaceColor } from "../../theme/color"
import { PostAttributes } from "../../redux/reducers/store-reducer"
import { reportPost } from "../../graphql"

const { width, height } = Dimensions.get("window")
const MODAL_WIDTH = width - 25 * 2

type Props = {
  isVisible: boolean
  onClose: () => void
  post: PostAttributes
}

export const ReportPostModal = ({ isVisible, onClose, post }: Props) => {
  if (!post) return null

  const [reason, setReason] = React.useState("")
  const [reasonError, setReasonError] = React.useState("")

  const [isLoading, setIsLoading] = React.useState(false)
  const [isSubmitted, setIsSubmitted] = React.useState(false)

  const { LL: t } = useI18nContext()

  const isCorrectInput = () => {
    let reasonValid = false

    if (!reason?.trim().length)
      setReasonError("This cannot be empty")
    else {
      reasonValid = true
      setReasonError("")
    }

    return Boolean(reasonValid)
  }

  const onSubmit = async () => {
    if (isCorrectInput()) {
      setIsLoading(true)
      try {
        await reportPost({ postSlug: post.slug, reason })
        setIsSubmitted(true)
      } catch (error: any) {
        console.log('error---: ', error.message);
        Alert.alert(error.message || "This post has been reported")
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <Modal
      swipeDirection={["down"]}
      isVisible={isVisible}
      onSwipeComplete={onClose}
      onBackdropPress={onClose}
      swipeThreshold={50}
      propagateSwipe
      style={styles.modal}
    >
      <KeyboardAvoidingView
        behavior="position"
        enabled
      >
        <TouchableOpacity style={styles.container}
          activeOpacity={1}
          onPress={Keyboard.dismiss}
        >
          <TouchableOpacity
            style={styles.xIconContainer}
            onPress={onClose}
          >
            <XSvg />
          </TouchableOpacity>

          {!isSubmitted ? <View style={{justifyContent:'center',alignItems:'center'}}>
          
            <CompleteSvg stroke={color.primary} />
            <Text style={[styles.title, { color: 'black',marginVertical:30,fontWeight:'600' }]}>Thank you for submitting this post</Text>
            <Text style={{textAlign:'center'}}>We will review it shortly and remove if it violate any of our policy</Text>
          </View>: <>

            <Text style={styles.title}>Report</Text>
            <Text style={{ marginVertical: 15 }}>Tell us what is wrong with this post</Text>
            <TextInputComponent
              onChangeText={setReason}
              value={reason}
              placeholder={"What's going on"}
              isError={reasonError !== ""}
              containerStyle={{ width: MODAL_WIDTH - 24, marginTop: 10 }}

              textField={true}
            />
            {reasonError ? (
              <Text style={styles.errorText}>{reasonError}</Text>
            ) : null}
            <TouchableOpacity style={styles.submitButton} onPress={onSubmit}>
              <Text style={styles.submitText}>{t.marketPlace.submit()}</Text>
            </TouchableOpacity>
          </>}
        </TouchableOpacity>
      </KeyboardAvoidingView>

      <LoadingComponent isLoading={isLoading} />
    </Modal>
  )
}

const styles = StyleSheet.create({
  errorText: {
    fontSize: fontSize.font12,
    color: marketPlaceColor.darkPink,
  },
  submitText: {
    color: "white",
    fontSize: fontSize.font14,
  },
  submitButton: {
    backgroundColor: color.primary,
    alignSelf: "flex-end",
    paddingHorizontal: 15,
    paddingVertical: 5,
    marginVertical: 15,
    borderRadius: 22,
  },
  title: { fontWeight: "400", fontSize: fontSize.font20 },
  xIconContainer: {
    backgroundColor: "#ECEDFF",
    width: 30,
    height: 30,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "flex-end",
  },
  container: {
    width: MODAL_WIDTH,
    padding: 15,
    borderRadius: 11,
    backgroundColor: "white",

  },
  modal: {
    flex: 1,
    alignItems: "center",
  },
})