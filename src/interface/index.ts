export interface IJwtPayLoadData {
  email: string;
  firstName: string;
  lastName: string;
  sub: string;
  isDeactivated: boolean;
  phone: string;
}

export interface ISendAdminEmailPasswordMailFormat {
  email: string;
  password: string;
}

export interface ISignUpVerificationMailFormat {
  email: string;
  otp: string;
  name: string;
}

export interface IResetPasswordMailFormat {
  email: string;
  otp: string;
}

export interface IResetPasswordMailFormat {
  email: string;
  otp: string;
}

export interface IResetPasswordMailFormat {
  email: string;
  otp: string;
}

export interface IUserSignupWelcomeMailFormat {
  email: string;
  name?: string;
}

