import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Eye, Share2, Trash2, Download, X, AlertTriangle, Check } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface PrivacySettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PrivacySettings {
  dataCollection: {
    analytics: boolean;
    crashReports: boolean;
    usageStats: boolean;
  };
  sharing: {
    allowSharing: boolean;
    shareWithContacts: boolean;
    shareAchievements: boolean;
    shareProgress: boolean;
  };
  dataRetention: {
    autoDelete: boolean;
    retentionDays: number;
    deleteOnUninstall: boolean;
  };
  notifications: {
    connectionReminders: boolean;
    achievementAlerts: boolean;
    wellnessCheckins: boolean;
  };
}

export const PrivacySettings: React.FC<PrivacySettingsProps> = ({ isOpen, onClose }) => {
  const [privacySettings, setPrivacySettings] = useLocalStorage<PrivacySettings>('privacy-settings', {
    dataCollection: {
      analytics: false,
      crashReports: true,
      usageStats: false
    },
    sharing: {
      allowSharing: true,
      shareWithContacts: false,
      shareAchievements: true,
      shareProgress: false
    },
    dataRetention: {
      autoDelete: false,
      retentionDays: 90,
      deleteOnUninstall: true
    },
    notifications: {
      connectionReminders: true,
      achievementAlerts: true,
      wellnessCheckins: false
    }
  });

  const [activeTab, setActiveTab] = useState<'privacy' | 'sharing' | 'data'>('privacy');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const updateSettings = (section: keyof PrivacySettings, key: string, value: any) => {
    setPrivacySettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const exportData = () => {
    const allData = {
      sessions: JSON.parse(localStorage.getItem('stress-smash-sessions') || '[]'),
      progress: JSON.parse(localStorage.getItem('stress-smash-progress') || '{}'),
      contacts: JSON.parse(localStorage.getItem('wellness-contacts') || '[]'),
      settings: privacySettings,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stresssmash-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const deleteAllData = () => {
    const keysToDelete = [
      'stress-smash-sessions',
      'stress-smash-progress',
      'wellness-contacts',
      'custom-audio-tracks',
      'audio-settings',
      'theme-settings',
      'privacy-settings'
    ];

    keysToDelete.forEach(key => localStorage.removeItem(key));
    setShowDeleteConfirm(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full p-6 relative max-h-[90vh] overflow-y-auto"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-green-500 to-blue-500 p-2 rounded-full">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Privacy & Control</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Manage your data and privacy preferences</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            {[
              { id: 'privacy', label: 'Privacy', icon: Shield },
              { id: 'sharing', label: 'Sharing', icon: Share2 },
              { id: 'data', label: 'Data Control', icon: Eye }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md transition-all ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-gray-600 text-green-600 dark:text-green-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Privacy Tab */}
          {activeTab === 'privacy' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div>
                <h4 className="font-semibold text-gray-800 dark:text-white mb-4">Data Collection</h4>
                <div className="space-y-4">
                  <SettingToggle
                    title="Anonymous Analytics"
                    description="Help improve the app with anonymous usage data"
                    checked={privacySettings.dataCollection.analytics}
                    onChange={(checked) => updateSettings('dataCollection', 'analytics', checked)}
                  />
                  
                  <SettingToggle
                    title="Crash Reports"
                    description="Automatically send crash reports to help fix bugs"
                    checked={privacySettings.dataCollection.crashReports}
                    onChange={(checked) => updateSettings('dataCollection', 'crashReports', checked)}
                  />
                  
                  <SettingToggle
                    title="Usage Statistics"
                    description="Track which features you use most"
                    checked={privacySettings.dataCollection.usageStats}
                    onChange={(checked) => updateSettings('dataCollection', 'usageStats', checked)}
                  />
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 dark:text-white mb-4">Notifications</h4>
                <div className="space-y-4">
                  <SettingToggle
                    title="Connection Reminders"
                    description="Gentle reminders to reach out when stress is high"
                    checked={privacySettings.notifications.connectionReminders}
                    onChange={(checked) => updateSettings('notifications', 'connectionReminders', checked)}
                  />
                  
                  <SettingToggle
                    title="Achievement Alerts"
                    description="Celebrate your wellness milestones"
                    checked={privacySettings.notifications.achievementAlerts}
                    onChange={(checked) => updateSettings('notifications', 'achievementAlerts', checked)}
                  />
                  
                  <SettingToggle
                    title="Wellness Check-ins"
                    description="Daily prompts to track your mood"
                    checked={privacySettings.notifications.wellnessCheckins}
                    onChange={(checked) => updateSettings('notifications', 'wellnessCheckins', checked)}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Sharing Tab */}
          {activeTab === 'sharing' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div>
                <h4 className="font-semibold text-gray-800 dark:text-white mb-4">Sharing Preferences</h4>
                <div className="space-y-4">
                  <SettingToggle
                    title="Allow Sharing"
                    description="Enable sharing features throughout the app"
                    checked={privacySettings.sharing.allowSharing}
                    onChange={(checked) => updateSettings('sharing', 'allowSharing', checked)}
                  />
                  
                  {privacySettings.sharing.allowSharing && (
                    <>
                      <SettingToggle
                        title="Share with Contacts"
                        description="Allow sharing content with your support network"
                        checked={privacySettings.sharing.shareWithContacts}
                        onChange={(checked) => updateSettings('sharing', 'shareWithContacts', checked)}
                      />
                      
                      <SettingToggle
                        title="Share Achievements"
                        description="Share your wellness milestones"
                        checked={privacySettings.sharing.shareAchievements}
                        onChange={(checked) => updateSettings('sharing', 'shareAchievements', checked)}
                      />
                      
                      <SettingToggle
                        title="Share Progress"
                        description="Share your overall wellness progress"
                        checked={privacySettings.sharing.shareProgress}
                        onChange={(checked) => updateSettings('sharing', 'shareProgress', checked)}
                      />
                    </>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <h5 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Sharing Guidelines</h5>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• Only share what you're comfortable with</li>
                  <li>• You can review content before sharing</li>
                  <li>• Shared content doesn't include personal details</li>
                  <li>• You can revoke sharing permissions anytime</li>
                </ul>
              </div>
            </motion.div>
          )}

          {/* Data Control Tab */}
          {activeTab === 'data' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div>
                <h4 className="font-semibold text-gray-800 dark:text-white mb-4">Data Retention</h4>
                <div className="space-y-4">
                  <SettingToggle
                    title="Auto-delete Old Data"
                    description="Automatically remove old session data"
                    checked={privacySettings.dataRetention.autoDelete}
                    onChange={(checked) => updateSettings('dataRetention', 'autoDelete', checked)}
                  />
                  
                  {privacySettings.dataRetention.autoDelete && (
                    <div className="ml-6">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Delete data older than:
                      </label>
                      <select
                        value={privacySettings.dataRetention.retentionDays}
                        onChange={(e) => updateSettings('dataRetention', 'retentionDays', parseInt(e.target.value))}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value={30}>30 days</option>
                        <option value={60}>60 days</option>
                        <option value={90}>90 days</option>
                        <option value={180}>6 months</option>
                        <option value={365}>1 year</option>
                      </select>
                    </div>
                  )}
                  
                  <SettingToggle
                    title="Delete on Uninstall"
                    description="Remove all data when the app is uninstalled"
                    checked={privacySettings.dataRetention.deleteOnUninstall}
                    onChange={(checked) => updateSettings('dataRetention', 'deleteOnUninstall', checked)}
                  />
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 dark:text-white mb-4">Data Management</h4>
                <div className="space-y-3">
                  <motion.button
                    onClick={exportData}
                    className="w-full flex items-center justify-center space-x-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Download className="w-4 h-4" />
                    <span>Export My Data</span>
                  </motion.button>
                  
                  <motion.button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full flex items-center justify-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete All Data</span>
                  </motion.button>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h5 className="font-medium text-gray-800 dark:text-white mb-2">What Data We Store</h5>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li>• Your mood selections and session scores</li>
                  <li>• Game preferences and progress</li>
                  <li>• Support contacts (stored locally only)</li>
                  <li>• Audio and theme preferences</li>
                  <li>• No personal identification information</li>
                </ul>
              </div>
            </motion.div>
          )}

          {/* Delete Confirmation Modal */}
          <AnimatePresence>
            {showDeleteConfirm && (
              <motion.div
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-60 p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.8 }}
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <AlertTriangle className="w-6 h-6 text-red-500" />
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white">Delete All Data</h4>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    This will permanently delete all your sessions, progress, contacts, and settings. This action cannot be undone.
                  </p>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white py-2 rounded-lg font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={deleteAllData}
                      className="flex-1 bg-red-500 text-white py-2 rounded-lg font-medium"
                    >
                      Delete Everything
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const SettingToggle: React.FC<{
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}> = ({ title, description, checked, onChange }) => (
  <label className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer">
    <div className="flex-1 mr-4">
      <div className="font-medium text-gray-800 dark:text-white">{title}</div>
      <div className="text-sm text-gray-600 dark:text-gray-300">{description}</div>
    </div>
    <div className="relative">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <div className={`w-12 h-6 rounded-full transition-colors ${checked ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
        <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${checked ? 'translate-x-6' : 'translate-x-0.5'} mt-0.5`} />
      </div>
    </div>
  </label>
);