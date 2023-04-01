import { palette } from '@app/theme';
import React, { useEffect, useState } from 'react';
import {
    Animated,
    StyleSheet,
    View,
} from 'react-native';
import Icon from "react-native-vector-icons/Ionicons"

type Props = {
    isOpen: boolean
}

export const ExpandIcon = ({isOpen}: Props) => {

    const [rotate] = useState(new Animated.Value(1))
    const spin = rotate.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '45deg']
      }) 
    
    useEffect(() => {
        const toValue = isOpen ? 0 : 1

        Animated.timing(
            rotate,
            {
                toValue: toValue,
                duration: 300,
                useNativeDriver: true,
            }
        ).start();
    }, [isOpen])
    return (
        <Animated.View style={[styles.container,{
            transform: [{ rotate: spin }]
        }]}>
            <Icon name='close' size={30} color={palette.primaryButtonColor}/>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: 30, height: 30,
        justifyContent: 'center', alignItems: 'center'
    }
});