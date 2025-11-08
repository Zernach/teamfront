package com.rapidphotoupload.domain.entities;

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

/**
 * PhotoMetadata entity representing tags, dimensions, file hash, and custom properties.
 * This is an entity within the Photo aggregate.
 */
public class PhotoMetadata {
    private Set<String> tags;
    private Integer width;
    private Integer height;
    private String fileHash;
    private Map<String, String> customProperties;

    public PhotoMetadata() {
        this.tags = Set.of();
        this.customProperties = new HashMap<>();
    }

    public PhotoMetadata(Set<String> tags, Integer width, Integer height, String fileHash, Map<String, String> customProperties) {
        this.tags = tags != null ? Set.copyOf(tags) : Set.of();
        this.width = width;
        this.height = height;
        this.fileHash = fileHash;
        this.customProperties = customProperties != null ? new HashMap<>(customProperties) : new HashMap<>();
    }

    public Set<String> getTags() {
        return Set.copyOf(tags);
    }

    public void setTags(Set<String> tags) {
        this.tags = tags != null ? Set.copyOf(tags) : Set.of();
    }

    public Integer getWidth() {
        return width;
    }

    public void setWidth(Integer width) {
        this.width = width;
    }

    public Integer getHeight() {
        return height;
    }

    public void setHeight(Integer height) {
        this.height = height;
    }

    public String getFileHash() {
        return fileHash;
    }

    public void setFileHash(String fileHash) {
        this.fileHash = fileHash;
    }

    public Map<String, String> getCustomProperties() {
        return Map.copyOf(customProperties);
    }

    public void setCustomProperties(Map<String, String> customProperties) {
        this.customProperties = customProperties != null ? new HashMap<>(customProperties) : new HashMap<>();
    }

    public void addTag(String tag) {
        if (tag != null && !tag.trim().isEmpty()) {
            var newTags = new java.util.HashSet<>(this.tags);
            newTags.add(tag.trim());
            this.tags = Set.copyOf(newTags);
        }
    }

    public void removeTag(String tag) {
        if (tag != null) {
            var newTags = new java.util.HashSet<>(this.tags);
            newTags.remove(tag);
            this.tags = Set.copyOf(newTags);
        }
    }

    public void setCustomProperty(String key, String value) {
        if (key != null && !key.trim().isEmpty()) {
            this.customProperties.put(key.trim(), value != null ? value : "");
        }
    }

    public void removeCustomProperty(String key) {
        if (key != null) {
            this.customProperties.remove(key);
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        PhotoMetadata that = (PhotoMetadata) o;
        return Objects.equals(tags, that.tags) &&
               Objects.equals(width, that.width) &&
               Objects.equals(height, that.height) &&
               Objects.equals(fileHash, that.fileHash) &&
               Objects.equals(customProperties, that.customProperties);
    }

    @Override
    public int hashCode() {
        return Objects.hash(tags, width, height, fileHash, customProperties);
    }
}

