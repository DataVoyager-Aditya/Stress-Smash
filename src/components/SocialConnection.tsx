import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, MessageCircle, Mail, Share2, Heart, Users, X, Plus, AlertTriangle } from 'lucide-react';
import { GameSession, UserProgress } from '../types';
import { useSoundEffects } from '../hooks/useSoundEffects';

interface Contact {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  whatsapp?: string;
  relationship: string;
  isEmergency: boolean;
  autoMessageEnabled: boolean;
  preferredMethod: 'phone' | 'whatsapp' | 'email' | 'sms';
  createdAt: string;
}

interface SocialConnectionProps {
  sessions: GameSession[];
  progress: UserProgress;
  currentStressLevel: number;
  onClose: () => void;
}

// Storage key constant
const CONTACTS_STORAGE_KEY = 'stresssmash-support-contacts';

export const SocialConnection: React.FC<SocialConnectionProps> = ({
  sessions,
  progress,
  currentStressLevel,
  onClose
}) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [showAddContact, setShowAddContact] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [connectionPrompts, setConnectionPrompts] = useState(0);
  const [lastPromptTime, setLastPromptTime] = useState<Date | null>(null);
  const [autoMessageSettings, setAutoMessageSettings] = useState({
    enabled: true,
    threshold: 3,
    customMessage: "Hi! I've been thinking about you. Hope you're doing well. Would love to catch up when you have time. 💙"
  });
  const [isLoading, setIsLoading] = useState(true);
  const sounds = useSoundEffects();

  // Enhanced localStorage functions
  const saveContactsToStorage = (contactsToSave: Contact[]) => {
    try {
      const dataToSave = JSON.stringify(contactsToSave);
      localStorage.setItem(CONTACTS_STORAGE_KEY, dataToSave);
      
      // Verify the save worked immediately
      const verification = localStorage.getItem(CONTACTS_STORAGE_KEY);
      if (verification !== dataToSave) {
        throw new Error('Storage verification failed');
      }
      
      console.log('✅ Contacts saved successfully:', contactsToSave.length, 'contacts');
      return true;
    } catch (error) {
      console.error('❌ Error saving contacts:', error);
      alert('Unable to save contacts. Please check your browser storage settings.');
      return false;
    }
  };

  const loadContactsFromStorage = () => {
    try {
      setIsLoading(true);
      
      // Try multiple storage keys for backward compatibility
      const storageKeys = [CONTACTS_STORAGE_KEY, 'wellness-contacts'];
      let savedContacts = null;
      
      for (const key of storageKeys) {
        const data = localStorage.getItem(key);
        if (data) {
          savedContacts = JSON.parse(data);
          console.log(`📥 Loaded contacts from ${key}:`, savedContacts);
          
          // If we found data in old key, migrate it
          if (key !== CONTACTS_STORAGE_KEY) {
            localStorage.setItem(CONTACTS_STORAGE_KEY, data);
            localStorage.removeItem(key); // Clean up old key
            console.log('🔄 Migrated contacts to new storage key');
          }
          break;
        }
      }
      
      if (savedContacts && Array.isArray(savedContacts)) {
        // Validate contact structure
        const validContacts = savedContacts.filter(contact => 
          contact && 
          typeof contact === 'object' && 
          contact.id && 
          contact.name && 
          contact.relationship
        );
        
        console.log('✅ Valid contacts loaded:', validContacts.length);
        setContacts(validContacts);
        return validContacts;
      } else {
        console.log('📭 No valid contacts found in storage');
        setContacts([]);
        return [];
      }
    } catch (error) {
      console.error('❌ Error loading contacts:', error);
      setContacts([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Load contacts on component mount
  useEffect(() => {
    console.log('🔄 Component mounted, loading contacts...');
    loadContactsFromStorage();
  }, []);

  // Save contacts whenever the contacts array changes (but not on initial load)
  useEffect(() => {
    if (!isLoading && contacts.length >= 0) {
      console.log('💾 Contacts changed, saving to storage...');
      saveContactsToStorage(contacts);
    }
  }, [contacts, isLoading]);

  // Monitor stress levels and trigger connection prompts
  useEffect(() => {
    if (currentStressLevel >= 7 && (!lastPromptTime || Date.now() - lastPromptTime.getTime() > 3600000)) {
      setLastPromptTime(new Date());
    }
  }, [currentStressLevel, lastPromptTime]);

  const addContact = (contactData: Omit<Contact, 'id' | 'createdAt'>) => {
    const newContact: Contact = {
      ...contactData,
      id: `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    };
    
    console.log('➕ Adding new contact:', newContact);
    
    setContacts(prevContacts => {
      const updatedContacts = [...prevContacts, newContact];
      console.log('📝 Updated contacts array:', updatedContacts);
      return updatedContacts;
    });
    
    setShowAddContact(false);
    sounds.success();
    
    // Show confirmation with contact count
    setTimeout(() => {
      const currentCount = contacts.length + 1;
      alert(`✅ Contact "${newContact.name}" saved successfully!\n\nYou now have ${currentCount} support contact${currentCount === 1 ? '' : 's'}.`);
    }, 100);
  };

  const removeContact = (contactId: string) => {
    console.log('🗑️ Removing contact with ID:', contactId);
    
    const contactToRemove = contacts.find(c => c.id === contactId);
    if (contactToRemove) {
      setContacts(prevContacts => {
        const updatedContacts = prevContacts.filter(c => c.id !== contactId);
        console.log('📝 Contacts after removal:', updatedContacts);
        return updatedContacts;
      });
      
      sounds.notification();
      
      // Show confirmation
      setTimeout(() => {
        alert(`🗑️ Contact "${contactToRemove.name}" has been removed.`);
      }, 100);
    }
  };

  const initiateConnection = (contact: Contact) => {
    const message = `Hi ${contact.name}! I'm reaching out because I could use some support right now. Would you be available for a quick chat?`;
    
    try {
      switch (contact.preferredMethod) {
        case 'whatsapp':
          if (contact.whatsapp) {
            let cleanNumber = contact.whatsapp.replace(/\D/g, '');
            
            if (cleanNumber.startsWith('0')) {
              cleanNumber = '91' + cleanNumber.substring(1);
            } else if (cleanNumber.length === 10 && !cleanNumber.startsWith('91')) {
              cleanNumber = '91' + cleanNumber;
            }
            
            const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
          } else {
            alert('WhatsApp number not available for this contact');
          }
          break;
        case 'phone':
          if (contact.phone) {
            window.open(`tel:${contact.phone}`);
          } else {
            alert('Phone number not available for this contact');
          }
          break;
        case 'email':
          if (contact.email) {
            const subject = 'Checking In - Need Support';
            const emailUrl = `mailto:${contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
            window.open(emailUrl, '_blank');
          } else {
            alert('Email address not available for this contact');
          }
          break;
        case 'sms':
          if (contact.phone) {
            const smsUrl = `sms:${contact.phone}?body=${encodeURIComponent(message)}`;
            window.open(smsUrl);
          } else {
            alert('Phone number not available for this contact');
          }
          break;
        default:
          alert('Contact method not configured');
      }
      
      sounds.notification();
    } catch (error) {
      console.error('Error initiating connection:', error);
      alert('Unable to open contact method. Please check your device settings.');
    }
  };

  const declineConnection = () => {
    const newPromptCount = connectionPrompts + 1;
    setConnectionPrompts(newPromptCount);
    
    if (autoMessageSettings.enabled && newPromptCount >= autoMessageSettings.threshold) {
      triggerAutoMessage();
      setConnectionPrompts(0);
    }
  };

  const triggerAutoMessage = () => {
    const emergencyContacts = contacts.filter(c => c.isEmergency && c.autoMessageEnabled);
    
    emergencyContacts.forEach(contact => {
      const message = autoMessageSettings.customMessage;
      
      try {
        switch (contact.preferredMethod) {
          case 'whatsapp':
            if (contact.whatsapp) {
              let cleanNumber = contact.whatsapp.replace(/\D/g, '');
              if (cleanNumber.startsWith('0')) {
                cleanNumber = '91' + cleanNumber.substring(1);
              } else if (cleanNumber.length === 10 && !cleanNumber.startsWith('91')) {
                cleanNumber = '91' + cleanNumber;
              }
              window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`, '_blank');
            }
            break;
          case 'email':
            if (contact.email) {
              window.open(`mailto:${contact.email}?subject=${encodeURIComponent('Thinking of You')}&body=${encodeURIComponent(message)}`, '_blank');
            }
            break;
          case 'sms':
            if (contact.phone) {
              window.open(`sms:${contact.phone}?body=${encodeURIComponent(message)}`);
            }
            break;
        }
      } catch (error) {
        console.error('Error sending auto-message:', error);
      }
    });
  };

  const shareAchievement = (type: 'progress' | 'session' | 'streak') => {
    let shareText = '';
    
    switch (type) {
      case 'progress':
        shareText = `I've completed ${progress.totalSessions} wellness sessions and I'm feeling great! 🌟 Taking care of my mental health one day at a time. #MentalHealthMatters #WellnessJourney`;
        break;
      case 'session':
        shareText = `Just finished a stress-relief session and feeling much better! 😌 Small steps towards better mental wellness. #StressRelief #SelfCare`;
        break;
      case 'streak':
        shareText = `${progress.streakDays} days of consistent wellness practice! 🔥 Building healthy habits for my mental health. #HealthyHabits #MentalWellness`;
        break;
    }

    try {
      if (navigator.share) {
        navigator.share({
          title: 'Wellness Progress',
          text: shareText,
          url: window.location.origin
        }).catch(error => {
          console.error('Error sharing:', error);
          navigator.clipboard.writeText(shareText).then(() => {
            alert('Copied to clipboard! You can now paste it in WhatsApp, SMS, or any social media app.');
          });
        });
      } else {
        navigator.clipboard.writeText(shareText).then(() => {
          sounds.success();
          alert('Copied to clipboard! You can now paste it in WhatsApp, SMS, or any social media app.');
        }).catch(error => {
          console.error('Error copying to clipboard:', error);
          alert(`Share this message:\n\n${shareText}`);
        });
      }
    } catch (error) {
      console.error('Error in share function:', error);
      alert(`Share this message:\n\n${shareText}`);
    }
  };

  // Debug function to check storage
  const debugStorage = () => {
    console.log('=== STORAGE DEBUG ===');
    console.log('Current contacts state:', contacts);
    console.log('Contacts count:', contacts.length);
    console.log('localStorage content:', localStorage.getItem(CONTACTS_STORAGE_KEY));
    console.log('localStorage length:', localStorage.length);
    console.log('All localStorage keys:', Object.keys(localStorage));
    
    // Test save/load cycle
    const testData = [{ id: 'test', name: 'Test Contact', relationship: 'Test' }];
    localStorage.setItem('test-contacts', JSON.stringify(testData));
    const retrieved = localStorage.getItem('test-contacts');
    console.log('Test save/load:', retrieved);
    localStorage.removeItem('test-contacts');
    
    alert(`Debug Info:\n\nContacts in state: ${contacts.length}\nStorage key: ${CONTACTS_STORAGE_KEY}\nStorage working: ${retrieved ? 'Yes' : 'No'}\n\nCheck console for detailed logs.`);
  };

  // Force reload contacts
  const forceReloadContacts = () => {
    console.log('🔄 Force reloading contacts...');
    const reloadedContacts = loadContactsFromStorage();
    alert(`Reloaded ${reloadedContacts.length} contacts from storage.`);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 relative max-h-[90vh] overflow-y-auto"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-full">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Support Network</h3>
                <p className="text-sm text-gray-600">Connect with your trusted contacts</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {/* Debug buttons */}
              <button
                onClick={debugStorage}
                className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded hover:bg-gray-200"
                title="Debug Storage"
              >
                Debug
              </button>
              <button
                onClick={forceReloadContacts}
                className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200"
                title="Reload Contacts"
              >
                Reload
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your contacts...</p>
            </div>
          )}

          {/* Stress Level Alert */}
          {!isLoading && currentStressLevel >= 7 && (
            <motion.div
              className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <div className="flex items-center space-x-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <h4 className="font-semibold text-red-800">High Stress Detected</h4>
              </div>
              <p className="text-red-700 text-sm mb-3">
                It might help to connect with someone you trust. Reaching out is a sign of strength.
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowAddContact(true)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                >
                  Add Support Contact
                </button>
                <button
                  onClick={declineConnection}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
                >
                  Not Right Now
                </button>
              </div>
            </motion.div>
          )}

          {/* Quick Actions */}
          {!isLoading && (
            <div className="grid grid-cols-2 gap-4 mb-6">
              <motion.button
                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-4 rounded-xl text-center hover:from-green-600 hover:to-emerald-600 transition-all"
                onClick={() => setShowShareModal(true)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Share2 className="w-6 h-6 mx-auto mb-2" />
                <div className="font-medium">Share Progress</div>
                <div className="text-sm opacity-90">Celebrate achievements</div>
              </motion.button>

              <motion.button
                className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-4 rounded-xl text-center hover:from-blue-600 hover:to-cyan-600 transition-all"
                onClick={() => setShowAddContact(true)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus className="w-6 h-6 mx-auto mb-2" />
                <div className="font-medium">Add Contact</div>
                <div className="text-sm opacity-90">Build support network</div>
              </motion.button>
            </div>
          )}

          {/* Contacts List */}
          {!isLoading && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-800">Your Support Network</h4>
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {contacts.length} contact{contacts.length === 1 ? '' : 's'}
                </span>
              </div>
              
              {contacts.length === 0 ? (
                <div className="text-center text-gray-500 py-8 bg-gray-50 rounded-lg">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">No contacts added yet</p>
                  <p className="text-sm">Add trusted friends and family for support</p>
                  <button
                    onClick={() => setShowAddContact(true)}
                    className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                  >
                    Add Your First Contact
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {contacts.map(contact => (
                    <ContactCard
                      key={contact.id}
                      contact={contact}
                      onConnect={() => initiateConnection(contact)}
                      onRemove={() => removeContact(contact.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Auto-Message Settings */}
          {!isLoading && contacts.length > 0 && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-3">Auto-Message Settings</h4>
              <div className="space-y-3">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={autoMessageSettings.enabled}
                    onChange={(e) => setAutoMessageSettings(prev => ({ ...prev, enabled: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">Enable auto-messages to emergency contacts</span>
                </label>
                
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Trigger after {autoMessageSettings.threshold} declined connection prompts
                  </label>
                  <input
                    type="range"
                    min="2"
                    max="5"
                    value={autoMessageSettings.threshold}
                    onChange={(e) => setAutoMessageSettings(prev => ({ ...prev, threshold: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Custom message:</label>
                  <textarea
                    value={autoMessageSettings.customMessage}
                    onChange={(e) => setAutoMessageSettings(prev => ({ ...prev, customMessage: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Add Contact Modal */}
      {showAddContact && (
        <AddContactModal
          onAdd={addContact}
          onClose={() => setShowAddContact(false)}
        />
      )}

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal
          progress={progress}
          onShare={shareAchievement}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </AnimatePresence>
  );
};

const ContactCard: React.FC<{
  contact: Contact;
  onConnect: () => void;
  onRemove: () => void;
}> = ({ contact, onConnect, onRemove }) => {
  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'phone': return <Phone className="w-4 h-4" />;
      case 'whatsapp': return <MessageCircle className="w-4 h-4" />;
      case 'email': return <Mail className="w-4 h-4" />;
      case 'sms': return <MessageCircle className="w-4 h-4" />;
      default: return <Phone className="w-4 h-4" />;
    }
  };

  return (
    <motion.div
      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
      whileHover={{ scale: 1.01 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h5 className="font-medium text-gray-800">{contact.name}</h5>
            {contact.isEmergency && (
              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                Emergency
              </span>
            )}
          </div>
          <div className="text-sm text-gray-600 mb-2">{contact.relationship}</div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            {getMethodIcon(contact.preferredMethod)}
            <span className="capitalize">{contact.preferredMethod}</span>
            {contact.createdAt && (
              <span className="text-xs">
                • Added {new Date(contact.createdAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex space-x-2">
          <motion.button
            className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
            onClick={onConnect}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Connect
          </motion.button>
          <motion.button
            className="bg-gray-200 text-gray-600 px-3 py-2 rounded-lg text-sm hover:bg-gray-300 transition-colors"
            onClick={onRemove}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <X className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

const AddContactModal: React.FC<{
  onAdd: (contact: Omit<Contact, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}> = ({ onAdd, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    whatsapp: '',
    relationship: '',
    isEmergency: false,
    autoMessageEnabled: false,
    preferredMethod: 'whatsapp' as const
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.relationship.trim()) {
      newErrors.relationship = 'Relationship is required';
    }
    
    const hasContactMethod = formData.phone || formData.email || formData.whatsapp;
    if (!hasContactMethod) {
      newErrors.contact = 'At least one contact method is required';
    }
    
    switch (formData.preferredMethod) {
      case 'phone':
      case 'sms':
        if (!formData.phone) {
          newErrors.phone = 'Phone number required for this contact method';
        }
        break;
      case 'email':
        if (!formData.email) {
          newErrors.email = 'Email address required for this contact method';
        }
        break;
      case 'whatsapp':
        if (!formData.whatsapp) {
          newErrors.whatsapp = 'WhatsApp number required for this contact method';
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      console.log('📝 Submitting contact form with data:', formData);
      onAdd(formData);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Add Support Contact</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Enter contact name"
              required
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Relationship *</label>
            <input
              type="text"
              value={formData.relationship}
              onChange={(e) => setFormData(prev => ({ ...prev, relationship: e.target.value }))}
              placeholder="e.g., Friend, Family, Partner"
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.relationship ? 'border-red-500' : 'border-gray-300'}`}
              required
            />
            {errors.relationship && <p className="text-red-500 text-xs mt-1">{errors.relationship}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="+91 98765 43210 or 9876543210"
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
            <input
              type="tel"
              value={formData.whatsapp}
              onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
              placeholder="+91 98765 43210 or 9876543210"
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.whatsapp ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.whatsapp && <p className="text-red-500 text-xs mt-1">{errors.whatsapp}</p>}
            <p className="text-xs text-gray-500 mt-1">Most popular in India - will format automatically</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="contact@example.com"
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>
          
          {errors.contact && <p className="text-red-500 text-xs bg-red-50 p-2 rounded">{errors.contact}</p>}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Contact Method</label>
            <select
              value={formData.preferredMethod}
              onChange={(e) => setFormData(prev => ({ ...prev, preferredMethod: e.target.value as any }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="whatsapp">WhatsApp (Recommended for India)</option>
              <option value="phone">Phone Call</option>
              <option value="sms">SMS</option>
              <option value="email">Email</option>
            </select>
          </div>
          
          <div className="space-y-3 bg-gray-50 p-3 rounded-lg">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.isEmergency}
                onChange={(e) => setFormData(prev => ({ ...prev, isEmergency: e.target.checked }))}
                className="rounded w-4 h-4 text-blue-600"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">Emergency contact</span>
                <p className="text-xs text-gray-500">For high-stress situations</p>
              </div>
            </label>
            
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.autoMessageEnabled}
                onChange={(e) => setFormData(prev => ({ ...prev, autoMessageEnabled: e.target.checked }))}
                className="rounded w-4 h-4 text-blue-600"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">Enable auto-messages</span>
                <p className="text-xs text-gray-500">Automatic check-ins when needed</p>
              </div>
            </label>
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
            >
              Save Contact
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

const ShareModal: React.FC<{
  progress: UserProgress;
  onShare: (type: 'progress' | 'session' | 'streak') => void;
  onClose: () => void;
}> = ({ progress, onShare, onClose }) => {
  return (
    <motion.div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Share Your Progress</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-3">
          <motion.button
            className="w-full bg-green-50 border border-green-200 p-4 rounded-lg text-left hover:bg-green-100 transition-colors"
            onClick={() => {
              onShare('progress');
              onClose();
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="font-medium text-green-800">Overall Progress</div>
            <div className="text-sm text-green-600">{progress.totalSessions} sessions completed</div>
          </motion.button>
          
          <motion.button
            className="w-full bg-blue-50 border border-blue-200 p-4 rounded-lg text-left hover:bg-blue-100 transition-colors"
            onClick={() => {
              onShare('session');
              onClose();
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="font-medium text-blue-800">Recent Session</div>
            <div className="text-sm text-blue-600">Share your latest wellness activity</div>
          </motion.button>
          
          <motion.button
            className="w-full bg-purple-50 border border-purple-200 p-4 rounded-lg text-left hover:bg-purple-100 transition-colors"
            onClick={() => {
              onShare('streak');
              onClose();
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="font-medium text-purple-800">Daily Streak</div>
            <div className="text-sm text-purple-600">{progress.streakDays} days of consistent practice</div>
          </motion.button>
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 <strong>Tip:</strong> Your message will be copied to clipboard. You can then paste it in WhatsApp, SMS, or any social media app to share with friends and family.
          </p>
        </div>
        
        <button
          onClick={onClose}
          className="w-full mt-4 bg-gray-200 text-gray-800 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
        >
          Cancel
        </button>
      </motion.div>
    </motion.div>
  );
};