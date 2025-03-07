import { useEffect, useImperativeHandle, useRef, useState } from 'react';
import './InputPhone.css';
import { InputText } from '../InputText/InputText';
// import { getCountries, getCountryCallingCode } from 'libphonenumber-js';
import { Hint } from '../../Hint/Hint';
import { useDebounce } from '../../../hooks';
import { normalizePhoneNumber } from '../../../utils/useForm/phone';

// const countries = getCountries();
// const countryCodeList = countries.map(countryCode => {
//   return {
//     countryCode,
//     countryName: new Intl.DisplayNames(['en'], { type: 'region' }).of(countryCode),
//     callingCode: getCountryCallingCode(countryCode)
//   };
// });


  
export default function InputPhone({
  ref,
  value,
  error2="",
  onChange,
  placeholder="612345678",
  title,
  inline=false,
  onEnter,
  onKeyDown,
  defaultCode="+34",
  optional=false,
  hint="",
  ...props
}) {


  const isValidArray = Array.isArray(value) && value.length >= 2;
  const initialCode = isValidArray && typeof value[0] === "string" ? value[0] : defaultCode;
  const initialPhone = isValidArray && typeof value[1] === "string" ? value[1] : "";

  const [code,setCode] = useState(initialCode)
  const [phone,setPhone] = useState(initialPhone)

  const refCode = useRef(null)
  const refPhone = useRef(null)
  
  useEffect(() => {
    if (isValidArray) {
      setCode(typeof value[0] === "string" ? value[0] : defaultCode);
      setPhone(typeof value[1] === "string" ? value[1] : "");
    }
  }, [value]);


  useEffect(()=>{
    if(onChange) onChange([code,phone,code+"-"+phone])
  },[code,phone])

  useEffect(()=>{
    handleSetPhone(phone)
  },[code])

  useImperativeHandle(ref, () => ({
    focus: ()=>{
      refCode.current.focus()
    }
  }));

  const debouncedFormatPhone = useDebounce(700, (newPhone) => {
    const formattedPhone = normalizePhoneNumber(code + newPhone);
    if (formattedPhone) {
      const finalFormat = cleanPhoneString(formattedPhone.replace(code, ""));
      setPhone(finalFormat);
    }
  },(newPhone) => setPhone(newPhone));



  function handleSetCode(v) {
    // Allow only numbers 
    let cleaned = v.replace(/[^0-9]/g, "");
  
    // Ensure it starts with '+'
    if (!cleaned.startsWith("+")) {
      cleaned = "+" + cleaned;
    }
  
    setCode(cleaned);
  }

  function cleanPhoneString(phone){
    let cleaned = phone.replaceAll("-", " ").trim().replaceAll(" ","-");
    cleaned = cleaned.replace(/[^0-9\-\/]/g, "");
    return cleaned
  }

  function handleSetPhone(newPhone){
    let cleaned = cleanPhoneString(newPhone);
    debouncedFormatPhone(cleaned);
  }
  
  return (
    <div className={'elio-react-components Inputs InputPhone input__base'+ (inline?"__row":"")}>

      {
        title &&
        <p className='input__title'>{title}
          {optional && <Hint asterisk>Opcional</Hint>}
          {hint && <Hint className="input__title__hint">{hint}</Hint>}
        </p>
      }

      <div className="input__container">
        <div className="input__fieldWrapper row">
          <InputText 
            value={code}
            onChange={e=>handleSetCode(e.target.value)}
            placeholder="+34"
            alignRight
            ref={refCode}
            onEnter={()=>refPhone.current.focus()}
            error={error2}
          />
          <InputText
            value={phone}
            onChange={e=>handleSetPhone(e.target.value)}
            placeholder={placeholder}
            onKeyDown={onkeydown}
            onEnter={onEnter}
            ref={refPhone}
            
            {...props}
          />
        </div>
      </div>

    </div>
  );
}
  

