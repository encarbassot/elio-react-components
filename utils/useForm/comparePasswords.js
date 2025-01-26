const SPECIAL_CHARACTERS = "!@#$%^&*()_-+={}[]|:;\"<>,.?/~\\`"
const MIN_LENGTH = 6

export function validatePasswordPair(password1, password2) {
  //return [true,"",""] //skip only for development
  const [firstValid,err1] = validatePassword(password1)
  let err2 = (password1 === password2) ? "" : "No coinciden"
  const isAllValid = firstValid && err2===""
  return [isAllValid,err1,err2]
}



export function validatePassword(password){
  const hasMinimumLength = password.length>=MIN_LENGTH
  const hasLowercase = /[a-z]/.test(password)
  const hasUppercase = /[A-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecialCharacter = password.split("").some(x => SPECIAL_CHARACTERS.includes(x))

  let err1 = ""

  if (!hasMinimumLength) {
    err1 = `Mínimo ${MIN_LENGTH} caracteres`
  }else if(!hasLowercase){
    err1="Mínimo una minúscula"
  }if (!hasSpecialCharacter && !hasUppercase && !hasNumber) {
    err1 = "Falta mayúscula, número o caracter especial"
  }

  return [err1==="",err1]
}