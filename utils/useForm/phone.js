
// >> npm i libphonenumber-js
import parsePhoneNumberFromString, { parsePhoneNumber, AsYouType } from 'libphonenumber-js'

export function normalizePhoneNumber(phone,doubleCheck=false) {
  try {
    // Create an AsYouType instance to format the input
    const asYouType = new AsYouType();

    // Input phone number without spaces and dashes
    const normalizedPhone = phone.replace(/[\s-]/g, '');

    // Parse the phone number
    const phoneNumber = parsePhoneNumber(normalizedPhone);

    if (phoneNumber.isValid()) {
      // Format the parsed phone number with the country code
      return asYouType.input(`+${phoneNumber.countryCallingCode}${phoneNumber.nationalNumber}`);
    }
  } catch (error) {
    // Invalid phone number
  }

  if(!doubleCheck) return normalizePhoneNumber("+34"+phone,true)
  return undefined;
}


export function validatePhoneInput([code,phone,fullPhone]){
  const result = {
    isValid:true,
    err:"",
    err2:"",
    formattedValue:fullPhone,
  }
  if(!code || code.length < 3 || !code.startsWith("+")){
    result.err2 = "Código inválido"
    result.isValid = false
  }

  if (!phone || phone.replace(/\D/g, "").length < 9) {
    result.err = "Número de teléfono inválido";
    result.isValid = false;
  }

  const parsed = parsePhoneNumberFromString(fullPhone);
  if (!parsed || !parsed.isValid()) {
    result.err = "Número de teléfono inválido";
    result.isValid = false;
  } else {
    const formatedNational = parsed.format('NATIONAL').replace(/\s+/g, "-");
    result.formattedValue = `+${parsed.countryCallingCode}-${formatedNational}`;
  }
  return result
}

export function getPhoneArrayFromString(str, defaultCountry ="ES"){
  const parsed = parsePhoneNumber(str, defaultCountry);

  if(!parsed || !parsed.isValid()) return ["","",""]

  const code = `+${parsed.countryCallingCode}`;
  const phone = parsed.nationalNumber;
  const fullNumber = parsed.format('E.164'); // Full international format

  return [code, phone, fullNumber];
  
}