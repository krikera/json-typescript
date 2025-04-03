import fs from 'fs/promises';

/**
 * Check if a file exists
 * @param filePath Path to the file to check
 * @returns Boolean indicating if the file exists
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
} 