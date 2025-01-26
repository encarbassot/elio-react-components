import { validatePassword, validatePasswordPair } from "./comparePasswords"
import { isDniNieValid } from "./isDniValid"
// import { normalizePhoneNumber } from "./normalizePhone"

const ERR_MANDATORY = "Campo obligatorio"
const ERR_NOVALID = "No valido"
const REDUCED_CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_.'

const DEFAULT_VALIDATORS = {
  "nombre":[{type:"minlength",n:4},{type:"maxlength",n:20}],
  "apellidos":[{type:"minlength",n:4},{type:"maxlength",n:20}],
  "username":[{type:"minlength",n:4},{type:"maxlength",n:20},"reducedChars","lowercase"],
  "dni":"dni",
  "email":"email",
  "telefono":"phone",
}



/* EJEMPLO

  <InputText 
    value={valUsername}
    onChange={(e)=>handleChangeValueWithErr(e.target.value.toLowerCase(),setValUsername,setErrUsername,isValidating?"nombre_usuario":"")}
    error={errUsername}
  />
*/
export function handleChangeValueWithErr(value,setter,errSetter,validateAs=""){
  setter(value)
  if(validateAs === ""){
    errSetter("")
  }else{
    // console.log("VALIDATE AS ",validateAs)
    const validator = DEFAULT_VALIDATORS[validateAs] || validateAs
    checkField(value,errSetter,validator)
  }
}





export function validateForEmtyFields(fields){
  let valid = true

  for (const {value,setErr,ignore,noMandatory} of fields) {
    if((value=== undefined || value === "") && !ignore && !noMandatory){
      valid = false
      setErr(ERR_MANDATORY)
    }else{
      setErr("")
    }
  }

  return valid
}




export function validateFoValidFields(fields){
  let valid = true
  //check password pair first
  const pwd1 = fields.find(x=>x.validator === "password")
  const pwd2 = fields.find(x=>x.validator === "password2")

  if(pwd1 && !pwd1.ignore){
    if( pwd2 && !pwd2.ignore ){
      const [validPwdPair,err1,err2] = validatePasswordPair(pwd1.value,pwd2.value)
      if(!validPwdPair){
        valid = false
        pwd1.setErr(err1)
        pwd2.setErr(err2)
      }
    }else if(!pwd1.noMandatory || pwd1.value.length>0){
      const [pwd1Valid,err1] = validatePassword(pwd1.value)
      if(!pwd1Valid){
        valid=false
        pwd1.setErr(err1)
      }
    }
  }

  

  const nonPasswordFields = fields.filter((field) => field.validator !== "password" && field.validator !== "password2");
  for (const {value,setErr,validator,ignore,name,ignoreDefaultValidator } of nonPasswordFields) {
    const defaultValidator = (!validator && name && !ignoreDefaultValidator) && DEFAULT_VALIDATORS[name]
    const fieldValidator = validator || defaultValidator
    if(!fieldValidator || ignore) continue // si no hay validator salta al siguiente

    //VALIDATIONS
    const currentValid = checkField(value,setErr,fieldValidator) 
    valid = currentValid&& valid
    // console.log(currentValid,value,fieldValidator)
  }

  return valid
}










function checkField(value,_setErr,validator,isLooping = false){
  let valid = true
  let hasError = false

  function setErr(err=ERR_NOVALID){
    valid = false
    if(hasError) return false // no valid
    
    hasError=true
    _setErr(err)
  }


  if(typeof(validator) === "string"){
    const validatorStr = validator.toLowerCase()

    // if(validatorStr === "phone"){
    //   if(normalizePhoneNumber(value)===undefined){
    //     setErr(ERR_NOVALID)
    //   }
    // }else 
    if(validatorStr === "dni"){
      if(!isDniNieValid(value)){
        setErr(ERR_NOVALID)    
      }
  
    }else  if(validatorStr === "email"){
      if(!validateEmail(value)){
        setErr(ERR_NOVALID)    
      }
  
    }else if(validatorStr === "reducedchars"){
      const regex = new RegExp(`[^${REDUCED_CHARS}]`);
      const match = value.match(regex);

      if(match){
        setErr(`Caracter ${match[0]} no permitido`)
      }
    }else if(validatorStr === "lowercase"){
      if(/[A-Z]/.test(value)){
        setErr(`Mayúsculas no permitidas`)
      }
    }else if(validatorStr === "number"){
      // Ensure the value only contains digits
      if(!/^\d+$/.test(value)){
        setErr(`Solo se permiten números`)
      }
    }


  // OBJETO
  }else if(typeof(validator) === "object" && validator.type){
    const {type,n} = validator

    if(type==="minlength" && n){
      if(value.length<n){
        setErr(`Mínimo ${n} caracteres`)
      }
    }else if(type === "maxlength" && n){
      if(value.length>n){
        setErr(`Máximo ${n} caracteres`)
      }
    }


  // VALIDATOR LIST check recursibely
  }else if(Array.isArray(validator)){
    for (const validation of validator) {
      const currentValid = checkField(value,setErr,validation,true) 
      valid = currentValid && valid
    }
    if(valid){
      setErr("")
      return true
    }else{
      return false
    }
  }

  
  
  if(valid && !isLooping){
    _setErr("")
  }
  return valid
}




























export function validateEmail(email) {
  const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return regex.test(email);
}


  
  
  
  
  
  
  











export function capitalizeWords(str){
  const chars = str.split("")
  if(chars.length>0){
    chars[0] = chars[0].toUpperCase()
  }

  for(let i=1;i<str.length;i++){
    const prev = chars[i-1]
    const current = chars[i]
    if(prev===" " && current!==" "){
      chars[i] = current.toUpperCase()
    }else{
      chars[i] = current.toLowerCase()
    }
  }

  return chars.join("")
}




  