// components/settings/APIKeySettings.tsx

import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {colors} from '../../themes/colors';
import {getOpenAIKey, setOpenAIKey} from '../../service/openAIService';

export default function APIKeySettings() {
  const [apiKey, setApiKey] = useState('');
  const [isKeySet, setIsKeySet] = useState(false);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    loadApiKey();
  }, []);

  const loadApiKey = async () => {
    const key = await getOpenAIKey();
    if (key) {
      setApiKey(key);
      setIsKeySet(true);
    }
  };

  const handleSaveKey = async () => {
    if (!apiKey.trim()) {
      Alert.alert('Error', 'Please enter a valid API key');
      return;
    }

    try {
      await setOpenAIKey(apiKey);
      setIsKeySet(true);
      Alert.alert('Success', 'API key saved successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save API key');
    }
  };

  const handleRemoveKey = () => {
    Alert.alert(
      'Remove API Key',
      'Are you sure you want to remove your OpenAI API key?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await setOpenAIKey('');
            setApiKey('');
            setIsKeySet(false);
            setShowKey(false);
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>OpenAI API Key</Text>
        <Text style={styles.subtitle}>
          Add your OpenAI API key to enable AI-powered workout generation
        </Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={showKey ? apiKey : apiKey.replace(/./g, '•')}
          onChangeText={setApiKey}
          placeholder="sk-..."
          placeholderTextColor={colors.textSecondary}
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry={!showKey}
          editable={!isKeySet}
        />
        {isKeySet && (
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowKey(!showKey)}>
            <Text style={styles.eyeIcon}>{showKey ? '👁' : '👁‍🗨'}</Text>
          </TouchableOpacity>
        )}
      </View>

      {!isKeySet ? (
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveKey}>
          <Text style={styles.saveButtonText}>Save API Key</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={handleRemoveKey}>
            <Text style={styles.removeButtonText}>Remove Key</Text>
          </TouchableOpacity>
          <View style={styles.statusContainer}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>AI Enabled</Text>
          </View>
        </View>
      )}

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          Get your API key from{' '}
          <Text style={styles.link}>platform.openai.com</Text>
        </Text>
        <Text style={styles.infoText}>
          Your key is stored securely on your device
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  input: {
    flex: 1,
    backgroundColor: colors.inputBackground,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    padding: 8,
  },
  eyeIcon: {
    fontSize: 20,
  },
  saveButton: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonText: {
    color: colors.buttonText,
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  removeButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  removeButtonText: {
    color: colors.buttonText,
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  infoContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 4,
  },
  link: {
    color: colors.accent,
    textDecorationLine: 'underline',
  },
});
