// npm i libphonenumber-js
// import { parsePhoneNumber, AsYouType } from 'libphonenumber-js'

// export function normalizePhoneNumber(phone,doubleCheck=false) {
//   try {
//     // Create an AsYouType instance to format the input
//     const asYouType = new AsYouType();

//     // Input phone number without spaces and dashes
//     const normalizedPhone = phone.replace(/[\s-]/g, '');

//     // Parse the phone number
//     const phoneNumber = parsePhoneNumber(normalizedPhone);

//     if (phoneNumber.isValid()) {
//       // Format the parsed phone number with the country code
//       return asYouType.input(`+${phoneNumber.countryCallingCode}${phoneNumber.nationalNumber}`);
//     }
//   } catch (error) {
//     // Invalid phone number
//   }

//   if(!doubleCheck) return normalizePhoneNumber("+34"+phone,true)
//   return undefined;
// }
