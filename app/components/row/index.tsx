
import React, { } from "react";
import { View, ViewStyle } from "react-native";
interface RowProps { children: any, containerStyle?: ViewStyle | ViewStyle[] }
export const Row = (({ children, containerStyle }: RowProps) => {

    return (
        <View style={[{ flexDirection: 'row' }, containerStyle]}>
            {children}
        </View>
    )
})
