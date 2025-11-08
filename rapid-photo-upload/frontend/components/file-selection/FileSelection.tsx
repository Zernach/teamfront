import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { isValidImageFile, isValidFileSize, generateUploadId } from '../../utils';
import { useAppDispatch } from '../../hooks/redux';
import { addToQueue } from '../../store/uploadSlice';

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

  if (Platform.OS !== 'web') {
    // For native platforms, use different file picker (will be implemented in mobile epic)
    return (
      <View style={styles.container}>
        <Text>File selection for native platforms will be implemented in mobile epic</Text>
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
          borderColor: dragActive ? '#007AFF' : '#ccc',
          borderRadius: 8,
          padding: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: dragActive ? '#e3f2fd' : '#f9f9f9',
          minHeight: 200,
          cursor: 'pointer',
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
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
    minHeight: 200,
    cursor: 'pointer',
  },
  dropZoneActive: {
    borderColor: '#007AFF',
    backgroundColor: '#e3f2fd',
  },
  dropZoneText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  dropZoneSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

