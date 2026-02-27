export type RootStackParamList = {
  Auth: undefined
  Main: undefined
  PropertyDetail: { id: string }
  AddProperty: undefined
  TransactionDetail: { id: string }
  Chat: { transactionId: string }
  Profile: undefined
  KYCVerification: undefined
}

export type AuthStackParamList = {
  Login: undefined
  Register: undefined
  ForgotPassword: undefined
}

export type MainTabParamList = {
  Home: undefined
  Search: undefined
  Favorites: undefined
  Messages: undefined
  Profile: undefined
}