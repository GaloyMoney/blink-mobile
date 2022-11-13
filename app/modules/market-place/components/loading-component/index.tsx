import React from "react"
import { StyleSheet, View, ActivityIndicator } from "react-native"

export const LoadingComponent = ({ isLoading }) => {
  return (
    <>
      {isLoading && (
        <View
          style={[
            {
              backgroundColor: "rgba(12, 12, 12, 0.7)",
              justifyContent: "center",
              alignItems: "center",
            },
            StyleSheet.absoluteFill,
          ]}
        >
          <ActivityIndicator size={"large"} color={"white"} />
        </View>
      )}
    </>
  )
}
