import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { isValidImageFile, isValidFileSize, generateUploadId, imagePickerResultToFile } from '../../utils';
import { useAppDispatch } from '../../hooks/redux';
import { addToQueue } from '../../store/uploadSlice';
import { COLORS } from '../../constants/colors';

interface FileSelectionProps {
  maxFiles?: number;
  maxFileSizeMB?: number;
  onFilesSelected?: (files: File[]) => void;
}

export function FileSelection({
  maxFiles = 100,
  maxFileSizeMB = 50,
  onFilesSelected,
}: FileSelectionProps) {
  const [dragActive, setDragActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const validFiles: File[] = [];
      const errors: string[] = [];

      // Validate files
      fileArray.forEach((file) => {
        if (!isValidImageFile(file)) {
          errors.push(`${file.name}: Not an image file`);
          return;
        }
        if (!isValidFileSize(file, maxFileSizeMB)) {
          errors.push(`${file.name}: File size exceeds ${maxFileSizeMB}MB`);
          return;
        }
        validFiles.push(file);
      });

      // Check total count
      if (validFiles.length > maxFiles) {
        errors.push(`Maximum ${maxFiles} files allowed`);
        validFiles.splice(maxFiles);
      }

      // Add valid files to upload queue
      validFiles.forEach((file) => {
        const uploadId = generateUploadId();
        dispatch(addToQueue({ id: uploadId, file }));
      });

      if (onFilesSelected) {
        onFilesSelected(validFiles);
      }

      // Display errors if any
      if (errors.length > 0) {
        console.warn('File validation errors:', errors);
        // TODO: Show error toast/notification
      }
    },
    [maxFiles, maxFileSizeMB, dispatch, onFilesSelected]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFiles(e.target.files);
        // Reset input to allow selecting same file again
        if (e.target) {
          e.target.value = '';
        }
      }
    },
    [handleFiles]
  );

  const openFileDialog = useCallback(() => {
    if (Platform.OS === 'web' && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  // Native platform image picker handlers
  const requestPermissions = useCallback(async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Sorry, we need camera roll permissions to upload photos!',
          [{ text: 'OK' }]
        );
        return false;
      }
    }
    return true;
  }, []);

  const pickImagesFromLibrary = useCallback(async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      setIsLoading(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 1,
        selectionLimit: maxFiles,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Convert image picker results to File objects
        const filePromises = result.assets.map((asset) =>
          imagePickerResultToFile(asset.uri, asset.fileName || undefined)
        );
        const files = await Promise.all(filePromises);
        handleFiles(files);
      }
    } catch (error) {
      console.error('Error picking images:', error);
      Alert.alert('Error', 'Failed to select images. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [requestPermissions, maxFiles, handleFiles]);

  const takePhoto = useCallback(async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Sorry, we need camera permissions to take photos!',
          [{ text: 'OK' }]
        );
        return;
      }
    }

    try {
      setIsLoading(true);
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const file = await imagePickerResultToFile(asset.uri, asset.fileName || undefined);
        handleFiles([file]);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [handleFiles]);

  const showImagePickerOptions = useCallback(() => {
    if (Platform.OS === 'web') return;

    Alert.alert(
      'Select Photos',
      'Choose an option',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Library', onPress: pickImagesFromLibrary },
      ],
      { cancelable: true }
    );
  }, [takePhoto, pickImagesFromLibrary]);

  if (Platform.OS !== 'web') {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={[styles.nativeButton, isLoading && styles.nativeButtonDisabled]}
          onPress={showImagePickerOptions}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={COLORS.white} />
              <Text style={styles.nativeButtonText}>Processing...</Text>
            </View>
          ) : (
            <>
              <Text style={styles.nativeButtonText}>Select Photos</Text>
              <Text style={styles.nativeButtonSubtext}>
                Maximum {maxFiles} files, {maxFileSizeMB}MB per file
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  // Web-specific drag handlers
  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  return (
    <View style={styles.container}>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileInputChange}
      />
      {/* @ts-ignore - Web-specific div with drag handlers */}
      <div
        style={{
          borderWidth: 2,
          borderStyle: 'dashed',
          borderColor: dragActive ? COLORS.primary : COLORS.tan50,
          borderRadius: 8,
          padding: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: dragActive ? COLORS.primary20 : COLORS.background99,
          minHeight: 200,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
        onClick={openFileDialog}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <Text style={styles.dropZoneText}>
          {dragActive ? 'Drop files here' : 'Drag and drop files here or click to browse'}
        </Text>
        <Text style={styles.dropZoneSubtext}>
          Maximum {maxFiles} files, {maxFileSizeMB}MB per file
        </Text>
      </div>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  dropZone: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.tan50,
    borderRadius: 8,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background99,
    minHeight: 200,
    cursor: 'pointer',
  },
  dropZoneActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary20,
  },
  dropZoneText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: 8,
    textAlign: 'center',
  },
  dropZoneSubtext: {
    fontSize: 14,
    color: COLORS.grey,
    textAlign: 'center',
  },
  nativeButton: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.primary,
    borderRadius: 8,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background99,
    minHeight: 120,
  },
  nativeButtonDisabled: {
    opacity: 0.6,
  },
  nativeButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: 8,
    textAlign: 'center',
  },
  nativeButtonSubtext: {
    fontSize: 14,
    color: COLORS.grey,
    textAlign: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

