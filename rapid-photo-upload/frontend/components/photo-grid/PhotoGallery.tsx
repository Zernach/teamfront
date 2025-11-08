import React from 'react';
import { View, StyleSheet } from 'react-native';
import { PhotoGrid } from './PhotoGrid';
import { Photo } from '../../types';

interface PhotoGalleryProps {
  onPhotoPress?: (photo: Photo) => void;
}

export function PhotoGallery({ onPhotoPress }: PhotoGalleryProps) {
  return (
    <View style={styles.container}>
      <PhotoGrid onPhotoPress={onPhotoPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

