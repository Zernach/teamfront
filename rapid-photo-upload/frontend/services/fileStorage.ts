/**
 * File Storage Service
 * Stores File objects outside of Redux to avoid serialization issues.
 * Files are stored in memory keyed by upload ID.
 */

class FileStorage {
  private files: Map<string, File> = new Map();

  /**
   * Store a file with the given upload ID
   */
  set(uploadId: string, file: File): void {
    this.files.set(uploadId, file);
  }

  /**
   * Get a file by upload ID
   */
  get(uploadId: string): File | undefined {
    return this.files.get(uploadId);
  }

  /**
   * Get multiple files by upload IDs
   */
  getMany(uploadIds: string[]): File[] {
    return uploadIds
      .map((id) => this.get(id))
      .filter((file): file is File => file !== undefined);
  }

  /**
   * Remove a file by upload ID
   */
  remove(uploadId: string): boolean {
    return this.files.delete(uploadId);
  }

  /**
   * Remove multiple files by upload IDs
   */
  removeMany(uploadIds: string[]): void {
    uploadIds.forEach((id) => this.remove(id));
  }

  /**
   * Clear all stored files
   */
  clear(): void {
    this.files.clear();
  }

  /**
   * Check if a file exists for the given upload ID
   */
  has(uploadId: string): boolean {
    return this.files.has(uploadId);
  }

  /**
   * Get all stored upload IDs
   */
  getAllIds(): string[] {
    return Array.from(this.files.keys());
  }
}

// Export singleton instance
const fileStorage = new FileStorage();
export default fileStorage;

