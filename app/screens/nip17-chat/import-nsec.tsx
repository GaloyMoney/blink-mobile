import React, { useState } from "react"
import { useTheme, Text, Input, Button } from "@rneui/themed"
import { View, StyleSheet, Alert, Dimensions } from "react-native"
import ReactNativeModal from "react-native-modal"
import * as Keychain from "react-native-keychain"
import { useUserUpdateNpubMutation } from "@app/graphql/generated"
import { getPublicKey, nip19 } from "nostr-tools"

interface ImportNsecModalProps {
  isActive: boolean
  onCancel: () => void
  onSubmit: () => void
}

const KEYCHAIN_NOSTRCREDS_KEY = "nostr_creds_key"

export const ImportNsecModal: React.FC<ImportNsecModalProps> = ({
  isActive,
  onCancel,
  onSubmit,
}) => {
  const {
    theme: { colors },
  } = useTheme()

  const [nsec, setNsec] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [userUpdateNpubMutation] = useUserUpdateNpubMutation()

  const handleInputChange = (text: string) => {
    setNsec(text)
    setError(null)
  }

  const validateNsec = (nsec: string) => {
    const bech32Pattern = /^nsec1[a-z0-9]{58}$/ // Bech32 encoding with 'nsec1' prefix and 39 characters
    return bech32Pattern.test(nsec)
  }

  const handleSubmit = async () => {
    if (!nsec) {
      setError("nsec cannot be empty")
      return
    }

    if (!validateNsec(nsec)) {
      setError("Invalid nsec format. Please check the key and try again.")
      return
    }

    try {
      // Save the nsec key to the keychain
      await Keychain.setInternetCredentials(
        KEYCHAIN_NOSTRCREDS_KEY,
        KEYCHAIN_NOSTRCREDS_KEY,
        nsec,
      )
      await userUpdateNpubMutation({
        variables: {
          input: {
            npub: nip19.npubEncode(getPublicKey(nip19.decode(nsec).data as Uint8Array)),
          },
        },
      })

      Alert.alert("Success", "nsec imported successfully!")
      onCancel() // Close the modal after saving
      onSubmit()
    } catch (error) {
      console.error("Failed to save nsec to keychain", error)
      setError("Failed to import nsec. Please try again.")
    }
  }

  return (
    <ReactNativeModal
      isVisible={isActive}
      backdropColor={colors.grey5}
      backdropOpacity={0.7}
      onBackButtonPress={onCancel}
      onBackdropPress={onCancel}
      style={styles.modalStyle}
    >
      <View style={styles.modalBody}>
        <Text style={styles.title}>Import Your nsec Key</Text>
        <Text style={styles.description}>
          You are logged into another device. Please import your nsec from the other
          device to continue using the chat feature.
        </Text>

        <Input
          label="nsec Key"
          value={nsec}
          onChangeText={handleInputChange}
          placeholder="Enter your nsec key"
          errorMessage={error || ""}
          containerStyle={styles.inputContainer}
          inputStyle={styles.input}
          labelStyle={styles.inputLabel}
          errorStyle={styles.errorText}
        />

        <Button
          title="Submit"
          onPress={handleSubmit}
          disabled={!nsec || error !== null}
          buttonStyle={styles.submitButton}
          titleStyle={styles.submitButtonText}
        />
      </View>
    </ReactNativeModal>
  )
}

const styles = StyleSheet.create({
  modalStyle: {
    justifyContent: "flex-end",
  },
  modalBody: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    maxWidth: 350,
    alignSelf: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    color: "#333",
  },
  description: {
    fontSize: 14,
    color: "#555",
    marginBottom: 20,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 20,
    width: 250,
  },
  inputLabel: {
    fontSize: 14,
    color: "#333",
  },
  input: {
    fontSize: 14,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    backgroundColor: "#f9f9f9",
    height: 10,
  },
  errorText: {
    fontSize: 12,
    color: "#d9534f",
  },
  submitButton: {
    backgroundColor: "#007bff",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
})
