import React, { useCallback, useEffect } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { FileSelection } from './FileSelection';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { removeFromQueue } from '../../store/uploadSlice';
import { revokePreviewUri } from '../../utils';
import { COLORS } from '../../constants/colors';

export function FileSelectionWithPreview() {
  const queue = useAppSelector((state) => state.upload.queue);
  const dispatch = useAppDispatch();
  
  // Get queued items (items that haven't been uploaded yet)
  const queuedItems = queue.filter((item) => 
    item.status === 'queued' || item.status === 'failed'
  );

  // Cleanup blob URLs when items are removed from queue
  useEffect(() => {
    return () => {
      // Cleanup all blob URLs when component unmounts
      queue.forEach((item) => {
        if (item.fileMetadata.previewUri) {
          revokePreviewUri(item.fileMetadata.previewUri);
        }
      });
    };
  }, []); // Only run on unmount

  const handleRemove = useCallback((uploadId: string, previewUri?: string) => {
    // Revoke blob URL if it exists
    if (previewUri) {
      revokePreviewUri(previewUri);
    }
    // Remove from queue (this will also clean up file storage via middleware)
    dispatch(removeFromQueue({ id: uploadId }));
  }, [dispatch]);

  return (
    <View style={styles.container}>
      <FileSelection
        maxFiles={100}
        maxFileSizeMB={50}
      />
      
      {queuedItems.length > 0 && (
        <View style={styles.previewContainer}>
          <Text style={styles.previewTitle}>Selected Files ({queuedItems.length})</Text>
          <View style={styles.previewGrid}>
            {queuedItems.map((item) => {
              const previewUri = item.fileMetadata.previewUri;
              
              if (!previewUri) {
                // Fallback: show placeholder if no preview URI
                return (
                  <View key={item.id} style={styles.previewItem}>
                    <View style={[styles.previewImage, styles.placeholderImage]}>
                      <Text style={styles.placeholderText}>No Preview</Text>
                    </View>
                    <Text style={styles.previewFileName} numberOfLines={1}>
                      {item.fileMetadata.name}
                    </Text>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => handleRemove(item.id, previewUri)}
                    >
                      <Text style={styles.removeButtonText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                );
              }
              
              return (
                <View key={item.id} style={styles.previewItem}>
                  <Image 
                    source={{ uri: previewUri }} 
                    style={styles.previewImage}
                    resizeMode="cover"
                  />
                  <Text style={styles.previewFileName} numberOfLines={1}>
                    {item.fileMetadata.name}
                  </Text>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemove(item.id, previewUri)}
                  >
                    <Text style={styles.removeButtonText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
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
    color: COLORS.white,
  },
  previewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  previewItem: {
    width: 120,
    alignItems: 'center',
    margin: 6,
  },
  previewImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    backgroundColor: COLORS.background99,
  },
  previewFileName: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
    width: '100%',
    color: COLORS.white,
  },
  removeButton: {
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: COLORS.red,
    borderRadius: 4,
  },
  removeButtonText: {
    color: COLORS.white,
    fontSize: 12,
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.tan50,
  },
  placeholderText: {
    color: COLORS.grey,
    fontSize: 10,
  },
});

