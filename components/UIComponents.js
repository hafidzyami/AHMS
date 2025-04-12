import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  StyleSheet,
} from "react-native";

/**
 * AIES Design System
 * A cohesive set of UI components for the AIES application
 */

// Color palette
export const Colors = {
  primary: "#D0ECEC",
  primaryLight: "#E7F5F5",
  primaryDark: "#65A3A3",
  accent: "#2D7A7A",
  textPrimary: "#2C3E50",
  textSecondary: "#546E7A",
  warning: "#E74C3C",
  success: "#27AE60",
  background: "#F8FBFB",
  gray100: "#F2F2F2",
  gray200: "#E0E0E0",
  gray300: "#BDBDBD",
  gray400: "#757575",
  white: "#FFFFFF",
  heartRate: "#FFEFEF", // Light red background for heart rate
  heartRateText: "#E53935", // Red for heart rate text
  spo2: "#E3F2FD", // Light blue background for SpO2
  spo2Text: "#1976D2", // Blue for SpO2 text
  temperature: "#FFF9C4", // Light yellow background for temperature
  temperatureText: "#FF8F00", // Amber for temperature text
  condition: "#F3E5F5", // Light purple background for condition
  conditionText: "#9747FF", // Purple for condition text
};

// Shadow styles
export const Shadows = {
  small: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3.84,
    elevation: 4,
  },
  large: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 8,
  },
};

// Typography styles
export const Typography = {
  h1: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
  h2: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
  h3: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
  body: {
    fontSize: 16,
    color: Colors.textPrimary,
  },
  bodySmall: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  caption: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
};

// Button components
export const PrimaryButton = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  style = {},
}) => (
  <TouchableOpacity
    onPress={disabled || loading ? null : onPress}
    style={[styles.buttonPrimary, disabled && styles.buttonDisabled, style]}
    activeOpacity={0.8}
  >
    {loading ? (
      <ActivityIndicator color={Colors.white} />
    ) : (
      <Text style={styles.buttonPrimaryText}>{title}</Text>
    )}
  </TouchableOpacity>
);

export const SecondaryButton = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  style = {},
}) => (
  <TouchableOpacity
    onPress={disabled || loading ? null : onPress}
    style={[styles.buttonSecondary, disabled && styles.buttonDisabled, style]}
    activeOpacity={0.8}
  >
    {loading ? (
      <ActivityIndicator color={Colors.accent} />
    ) : (
      <Text style={styles.buttonSecondaryText}>{title}</Text>
    )}
  </TouchableOpacity>
);

export const TextButton = ({
  title,
  onPress,
  color = Colors.accent,
  style = {},
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.buttonText, style]}
    activeOpacity={0.6}
  >
    <Text style={[styles.buttonTextText, { color }]}>{title}</Text>
  </TouchableOpacity>
);

// Card component
export const Card = ({ children, style = {} }) => (
  <View style={[styles.card, style]}>{children}</View>
);

// Input components
export const FormInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = "default",
  editable = true,
  error = null,
  style = {},
}) => (
  <View style={[styles.inputContainer, style]}>
    {label && <Text style={styles.inputLabel}>{label}</Text>}
    <TextInput
      style={[
        styles.input,
        !editable && styles.inputDisabled,
        error && styles.inputError,
      ]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      editable={editable}
      placeholderTextColor={Colors.gray400}
    />
    {error && <Text style={styles.errorText}>{error}</Text>}
  </View>
);

// Header component
export const Header = ({
  title,
  rightComponent,
  leftComponent,
  style = {},
}) => (
  <View style={[styles.header, style]}>
    <View style={styles.headerLeft}>{leftComponent}</View>
    <Text style={styles.headerTitle}>{title}</Text>
    <View style={styles.headerRight}>{rightComponent}</View>
  </View>
);

// Vital sign card components
export const VitalSignCard = ({
  title,
  value,
  unit,
  icon,
  backgroundColor,
  textColor,
  style = {},
}) => (
  <View style={[styles.vitalCard, { backgroundColor }, style]}>
    <View style={styles.vitalCardHeader}>
      {icon}
      <Text style={[styles.vitalCardTitle, { color: textColor }]}>{title}</Text>
    </View>
    <View style={styles.vitalCardValue}>
      <Text style={[styles.vitalCardValueText, { color: textColor }]}>
        {value || "---"}
      </Text>
      <Text style={[styles.vitalCardUnit, { color: textColor }]}>{unit}</Text>
    </View>
  </View>
);

// Message component for chat
export const MessageBubble = ({ message, isCurrentUser }) => (
  <View
    style={[
      styles.messageBubble,
      isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage,
    ]}
  >
    <Text
      style={
        isCurrentUser
          ? styles.currentUserMessageText
          : styles.otherUserMessageText
      }
    >
      {message.text}
    </Text>
  </View>
);

// Divider component
export const Divider = ({ style = {} }) => (
  <View style={[styles.divider, style]} />
);

// Loading spinner with optional text
export const LoadingSpinner = ({ text }) => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={Colors.accent} />
    {text && <Text style={styles.loadingText}>{text}</Text>}
  </View>
);

// Styles
const styles = StyleSheet.create({
  // Button styles
  buttonPrimary: {
    backgroundColor: Colors.accent,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.small,
  },
  buttonPrimaryText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonSecondary: {
    backgroundColor: Colors.white,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonSecondaryText: {
    color: Colors.accent,
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonText: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonTextText: {
    fontSize: 16,
    fontWeight: "500",
  },
  buttonDisabled: {
    backgroundColor: Colors.gray300,
    borderColor: Colors.gray300,
  },

  // Card style
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    ...Shadows.small,
  },

  // Input styles
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.white,
    borderBottomWidth: 2,
    borderBottomColor: Colors.gray200,
    paddingVertical: 10,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  inputDisabled: {
    backgroundColor: Colors.gray100,
    color: Colors.gray400,
  },
  inputError: {
    borderBottomColor: Colors.warning,
  },
  errorText: {
    color: Colors.warning,
    fontSize: 12,
    marginTop: 4,
  },

  // Header styles
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.primary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primaryDark,
  },
  headerLeft: {
    flex: 1,
    alignItems: "flex-start",
  },
  headerTitle: {
    flex: 2,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
  headerRight: {
    flex: 1,
    alignItems: "flex-end",
  },

  // Vital sign card styles
  vitalCard: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    ...Shadows.small,
  },
  vitalCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  vitalCardTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
  vitalCardValue: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  vitalCardValueText: {
    fontSize: 32,
    fontWeight: "bold",
  },
  vitalCardUnit: {
    fontSize: 16,
    marginLeft: 4,
    marginBottom: 6,
  },

  // Message styles
  messageBubble: {
    maxWidth: "70%",
    padding: 12,
    borderRadius: 16,
    marginVertical: 4,
    marginHorizontal: 8,
    ...Shadows.small,
  },
  currentUserMessage: {
    backgroundColor: Colors.primaryDark,
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  otherUserMessage: {
    backgroundColor: Colors.white,
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
  },
  currentUserMessageText: {
    color: Colors.white,
  },
  otherUserMessageText: {
    color: Colors.textPrimary,
  },

  // Divider style
  divider: {
    height: 1,
    backgroundColor: Colors.gray200,
    marginVertical: 8,
  },

  // Loading spinner
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.textSecondary,
  },
});

export default {
  Colors,
  Shadows,
  Typography,
  PrimaryButton,
  SecondaryButton,
  TextButton,
  Card,
  FormInput,
  Header,
  VitalSignCard,
  MessageBubble,
  Divider,
  LoadingSpinner,
};
