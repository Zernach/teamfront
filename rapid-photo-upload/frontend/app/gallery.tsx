import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Screen } from '../components/screen';
import { Header } from '../components/header';
import { PhotoGallery } from '../components/photo-grid';
import { COLORS } from '../constants/colors';
import { Photo } from '../types';
import { useRouter } from 'expo-router';

export default function GalleryScreen() {
  const router = useRouter();

  const handlePhotoPress = (photo: Photo) => {
    // Navigate to photo detail view if needed
    // For now, just log it
    console.log('Photo pressed:', photo.id);
  };

  return (
    <Screen style={styles.container}>
      <Header title="Photo Gallery" />
      <PhotoGallery onPhotoPress={handlePhotoPress} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
});

