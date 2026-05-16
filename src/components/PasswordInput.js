/**
 * NOTE: A reusable and secure password input component.
 * By encapsulating the logic for the input field, lock icon, and show/hide toggle,
 * we create a clean, single component that can be used on any form. This promotes
 * code reuse and ensures a consistent UI for all password fields.
 */
import React, { useState } from 'react';
import { View, TextInput, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useThemedStyles } from '../contexts/ThemeContext';

const PasswordInput = ({ value, onChangeText, placeholder = "Password" }) => {
  const { styles, colors } = useThemedStyles(createStyles);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <View style={styles.inputContainer}>
      <Feather name="lock" size={20} color={colors.textSecondary} style={styles.inputIcon} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={!isPasswordVisible}
        placeholderTextColor={colors.textSecondary}
        autoCapitalize="none"
      />
      <Pressable onPress={() => setIsPasswordVisible(!isPasswordVisible)} hitSlop={10}>
        <Feather name={isPasswordVisible ? 'eye-off' : 'eye'} size={20} color={colors.textSecondary} />
      </Pressable>
    </View>
  );
};

const createStyles = (colors) => ({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
  },
});

export default PasswordInput;
