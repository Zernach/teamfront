import React, { useState, useCallback } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { FileSelection } from './FileSelection';
import { useAppSelector } from '../../hooks/redux';

export function FileSelectionWithPreview() {
  const [previews, setPreviews] = useState<Map<string, string>>(new Map());
  const queue = useAppSelector((state) => state.upload.queue);

  const handleFilesSelected = useCallback((files: File[]) => {
    // Generate previews for selected files
    const newPreviews = new Map(previews);
    files.forEach((file) => {
      const objectUrl = URL.createObjectURL(file);
      newPreviews.set(file.name, objectUrl);
    });
    setPreviews(newPreviews);
  }, [previews]);

  const removePreview = useCallback((fileName: string) => {
    const url = previews.get(fileName);
    if (url) {
      URL.revokeObjectURL(url);
    }
    const newPreviews = new Map(previews);
    newPreviews.delete(fileName);
    setPreviews(newPreviews);
  }, [previews]);

  return (
    <View style={styles.container}>
      <FileSelection
        maxFiles={100}
        maxFileSizeMB={50}
        onFilesSelected={handleFilesSelected}
      />
      
      {previews.size > 0 && (
        <View style={styles.previewContainer}>
          <Text style={styles.previewTitle}>Selected Files ({previews.size})</Text>
          <View style={styles.previewGrid}>
            {Array.from(previews.entries()).map(([fileName, url]) => (
              <View key={fileName} style={styles.previewItem}>
                <Image source={{ uri: url }} style={styles.previewImage} />
                <Text style={styles.previewFileName} numberOfLines={1}>
                  {fileName}
                </Text>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removePreview(fileName)}
                >
                  <Text style={styles.removeButtonText}>Remove</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  previewContainer: {
    marginTop: 20,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  previewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  previewItem: {
    width: 120,
    alignItems: 'center',
  },
  previewImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  previewFileName: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
    width: '100%',
  },
  removeButton: {
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#ff4444',
    borderRadius: 4,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 12,
  },
});

