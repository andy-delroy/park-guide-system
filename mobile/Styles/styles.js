// components/styles.js
import { StyleSheet } from 'react-native';
import { colors, fonts } from '../Styles/theme'; // Import your theme

const styles = StyleSheet.create({
  // General container for the app
  container: {
    flex: 1,
    backgroundColor: colors.background, 
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
    color: colors.textPrimary,  // Use theme primary text color
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
  homeContainer: {
    flexGrow: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    paddingTop: 50,
    position: 'relative', // Ensure the video stays as background
  },
  homeCentered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  homeTitle: {
    fontSize: fonts.fontSizeLarge,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 20,
    textAlign: 'left',
    paddingHorizontal: 20, // Add padding for better line breaks
    lineHeight: 40, // Improve readability
  },
  homeSubtitle: {
    fontSize: fonts.fontSizeMedium,
    color: colors.textSecondary,
    marginBottom: 32,
    textAlign: 'justify',
    paddingHorizontal: 20, // Add padding for better line breaks
    lineHeight: 24, // Add line height for readability
  },
  homeWrapper: {
    height: 200, // Adjust the height of the slideshow
    marginBottom: 20,
  },
  homeSlide: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  homeImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    borderRadius: 10,
  },
  homeTextWrapper: {
    height: 100,
    paddingHorizontal: 20,
    marginTop: 20,
    alignItems: 'center', // Center swiper itself
    zIndex: 1,
  },
  homeTextSlide: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  homeQuote: {
    fontSize: fonts.fontSizeMedium,
    color: colors.textPrimary,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 22,
  },
  cameraMainContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraButtonContainer: {
    position: 'absolute',
    bottom: 30,
    width: '100%',
    alignItems: 'center',
  },
  cameraButton: {
    backgroundColor: colors.textPrimary,
    padding: 10,
    borderRadius: 5,
  },
  cameraText: {
    color: colors.buttonText,
    fontSize: fonts.fontSizeMedium,
  },
  cameraGuideContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cameraGuideTitle: {
    fontSize: fonts.fontSizeLarge,
    fontFamily: fonts.bold,
    marginBottom: 10,
    textAlign: 'center',
    color: colors.textPrimary,
  },
  cameraGuideContent: {
    fontSize: fonts.fontSizeMedium,
    textAlign: 'center',
    marginBottom: 10,
    color: colors.textSecondary,
  },
  cameraMessage: {
    textAlign: 'center',
    paddingBottom: 10,
    color: colors.textSecondary,
  },
  cameraCard: {
    width: '100%',
    backgroundColor: colors.background,
    padding: 20,
    borderRadius: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    alignItems: 'center',
  },
  
  cameraImageWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    marginBottom: 15,
  },
  
  cameraProfileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  
  cameraName: {
    fontSize: fonts.fontSizeMediumLarge,
    fontFamily: fonts.bold,
    marginBottom: 5,
    textAlign: 'center',
    color: colors.textPrimary,
  },
  
  cameraRole: {
    fontSize: fonts.fontSizeMedium,
    color: colors.textSecondary,
    marginBottom: 15,
    textAlign: 'center',
  },
  
  cameraInfoBlock: {
    width: '100%',
    marginBottom: 10,
  },
  
  cameraLabel: {
    fontFamily: fonts.bold,
    fontSize: fonts.fontSizeSmall,
    color: colors.textPrimary,
  },
  
  cameraValue: {
    fontSize: fonts.fontSizeSmall,
    color: colors.textSecondary,
  },
  
  cameraBackButton: {
    marginTop: 20,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  
  cameraBackButtonText: {
    color: colors.buttonText,
    fontSize: fonts.fontSizeMedium,
  },
  cameraScanButton: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    elevation: 2,
  },
  
  cameraScanButtonText: {
    color: colors.buttonText,
    fontSize: fonts.fontSizeMedium,
    fontFamily: fonts.bold,
  },
  cameraInstructionText: {
    fontSize: fonts.fontSizeLarge,
    textAlign: 'center',
    marginBottom: 20,
    color: colors.textPrimary,
  },
  profileCentered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileContainer: {
    backgroundColor: colors.background,
    padding: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
  },
  profileTitle: {
    fontSize: fonts.fontSizeLarge,
    fontFamily: fonts.bold,
    color: colors.textPrimary,
  },
  profileRole: {
    fontSize: fonts.fontSizeMedium,
    color: colors.textSecondary,
    marginTop: 4,
  },
  profileDetailsContainer: {
    backgroundColor: colors.background,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  profileDetail: {
    fontSize: fonts.fontSizeMedium,
    color: colors.textSecondary,
    marginBottom: 6,
    fontFamily: fonts.bold,
    fontWeight: 'bold',
  },
  profileDetailValue: {
    fontSize: fonts.fontSizeMedium,
    color: colors.textSecondary,
  },
  profileButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  profileEditButton: {
    backgroundColor: colors.secondaryContrast,
    paddingVertical: 14,
    borderRadius: 12,
    alignSelf: 'center',
    width: '49%',
    color: colors.textPrimary,
  },
  profileSaveButton: {
    backgroundColor: 'green'
  },
  profileCancelButton: {
    backgroundColor: colors.error,
    paddingVertical: 14,
    borderRadius: 12,
    alignSelf: 'center',
    width: '49%',
  },
  profileButtonText: {
    color: colors.buttonText,
    fontSize: fonts.fontSizeMedium,
    fontFamily: fonts.bold,
    textAlign: 'center',
  },
  profileInput: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    fontSize: fonts.fontSizeMedium,
    color: colors.textPrimary,
  },

});

export default styles;
