export class SMSTemplates {
  static emailVerificationTemplate(otp: string) {
    return `Hi,\nTo verify your Brane account please enter the pin: ${otp}. It is valid for the next 10 minutes`;
  }

  static airtimePurchaseSuccessTemplate(
    phone: string,
    amount: number,
    message: string,
  ) {
    return `Your airtime purchase of ${amount} for ${phone} was successful. ${message}. Thank you for using Brane.`;
  }

  static dataPurchaseSuccessTemplate(
    phone: number,
    amount: number,
    message: string,
  ) {
    return `Your data purchase of ${amount} for ${phone} was successful. ${message}. Thank you for using Brane.`;
  }

  static walletTopUpSuccessTemplate(amount: number, balance: number) {
    return `Your wallet has been successfully topped up with ${amount}. Current balance: ${balance}`;
  }

  static stockCompletionUpdateSuccessTemplate(amount: number, email: string) {
    return `Your order for ${amount} asset has been completed successfully. Thank you for choosing Brane. For inquiries, contact ${email}`;
  }

  static passwordResetTemplate(otp: string) {
    return `Hi,\nTo reset your Brane account password please enter the pin: ${otp}. It is valid for the next 10 minutes`;
  }

  static sendDeleteUserSMS(otp: string, name: string) {
    return `Hi ${
      name || ''
    },\nWe the Brane team are so sorry to see you exit our platform. Here is the pin required to complete this process. ${otp}. It is valid for the next 10 minutes.`;
  }

  static sendResetUsernameSMS(otp: string, name: string) {
    return `Hi ${
      name || ''
    },\nWe are happy to see you reset your username. Here is the pin required to complete this process ${otp}. It is valid for the next 10 minutes.`;
  }

  static sendPhoneNumberVerificationSMS(otp: string) {
    return `Hi,\nYour Brane Verification Pin is ${otp}. It is valid for the next 10 minutes`;
  }

  static userSignupWelcomeSMS() {
    return `Hi there,\nWelcome to Brane we are happy to have you onboard. Powered By Brane
`;
  }
}
