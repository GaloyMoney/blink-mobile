import { RootStackParamList } from '@app/navigation/stack-param-lists';
import { palette } from '@app/theme';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import {
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
} from 'react-native';
import { HeaderComponent } from '../../components/header';
import { HorizontalPostComponent } from '../../components/horizontal-post/horizontal-post-component';
import { LoadingComponent } from '../../components/loading-component';
import { TagComponent } from '../../components/tag-components';
import { getMyPost, getTags } from '../../graphql';
import { MarketplacePost, MarketplaceTag } from '../../models';
import { useI18nContext } from "@app/i18n/i18n-react"

export const MyPostScreen = () => {
    const { width } = useWindowDimensions()
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>()
    const { LL: t } = useI18nContext();

    const [posts, setPosts] = useState<MarketplacePost[]>([])
    const [filteredPosts, setFilteredPost] = useState<MarketplacePost[]>([])
    const [initTag, setInitTag] = useState<MarketplaceTag[]>([])
    const [selectedTag, setSelectedTag] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const renderPosts = ({ item }: { item: any }) => {
        return <HorizontalPostComponent
            isFullWidth
            showsStatus
            product={item}
            onItemPress={() => {
                navigation.navigate("PostDetail", { editable: false, postInfo: item, isMyPost: true })
            }}
            onLocationPress={() => {
            }}
            onDirectionPress={() => {
            }}
        />
    }

    const renderTagItem = ({ item }: { item: MarketplaceTag }) => {
        const onSelect = () => {
            let tempTags = [...selectedTag]
            let index = tempTags.findIndex((tag) => tag === item.slug)
            if (index === -1) tempTags.push(item.slug)
            else tempTags.splice(index, 1)
            setSelectedTag(tempTags)
        }
        return <TagComponent title={item.name}
            selectable
            onPress={onSelect}
            isSelected={selectedTag.findIndex((tag) => tag === item.slug) !== -1}
        />
    }

    useEffect(() => {
        getMyPost().then((res: any) => {
            setPosts(res)
        }).catch(err => {
            console.log('===err', err);

        })
            .finally(() => setIsLoading(false))

        getTags()
            .then((tags) => {
                setInitTag(tags)
            })
    }, [])

    useEffect(() => {
        let tempFilteredPost = posts.filter(post => {
            if (selectedTag.length === 0) return true
            

            const postSlugs = Object.values(post.tags?.map(tag => tag.slug)||{})

            const intersection = selectedTag.filter(element => postSlugs.includes(element));

            if (intersection.length) return true
            else return false
        })

        setFilteredPost(tempFilteredPost)
    }, [selectedTag.length, posts.length])
    
    return (
        <SafeAreaView style={styles.container}>
            <HeaderComponent style={{ paddingHorizontal: 20, width }}
                title={t.marketPlace.my_post()}
            />
            <View>
                <FlatList
                    data={initTag}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    renderItem={renderTagItem}
                    style={{ marginTop: 12 }}
                    ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
                    keyExtractor={(item) => item._id}
                    ListHeaderComponent={() => <View style={{ width: 20 }} />}
                />

            </View>
            <FlatList
                data={filteredPosts}
                renderItem={renderPosts}
                keyExtractor={post => post._id}
                style={{ marginHorizontal: 20 }}
                ListHeaderComponent={() => <View style={{ height: 20 }} />}
                ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                ListEmptyComponent={() => <Text style={styles.emptyText}>{t.marketPlace.you_dont_have_any_post()}</Text>}
            />
            <LoadingComponent isLoading={isLoading} />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    emptyText: { marginTop: 80, textAlign: 'center' },
    container: {
        flex: 1,
        backgroundColor: palette.lighterGrey,
    }
});