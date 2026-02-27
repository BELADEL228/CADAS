// Validateurs communs
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const isValidPhone = (phone: string): boolean => {
  // Format togolais: +228 XX XX XX XX ou 90 XX XX XX
  const phoneRegex = /^(\+228|0)[0-9]{8}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

export const isValidPrice = (price: number): boolean => {
  return price > 0 && price < 1000000000 // Max 1 milliard
}

export const isValidSurface = (surface: number): boolean => {
  return surface > 0 && surface < 100000 // Max 100 000 m²
}

export const isStrongPassword = (password: string): boolean => {
  // Au moins 8 caractères, une majuscule, une minuscule, un chiffre
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/
  return passwordRegex.test(password)
}