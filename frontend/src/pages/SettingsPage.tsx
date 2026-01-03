import React, { useState, useRef } from 'react';
import { Eye, Palette, Download, Shield, RotateCcw, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { useSettings } from '../hooks/useSettings';
import { ColorPreview } from '../components/common/ColorPreview';
import { cn, getAdaptiveClasses } from '../utils/appearanceUtils';


type SettingsTab = 'display' | 'appearance' | 'data' | 'privacy';

const SettingsPage: React.FC = () => {
  const {
    settings,
    updateSettings,
    resetSettings,
    isLoaded,
    isLoading,
    error,
    exportSettings,
    importSettings
  } = useSettings();

  const [activeTab, setActiveTab] = useState<SettingsTab>('display');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleExportSettings = () => {
    const settingsData = exportSettings();
    const blob = new Blob([settingsData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rubix-settings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showSuccess('Settings exported successfully!');
  };

  const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        await importSettings(content);
        showSuccess('Settings imported successfully!');
      } catch (error) {
        console.error('Error importing settings:', error);
      }
    };
    reader.readAsText(file);
  };

  const handleResetCategory = async () => {
    await resetSettings(activeTab);
    showSuccess(`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} settings reset to defaults!`);
  };

  const tabs = [
    { id: 'display' as SettingsTab, label: 'Display', icon: Eye, color: getAdaptiveClasses.semantic.info },
    { id: 'appearance' as SettingsTab, label: 'Appearance', icon: Palette, color: getAdaptiveClasses.text.secondary },
    { id: 'data' as SettingsTab, label: 'Data', icon: Download, color: getAdaptiveClasses.semantic.success },
    { id: 'privacy' as SettingsTab, label: 'Privacy', icon: Shield, color: getAdaptiveClasses.semantic.error },
  ];

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-adaptive-primary mb-2">Settings</h1>
        <p className="text-adaptive-secondary">
          Customize your cubing experience and preferences. Timer settings are available on the Timer page.
        </p>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className={cn('border rounded-lg p-4 flex items-center space-x-2', getAdaptiveClasses.backgroundSemantic.success, 'border-success')}>
          <CheckCircle className="w-5 h-5 text-on-primary" />
          <span className="text-on-primary">{successMessage}</span>
        </div>
      )}
      
      {error && (
        <div className={cn('border rounded-lg p-4 flex items-center space-x-2', getAdaptiveClasses.backgroundSemantic.error, 'border-error')}>
          <AlertCircle className="w-5 h-5 text-on-primary" />
          <span className="text-on-primary">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <nav className="space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-adaptive-secondary hover:bg-adaptive-tertiary'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-primary-600' : tab.color}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Display Settings */}
          {activeTab === 'display' && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Eye className={cn('w-6 h-6', getAdaptiveClasses.semantic.info)} />
                <h2 className="text-xl font-semibold text-adaptive-primary">Display Settings</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-adaptive-primary mb-3">
                    Statistics to Show
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.display.showAo5}
                        onChange={(e) => updateSettings('display', { showAo5: e.target.checked })}
                        className="mr-2 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-adaptive-primary">Average of 5 (Ao5)</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.display.showAo12}
                        onChange={(e) => updateSettings('display', { showAo12: e.target.checked })}
                        className="mr-2 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-adaptive-primary">Average of 12 (Ao12)</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.display.showAo100}
                        onChange={(e) => updateSettings('display', { showAo100: e.target.checked })}
                        className="mr-2 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-adaptive-primary">Average of 100 (Ao100)</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.display.showPersonalBest}
                        onChange={(e) => updateSettings('display', { showPersonalBest: e.target.checked })}
                        className="mr-2 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-adaptive-primary">Personal best</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-adaptive-primary mb-3">
                    Scramble Format
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={settings.display.scrambleFormat === 'single'}
                        onChange={() => updateSettings('display', { scrambleFormat: 'single' })}
                        className="mr-2 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-adaptive-primary">Single line</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={settings.display.scrambleFormat === 'multiline'}
                        onChange={() => updateSettings('display', { scrambleFormat: 'multiline' })}
                        className="mr-2 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-adaptive-primary">Multi-line (5 moves per line)</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Appearance Settings */}
          {activeTab === 'appearance' && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Palette className={cn('w-6 h-6', getAdaptiveClasses.text.secondary)} />
                <h2 className="text-xl font-semibold text-adaptive-primary">Appearance Settings</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-adaptive-primary mb-2">
                    Theme
                  </label>
                  <select
                    value={settings.appearance.theme}
                    onChange={(e) => {
                      updateSettings('appearance', { theme: e.target.value as 'light' | 'dark' | 'auto' });
                    }}
                    className="form-input"
                  >
                    <option value="auto">Auto (System)</option>
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-adaptive-primary mb-2">
                    Primary Color
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={settings.appearance.primaryColor}
                      onChange={(e) => {
                        updateSettings('appearance', { primaryColor: e.target.value });
                      }}
                      className="w-12 h-8 rounded border border-gray-300"
                    />
                    <span className="text-sm text-adaptive-secondary">{settings.appearance.primaryColor}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-adaptive-primary mb-2">
                    Font Size
                  </label>
                  <select
                    value={settings.appearance.fontSize}
                    onChange={(e) => updateSettings('appearance', { fontSize: e.target.value as 'small' | 'medium' | 'large' })}
                    className="form-input"
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>

                                 {/* Color system preview */}
                 <div>
                   <label className="block text-sm font-medium text-adaptive-primary mb-3">
                     Color System Preview
                   </label>
                   <ColorPreview />
                 </div>
                 

                 
                 {/* Note: Advanced appearance features like animations and compact mode 
                      will be available in future updates when full component integration is completed */}
              </div>
            </div>
          )}

          {/* Data Management */}
          {activeTab === 'data' && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Download className={cn('w-6 h-6', getAdaptiveClasses.semantic.success)} />
                <h2 className="text-xl font-semibold text-adaptive-primary">Data Management</h2>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <button
                      onClick={handleExportSettings}
                      disabled={isLoading}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-primary-600 text-on-primary rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                    >
                      <Download className="w-4 h-4" />
                      <span>Export Settings</span>
                    </button>
                    <p className="text-sm text-adaptive-secondary mt-2">
                      Download your settings as a JSON file
                    </p>
                  </div>

                  <div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isLoading}
                      className={cn('w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-50', getAdaptiveClasses.backgroundSemantic.success, 'text-on-primary', 'hover:bg-adaptive-tertiary hover:text-adaptive-primary')}
                    >
                      <Upload className="w-4 h-4" />
                      <span>Import Settings</span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json"
                      onChange={handleImportSettings}
                      className="hidden"
                    />
                    <p className="text-sm text-adaptive-secondary mt-2">
                      Import settings from a JSON file
                    </p>
                  </div>
                </div>

                {/* Note: Advanced features like CSV export, data retention, and backup services 
                     will be available in future updates when backend support is implemented */}
              </div>
            </div>
          )}

          {/* Privacy Settings */}
          {activeTab === 'privacy' && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Shield className={cn('w-6 h-6', getAdaptiveClasses.semantic.error)} />
                <h2 className="text-xl font-semibold text-adaptive-primary">Privacy Settings</h2>
              </div>

              <div className="text-center py-8">
                <Shield className={cn('w-16 h-16 mx-auto mb-4', getAdaptiveClasses.text.tertiary)} />
                <h3 className="text-lg font-medium text-adaptive-primary mb-2">Privacy Features Coming Soon</h3>
                <p className="text-adaptive-secondary max-w-md mx-auto">
                  Privacy controls like analytics preferences, statistics sharing, and public profiles 
                  will be available in future updates when backend support is implemented.
                </p>
                <p className="text-sm text-adaptive-tertiary mt-4">
                  Your data is currently private by default and not shared with anyone.
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <button
              onClick={handleResetCategory}
              disabled={isLoading}
              className={cn('flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-50', getAdaptiveClasses.background.tertiary, getAdaptiveClasses.text.primary, 'hover:bg-adaptive-secondary')}
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset {activeTab} to Defaults</span>
            </button>

            {isLoading && (
              <div className="flex items-center space-x-2 text-adaptive-secondary">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                <span className="text-sm">Saving...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
