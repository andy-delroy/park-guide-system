// components/SharedStyles.js
import { StyleSheet } from 'react-native';
import { colors, fonts } from '../Styles/theme'; // Import your theme

const styles = StyleSheet.create({
  // General container for the app
  container: {
    flex: 1,
    backgroundColor: colors.background, // Updated to use theme background color
    justifyContent: 'center',
    padding: 20,
  },

  // Logo styles
  logo: {
    width: 150,  // Adjust size of logo as needed
    height: 200,
    alignSelf: 'center',
    marginBottom: 20,  // Add spacing below the logo
  },

  // Title text styles
  title: {
    fontSize: fonts.fontSizeLarge,  // Use theme font size
    fontWeight: '700',
    color: colors.textPrimary,  // Use theme primary text color
    marginBottom: 8,
    textAlign: 'center',
  },

  // Subtitle text styles
  subtitle: {
    fontSize: fonts.fontSizeMedium,  // Use theme font size
    color: colors.textSecondary,  // Use theme secondary text color
    marginBottom: 32,
    textAlign: 'center',
  },

  // Input field styles
  input: {
    height: 50,
    backgroundColor: colors.background,  // Use theme background color
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: fonts.fontSizeMedium,  // Use theme font size
    borderColor: colors.border,  // Use theme border color
    borderWidth: 1,
  },

  // Checkbox styles
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: colors.textPrimary,  // Use theme primary text color
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    backgroundColor: colors.background,  // Use theme background color
  },

  // Checkmark styles
  checkmark: {
    color: colors.textPrimary,  // Use theme primary text color
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Remember me text styles
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  rememberText: {
    fontSize: fonts.fontSizeMedium,  // Use theme font size
    color: colors.textPrimary,  // Use theme primary text color
  },

  // Button styles
  button: {
    backgroundColor: colors.primary,  // Use theme primary color
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },

  // Register button styles (primary color)
  registerButton: {
    marginTop: 10,
    backgroundColor: colors.primaryContrast,  // Use theme primary contrast color
  },

  // Button text styles
  buttonText: {
    color: colors.buttonText,  // Use theme button text color
    fontSize: fonts.fontSizeMedium,  // Use theme font size
    fontFamily: fonts.bold,  // Use theme bold font
  },

  // Error message text styles
  errorText: {
    color: colors.error,  // Use theme error color
    fontSize: fonts.fontSizeSmall,  // Use theme small font size
    textAlign: 'center',
    marginTop: 10,
  },
  
  // Bottom text styles
  bottomText: {
    color: colors.textSecondary,  // Use theme textSecondary color
    fontSize: fonts.fontSizeMedium,  // Use theme medium font size
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 16,
  },

  // Link text styles (for clickable links)
  linkText: {
    color: colors.textSecondary,  // Use theme textSecondary color
    fontWeight: '600',
    textDecorationLine: 'underline', // Underline to indicate it's clickable
  },
});

export default styles;
