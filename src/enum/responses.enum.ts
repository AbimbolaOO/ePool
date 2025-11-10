export enum SUCCESS_MESSAGES {
  OTP_RESENT = 'OTP resent successfully',
  PASSWORD_RESET_SUCCESSFULLY = 'Password reset successfully',
  SUCCESSFUL_VERIFICATION = 'Successful verification',
  SIGNIN_SUCCESSFUL = 'Sign-in successful',
  AUTH_CREDENTIALS = 'Auth credentials',
}

export enum ERROR_MESSAGES {
  INVALID_CREDENTIALS = 'Invalid credentials',
  EMAIL_MUST_BE_SPECIFIED = 'Email must be specified',
  USER_NOT_FOUND = 'User not found',
  UNIQUE_CONSTRAINT = 'UNIQUE constraint failed',
  ACCOUNT_ALREADY_EXIST_KINDLY_LOGIN = 'Account already exists, kindly login',
  INTERNAL_SERVER_ERROR = 'Internal server error',
  ACCOUNT_IS_NOT_VERIFIED = 'Account is not verified',
  CANNOT_GENERATE_OTP = 'Cannot generate OTP for verified account',
  INVALID_OTP_RESEND_ATTEMPT = 'Invalid OTP resend attempt',
  PLEASE_USE_NEW_PASSWORD = 'Please use a new password',
  NO_PASSWORD = 'No password set for this account',
}

