import { Row } from '@app/modules/market-place/components/row';
import React, { ReactNode, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ExpandIcon } from './ExpandIcon';


interface ExpandableFabProps {
    closeIcon: ReactNode;
    openIcon: ReactNode;
    menuIcons: FabMenuElement[];
    mainColor?: string;
    secondaryColor?: string;
}

interface FabMenuElement {
    name: string;
    icon?: ReactNode;
    text?: string;
    callback: () => void;
}

export const ExpandableFloatingAction = (props: ExpandableFabProps) => {
    const [open, setOpen] = useState(false);
    const [fadeIn] = useState(new Animated.Value(0))
    const [topOffsetY] = useState(new Animated.Value(40))

    const closeFab = () => {
        Animated.parallel([
            Animated.timing(
                fadeIn,
                {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true
                }
            ),
            Animated.timing(
                topOffsetY,
                {
                    toValue: 80,
                    duration: 300,
                    useNativeDriver: true
                }
            )
        ]).start();
        setOpen(false)
    }
    const openFab = () => {
        setOpen(true)
        Animated.parallel([
            Animated.timing(
                fadeIn,
                {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true
                }
            ),
            Animated.timing(
                topOffsetY,
                {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true
                }
            )
        ]).start()
    }

    const toggleFab = () => {
        if (open) {
            closeFab()
        } else {
            openFab()
        }
    }

    return (
        <View style={styles.container}>
            {props.menuIcons.map(menuElement => (open && !!menuElement ?
                <Animated.View
                    key={menuElement.name}
                    style={{
                        ...styles.smallContainerStyle,
                        opacity: fadeIn,
                        transform: [{ translateY: topOffsetY }]
                    }}>

                    <TouchableOpacity
                        onPress={() => {
                            toggleFab()
                            menuElement.callback()
                        }}
                        style={{
                            ...styles.mediumButton, ...styles.shadow,
                            backgroundColor: 'white'
                        }}>
                        <Row>
                            <Text>{menuElement.text}</Text>
                        </Row>
                    </TouchableOpacity>
                </Animated.View>
                : null)
            )}
            <TouchableOpacity onPress={() => toggleFab()}
                style={{
                    ...styles.mainButton, ...styles.shadow,
                    backgroundColor: 'white'
                }}>
                <ExpandIcon isOpen={open} />
            </TouchableOpacity>
        </View>

    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'column',
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
        marginRight: 20,
        marginBottom:10
    },
    mainButton: {
        padding: 10,
        borderRadius: 32,
        zIndex: 999,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
    },
    mediumButton: {
        borderRadius: 20,
        paddingVertical: 7,
        paddingHorizontal: 15,
        marginTop: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    smallContainerStyle: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center'
    },
    shadow: {
        shadowColor: 'rgba(0,0,0, 0.5)',
        shadowOffset: { height: 1, width: 1 },
        shadowOpacity: 1,
        shadowRadius: 3,
        elevation: 16,
    }

});
