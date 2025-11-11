import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, RefreshControl } from 'react-native';
import { usePhotosInfinite } from '../../hooks/api';
import { Photo } from '../../types';
import { formatRelativeTime } from '../../utils';
import { COLORS } from '../../constants/colors';

interface PhotoGridProps {
  onPhotoPress?: (photo: Photo) => void;
}

export function PhotoGrid({ onPhotoPress }: PhotoGridProps) {
  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
  } = usePhotosInfinite(20);

  // Flatten paginated data and filter out null/undefined items
  const photos = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages
      .flatMap((page) => page.photos || [])
      .filter((photo): photo is Photo => photo != null && photo.id != null);
  }, [data]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const renderPhoto = useCallback(
    ({ item }: { item: Photo }) => {
      // Additional safety check (shouldn't be needed due to filtering, but defensive)
      if (!item || !item.id) {
        return null;
      }
      
      // Determine image URI - prefer thumbnail, fallback to main URL
      const imageUri = item.thumbnailUrl || item.url;
      
      return (
        <TouchableOpacity
          style={styles.photoCard}
          onPress={() => onPhotoPress?.(item)}
          activeOpacity={0.8}
        >
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={styles.photoImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderContainer}>
              <Text style={styles.placeholderText}>
                {item.status === 'COMPLETED' ? 'No image' : item.status}
              </Text>
            </View>
          )}
          <View style={styles.photoOverlay}>
            <Text style={styles.photoFilename} numberOfLines={1}>
              {item.filename || 'Untitled'}
            </Text>
            <Text style={styles.photoDate}>
              {formatRelativeTime(item.uploadedAt)}
            </Text>
          </View>
          {item.status && item.status !== 'COMPLETED' && (
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
          )}
        </TouchableOpacity>
      );
    },
    [onPhotoPress]
  );

  const renderFooter = useCallback(() => {
    if (isFetchingNextPage) {
      return (
        <View style={styles.footer}>
          <Text style={styles.loadingText}>Loading more...</Text>
        </View>
      );
    }
    return null;
  }, [isFetchingNextPage]);

  if (isLoading && photos.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading photos...</Text>
      </View>
    );
  }

  if (photos.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No photos yet</Text>
        <Text style={styles.emptySubtext}>Upload your first photo to get started</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={photos}
      renderItem={renderPhoto}
      keyExtractor={(item) => item.id}
      numColumns={3}
      contentContainerStyle={styles.grid}
      style={styles.list}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5}
      ListFooterComponent={renderFooter}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
      }
      columnWrapperStyle={styles.row}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    backgroundColor: COLORS.background,
  },
  grid: {
    padding: 8,
    backgroundColor: COLORS.background,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  photoCard: {
    width: '32%',
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: COLORS.background99,
    position: 'relative',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 8,
  },
  photoFilename: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  photoDate: {
    color: COLORS.white,
    fontSize: 10,
    opacity: 0.8,
  },
  statusBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: COLORS.red,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: COLORS.background,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.grey,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: COLORS.background,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.grey,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  placeholderContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.background99,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: COLORS.grey,
    fontSize: 12,
    textAlign: 'center',
  },
});
