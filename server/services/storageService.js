const fs = require('fs').promises;
const path = require('path');

class StorageService {
  constructor() {
    this.uploadDir = path.join(__dirname, '../uploads');
    this.ensureUploadDirectory();
  }

  async ensureUploadDirectory() {
    try {
      await fs.access(this.uploadDir);
    } catch (error) {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  async saveFile(file, filename) {
    const filePath = path.join(this.uploadDir, filename);
    await fs.writeFile(filePath, file.buffer);
    return filename;
  }

  async deleteFile(filename) {
    try {
      const filePath = path.join(this.uploadDir, filename);
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

  getFileUrl(filename) {
    return `/uploads/${filename}`;
  }

  getFilePath(filename) {
    return path.join(this.uploadDir, filename);
  }
}

module.exports = new StorageService(); 