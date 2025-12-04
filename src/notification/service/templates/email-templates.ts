export class EmailTemplates {
  public static sendAdminEmailPasswordTemplate(password: string) {
    return (
      'ePool Administrator' +
      "Here is the default password associated with your account to sign in to the ePool's admin dashboard:"
    );
  }

  static emailVerificationTemplate(otp: string) {
    return (
      'Verification Code' +
      'To verify your account and complete your registration, please enter the following code:' +
      otp
    );
  }

  static passwordResetTemplate(otp: string) {
    return 'Password Reset' + 'Here is your password reset OTP';
  }

  static adminPasswordResetTemplate(otp: string) {
    return 'Password Reset' + 'Here is your password reset OTP';
  }

  static verifyEmailEmailTemplate(otp: string) {
    return 'Email Validation' + 'Here is your email validation OTP' + otp;
  }

  static userSignupWelcomeMailFormat(name?: string) {
    return (
      `Welcome to ePool` +
      `Hi ${name ?? 'there'},<br/>
      Welcome to ePool! You're now part of a platform that turns everyday purchases into ownership opportunities.

      Cheers to owning more of what matters,
      The ePool Team`
    );
  }
}
