import * as React from "react"
// eslint-disable-next-line react-native/split-platform-components
import {
    Dimensions,
    FlatList,
    Image,
    TouchableOpacity,
} from "react-native"

import WarningSvg from "@app/modules/market-place/assets/svgs/warning.svg"

import { PostAttributes } from "@app/modules/market-place/redux/reducers/store-reducer"
import { View } from "react-native"
import { HeaderComponent } from "@app/modules/market-place/components/header"
import { EditButton } from "./EditButton"
import { color } from "@app/theme"
import { Animated } from "react-native"
import { ExpandingDot } from "react-native-animated-pagination-dots"

const { width, height } = Dimensions.get("window")

type Props = {
    post: PostAttributes
    thumbnail: string
    editable: boolean
    isMyPost?: boolean
    setIsReportVisible: (value: boolean) => void
}

export const PostDetailHeader = ({ post, thumbnail, editable, setIsReportVisible, isMyPost }: Props) => {


    const [data, setData] = React.useState([])
    const scrollX = React.useRef(new Animated.Value(0)).current;

    const renderImage = ({ item }: { item: string | any }) => {
        const isUrl = typeof item === 'string'
        return <Image source={isUrl ? { uri: item } : item} style={{
            width,
            height: height * 0.3,
            borderRadius: 8,
        }} />
    }

    React.useEffect(() => {

        // set thumbnail as first item in list
        // remove duplicate thumbnail url 
        const newData = [thumbnail, ...(post.imagesUrls?.filter(url => url !== thumbnail) || [])]

        setData(newData)

    }, [post])

    return (
        <View style={{ overflow: "visible" }}>
            <FlatList
                data={data}
                renderItem={renderImage}
                keyExtractor={url => url}
                horizontal
                style={{ flexGrow: 0 }}
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                bounces={false}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                    {
                        useNativeDriver: false,
                    }
                )}
                decelerationRate={'normal'}
                scrollEventThrottle={16}
            />
            {data?.length > 1 &&
                <ExpandingDot
                    data={data}
                    expandingDotWidth={30}
                    scrollX={scrollX}
                    inActiveDotOpacity={0.6}
                    dotStyle={{
                        width: 10,
                        height: 10,
                        backgroundColor: color.primary,
                        borderRadius: 5,
                        marginHorizontal: 5
                    }}
                    containerStyle={{
                        bottom: 15,
                    }}
                />
            }
            <View style={{ position: 'absolute', top: 0, width: "100%" }}>
                <HeaderComponent
                    style={{ paddingHorizontal: 20, marginTop: 10 }}
                    rightComponent={
                        editable ? (
                            <EditButton />
                        ) : (isMyPost ? null : (<TouchableOpacity
                            style={{ backgroundColor: color.primary, borderRadius: 100 }}
                            onPress={() => setIsReportVisible(true)}
                        >
                            <WarningSvg fill={"white"} width={28} height={28} />
                        </TouchableOpacity>))
                    }
                />
            </View>
        </View>
    )
}
