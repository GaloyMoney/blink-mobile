import { View } from "react-native"
import Modal from "react-native-modal"

import { makeStyles, useTheme, Text } from "@rneui/themed"

import Icon from "react-native-vector-icons/Ionicons"
import { GaloyIconButton } from "../atomic/galoy-icon-button"
import { useI18nContext } from "@app/i18n/i18n-react"
import { GaloyIcon } from "../atomic/galoy-icon"

type Props = {
  isVisible: boolean
  setIsVisible: (isVisible: boolean) => void
}

export const SpherePointsModal: React.FC<Props> = ({ isVisible, setIsVisible }) => {
  const { LL } = useI18nContext()

  const {
    theme: { colors },
  } = useTheme()
  const styles = useStyles()

  const acknowledgeModal = () => {
    setIsVisible(false)
  }

  return (
    <Modal
      isVisible={isVisible}
      backdropOpacity={0.8}
      backdropColor={colors.white}
      onBackdropPress={acknowledgeModal}
    >
      <View style={styles.modalCard}>
        <View style={styles.containerStyle}>
          <View style={styles.cross}>
            <GaloyIconButton name="close" size="medium" onPress={acknowledgeModal} />
          </View>
          <Icon name="globe-outline" color={colors.primary} size={50} />
          <View style={styles.cardTitleContainer}>
            <Text type="h1" bold>
              {LL.Circles.Sphere.yourSpherePoints()}
            </Text>
            <Text style={styles.textCenter} type="p1">
              {LL.Circles.Sphere.spherePointsDescription()}
            </Text>
          </View>
          <View style={styles.circleExplanationContainer}>
            <Person
              plus={50}
              circleName={LL.Circles.Sphere.innerCircle()}
              degreeName={LL.Circles.Sphere.firstDegree()}
            />
            <Icon name="arrow-forward" color={colors.black} size={25} />
            <Person
              plus={50}
              circleName={LL.Circles.Sphere.outerCircle()}
              degreeName={LL.Circles.Sphere.secondDegree()}
            />
            <Icon name="arrow-forward" color={colors.black} size={25} />
            <Person
              plus={25}
              circleName={LL.Circles.Sphere.yourSphere()}
              degreeName={LL.Circles.Sphere.thirdDegree()}
            />
          </View>
        </View>
      </View>
    </Modal>
  )
}

type PersonProps = {
  plus: number
  circleName: string
  degreeName: string
}
const Person: React.FC<PersonProps> = ({ plus, circleName, degreeName }) => {
  const {
    theme: { colors },
  } = useTheme()
  const styles = useStyles()

  return (
    <View style={styles.personContainer}>
      <View>
        <GaloyIcon name="user" color={colors.black} size={40} />
        <Text style={styles.personPlusNumber} color={colors.green}>
          +{plus}
        </Text>
      </View>
      <Text>{circleName}</Text>
      <Text>({degreeName})</Text>
    </View>
  )
}

const useStyles = makeStyles(({ colors }) => ({
  containerStyle: {
    padding: 20,
    display: "flex",
    flexDirection: "column",
    rowGap: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  textCenter: {
    textAlign: "center",
  },
  peopleIcon: {
    color: colors.primary,
  },
  cross: {
    position: "absolute",
    top: -20,
    right: 20,
  },
  modalCard: {
    backgroundColor: colors.grey5,
    borderRadius: 16,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 30,
  },
  cardTitleContainer: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    rowGap: 10,
    paddingHorizontal: 10,
  },
  circleExplanationContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    columnGap: 8,
  },
  personContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    rowGap: 3,
  },
  personPlusNumber: {
    position: "absolute",
    right: -28,
  },
}))
