/**
 * NOTE: The primary login screen, redesigned for a modern UX.
 * Key Features:
 * - Professional Layout: Clear visual hierarchy guides the user.
 * - Internationalization-Ready: Uses `react-native-phone-number-input` to support
 *   multiple country codes, removing the hardcoded "+252".
 * - Reusable Components: Leverages the custom `PasswordInput` component.
 * - Clear Feedback: Uses `isLoggingIn` state from AuthContext to show an activity
 *   indicator and disable the button, preventing double-submissions.
 */
import React, { useState, useRef } from 'react';
import { View, Text, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useThemedStyles } from '../../contexts/ThemeContext';
import { Feather } from '@expo/vector-icons';
import PhoneInput from 'react-native-phone-number-input';
import PasswordInput from '../../components/PasswordInput';
import Toast from 'react-native-toast-message';

export default function LoginScreen({ navigation }) {
  const { styles, colors } = useThemedStyles(createStyles);
  const { login, isLoggingIn } = useAuth();

  const [phone, setPhone] = useState('');
  const [formattedPhone, setFormattedPhone] = useState('');
  const [password, setPassword] = useState('');
  const phoneInputRef = useRef(null);

  const handleLogin = async () => {
    const isPhoneValid = phoneInputRef.current?.isValidNumber(phone);
    if (!isPhoneValid || !password) {
      return Toast.show({
        type: 'error',
        text1: 'Invalid Input',
        text2: 'Please enter a valid phone number and password.',
      });
    }
    await login({ phone: formattedPhone, password });
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.header}>
        <Image source={require('../../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>Welcome Back!</Text>
        <Text style={styles.subtitle}>Sign in to your account.</Text>
      </View>

      <View style={styles.form}>
        <PhoneInput
          ref={phoneInputRef}
          defaultValue={phone}
          defaultCode="SO"
          layout="first"
          onChangeText={setPhone}
          onChangeFormattedText={setFormattedPhone}
          containerStyle={styles.phoneInputContainer}
          textContainerStyle={styles.phoneInputTextContainer}
          codeTextStyle={{ color: colors.text }}
          textInputStyle={{ color: colors.text }}
          countryPickerProps={{ theme: { backgroundColor: colors.background, onBackground: colors.text } }}
        />
        <PasswordInput value={password} onChangeText={setPassword} />
        <Pressable>
          <Text style={styles.forgotPassword}>Forgot Password?</Text>
        </Pressable>
        <Pressable style={({ pressed }) => [styles.btn, (isLoggingIn || pressed) && styles.btnPressed]} onPress={handleLogin} disabled={isLoggingIn}>
          {isLoggingIn ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>Sign In</Text>}
        </Pressable>
      </View>

      <View style={styles.footer}>
        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>or continue with</Text>
          <View style={styles.divider} />
        </View>
        <View style={styles.socialRow}>
          <Pressable style={styles.socialBtn}><Feather name="globe" size={24} color={colors.text} /></Pressable>
          <Pressable style={styles.socialBtn}><Feather name="facebook" size={24} color={colors.text} /></Pressable>
          <Pressable style={styles.socialBtn}><Feather name="smartphone" size={24} color={colors.text} /></Pressable>
        </View>
        <Pressable style={styles.registerLink} onPress={() => navigation.navigate('RoleSelect')}>
          <Text style={styles.registerText}>Don't have an account? <Text style={styles.registerTextBold}>Sign Up</Text></Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors) => ({
  container: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 32 },
  logo: { width: 200, height: 110, marginBottom: 8 },
  title: { fontSize: 28, fontWeight: 'bold', color: colors.text, marginTop: 8 },
  subtitle: { fontSize: 16, color: colors.textSecondary, marginTop: 8, textAlign: 'center' },
  form: { width: '100%' },
  phoneInputContainer: { width: '100%', backgroundColor: colors.card, borderRadius: 14, borderWidth: 1, borderColor: colors.border, marginBottom: 12, height: 56 },
  phoneInputTextContainer: { backgroundColor: 'transparent', borderRadius: 14, paddingVertical: 0 },
  forgotPassword: { alignSelf: 'flex-end', color: colors.primary, fontWeight: '600', marginBottom: 24 },
  btn: { backgroundColor: colors.primary, borderRadius: 14, height: 56, alignItems: 'center', justifyContent: 'center' },
  btnPressed: { opacity: 0.8 },
  btnText: { color: '#FFF', fontWeight: '700', fontSize: 17 },
  footer: { width: '100%', alignItems: 'center', marginTop: 32 },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 24 },
  divider: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { marginHorizontal: 12, color: colors.textSecondary, fontWeight: '500', fontSize: 12 },
  socialRow: { flexDirection: 'row', justifyContent: 'center', width: '100%', marginBottom: 24 },
  socialBtn: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.card, justifyContent: 'center', alignItems: 'center', marginHorizontal: 10, borderWidth: 1, borderColor: colors.border },
  registerLink: { position: 'absolute', bottom: -10 },
  registerText: { color: colors.textSecondary, fontSize: 15 },
  registerTextBold: { color: colors.primary, fontWeight: 'bold' },
});
