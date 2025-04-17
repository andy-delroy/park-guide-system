// components/styles.js
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
    fontFamily: fonts.bold,
    color: colors.textPrimary,  // Use theme primary text color
    marginBottom: 8,
    textAlign: 'center',
  },

  // Subtitle text styles
  subtitle: {
    fontSize: fonts.fontSizeMedium,  // Use theme font size
    fontFamily: fonts.regular,
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
    fontFamily: fonts.regular,
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
    fontSize: fonts.fontSizeSmall,  // Use theme small font size
    fontFamily: fonts.bold,
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
    fontFamily: fonts.regular,
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
    fontFamily: fonts.regular,
  },
  
  // Bottom text styles
  bottomText: {
    color: colors.textSecondary,  // Use theme textSecondary color
    fontSize: fonts.fontSizeMedium,  // Use theme medium font size
    fontFamily: fonts.regular,
    textAlign: 'center',
    marginTop: 16,
  },

  // Link text styles (for clickable links)
  linkText: {
    color: colors.textSecondary,  // Use theme textSecondary color
    fontFamily: fonts.bold,
    textDecorationLine: 'underline', // Underline to indicate it's clickable
  },
  // Centered container for loading screens or placeholders
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  modalContainer: {
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    position: 'absolute',
    zIndex: 10,
  },
  modalTitle: {
    fontSize: fonts.fontSizeMedium,
    fontFamily: fonts.bold,
    marginBottom: 12,
    color: colors.primary,
    textAlign: 'center',
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 6,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  modalButtonText: {
    color: colors.background,
    textAlign: 'center',
    fontFamily: fonts.medium,
    fontSize: fonts.fontSizeMedium,
  },
  topNavContainer: {
    height: 60,
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 4,
  },
  topNavImage: {
    width: 130,
  },
  topNavTitle: {
    fontSize: fonts.fontSizeMediumLarge,
    fontFamily: fonts.bold,
    fontWeight: 'bold',
    color: colors.buttonText,
  },
  logoutContainer: {
    padding: 20,
    marginBottom: 10,
  },
  logoutButton: {
    backgroundColor: colors.error,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutText: {
    color: colors.buttonText,
    fontSize: fonts.fontSizeMedium,
    fontFamily: fonts.bold,
  },
  drawerLabel: {
    fontSize: fonts.fontSizeMediumLarge,
    fontFamily: fonts.regular,
    color: colors.textPrimary, // optional
  },

});

export default styles;
