// Data export utilities for the Settings page

export interface ExportData {
  version: string;
  timestamp: string;
  settings?: any;
  userData?: any;
  sessions?: any[];
  solves?: any[];
}

/**
 * Download data as a file
 */
export const downloadFile = (data: string, filename: string, type: string = 'application/json') => {
  const blob = new Blob([data], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Export settings data
 */
export const exportSettingsData = (settings: any) => {
  const exportData: ExportData = {
    version: '1.0',
    timestamp: new Date().toISOString(),
    settings
  };

  const filename = `rubix-settings-${new Date().toISOString().split('T')[0]}.json`;
  downloadFile(JSON.stringify(exportData, null, 2), filename);
};

/**
 * Export all user data (settings + solve data)
 */
export const exportAllUserData = async (settings: any) => {
  try {
    // This would be expanded to include actual user data from API calls
    const exportData: ExportData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      settings,
      userData: {
        note: 'User data export would include solve history, sessions, and statistics'
      }
    };

    const filename = `rubix-data-export-${new Date().toISOString().split('T')[0]}.json`;
    downloadFile(JSON.stringify(exportData, null, 2), filename);
  } catch (error) {
    console.error('Error exporting user data:', error);
    throw error;
  }
};

/**
 * Parse and validate imported settings
 */
export const parseImportedSettings = (jsonString: string) => {
  try {
    const data = JSON.parse(jsonString);
    
    if (!data.settings) {
      throw new Error('Invalid settings file: missing settings data');
    }

    // Basic validation
    if (typeof data.settings !== 'object') {
      throw new Error('Invalid settings file: settings must be an object');
    }

    return data.settings;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Invalid JSON file');
    }
    throw error;
  }
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Validate settings structure
 */
export const validateSettingsStructure = (settings: any): boolean => {
  const requiredCategories = ['timer', 'display', 'appearance', 'data', 'privacy'];
  
  if (!settings || typeof settings !== 'object') {
    return false;
  }

  return requiredCategories.every(category => 
    settings.hasOwnProperty(category) && typeof settings[category] === 'object'
  );
};

export default {
  downloadFile,
  exportSettingsData,
  exportAllUserData,
  parseImportedSettings,
  formatFileSize,
  validateSettingsStructure
};
