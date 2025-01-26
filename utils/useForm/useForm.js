import { useState } from "react";
import { validatePassword, validatePasswordPair } from "./comparePasswords";
import { checkField } from "./checkField";

const ERR_MANDATORY = "Campo obligatorio"

const DEFAULT_VALIDATORS = {
  "nombre":[{type:"minlength",n:4},{type:"maxlength",n:20}],
  "apellidos":[{type:"minlength",n:4},{type:"maxlength",n:20}],
  "username":[{type:"minlength",n:4},{type:"maxlength",n:20},"reducedChars","lowercase"],
  "dni":"dni",
  "email":"email",
  "telefono":"phone",
}

/**
 * useForm - A custom React hook for managing form state and validation.
 *
 * @param {Array} fields - An array of form fields. Each field can be a string or an object with properties.
 *   - If a field is an object:
 *     - fieldName: {string} - The name of the field (obligatory).
 *     - validator: {string|Object|function|Array} - Validator for the field. 
 *        - Can be a string => "nombre" | "phone" | "lowercase" | "reducedChars" ...
 *        - An object => {type: "minlength", n: 4} | {type:"maxlength",n:20}
 *        - A function (use setErr)=> (value,setErr)=>{if(!EXPECTED_VALUES.includes(value)){setErr("Unexpected value")}}
 *        - A function (return Boolean) => (value)=>EXPECTED_VALUES.includes(value)
 *        - or an array of validators (e.g.,["lowercase", {type: "minlength", n: 4}] ).
 *     - ignoreDefaultValidator: {boolean} - Set to true to ignore default validators.
 *     - noMandatory: {boolean} - Set to true to make the field not mandatory.
 *     - ignore: {boolean} - The initial state for the ignore property.
 *     - noValidate: just to be sure its not being validated
 *
 *   - If a field is a string:
 *     - fieldName: {string} - The name of the field (obligatory).
 *     - validator: {string} - Validator for the field. Default is the field name.
 *     - ignoreDefaultValidator: {boolean} - Set to true to ignore default validators.
 *     - noMandatory: {boolean} - Set to true to make the field not mandatory.
 *     - ignore: {boolean} - The initial state for the ignore property.
 *
 * @returns {Array} An array containing two elements:
 *   1. An array of fields states, each state is an array containing:
 *      [inputValue, setInputValue, errInput, setErrInput, ignore, setIgnore]
 *   2. An object with global methods for the form:
 *      - validateForm: {Function} - Validates the entire form.
 *      - resetForm: {Function} - Resets the form to its initial state.
 *      - resetFormValues: {Function} - Resets form values with specified values.
 *      - formIsEdited: {Function} - Checks if any field in the form has been edited.
 *      - validateForEmptyFields: {Function} - Validates mandatory fields for emptiness.
 *      - validateFoValidFields: {Function} - Validates non-password fields and password pairs.
 */


export function useForm(fields,customValidators){

  //list of validators to use in this form
  const defaultValidators ={
    ...DEFAULT_VALIDATORS,
    ...customValidators
  }

  //fields mapped to an object
  const formFields =fields.flatMap(x=>{
    if(typeof x === "string"){
      return {
        fieldName : x,
        validator: defaultValidators[x] || x,
        noMandatory:false,
        ignore: false,
        ignoreDefaultValidator:false
      }
    }else if(typeof x === "object"){
      if(x.fieldName) return x
    }
    console.error("Wrong formated field",x)
    return []
  })
  

  
  //fields values
  const initialState = {};
  formFields.forEach((field) => {
    // console.log(field)
    initialState[field.fieldName] = {value:field?.value || '',err:'',edited:false, ignore:field.ignore || false};
  });

  const [isValidating,setIsValidating] = useState(false);
  const [formValues, setFormValues] = useState(initialState);


  //setter for field value
  const setValue = (fieldName, value) => {
    setFormValues((prev) => {
      const updated = {...prev}
      if(typeof value === "function"){
        updated[fieldName].value=value(updated[fieldName].value)
      }
      updated[fieldName].value=value;
      updated[fieldName].err=""
      updated[fieldName].edited=true
      return updated
    });
  };

  //setter for field error
  const setError = (fieldName, value) => {
    setFormValues((prev) => {
      const updated = {...prev}
      if(typeof value === "function"){
        updated[fieldName].err = value(updated[fieldName].err)
      }else{
        updated[fieldName].err=value
      }
      return updated
    });
  };

  //setter for field error
  const setIgnore = (fieldName, value=true) => {
    setFormValues((prev) => {
      const updated = {...prev}
      if(typeof value === "function"){
        updated[fieldName].ignore = value(updated[fieldName].ignore)
      }else{
        updated[fieldName].ignore=value
      }
      return updated
    });
  };

  

  //getter field value
  function getValue(fieldName){
    return formValues[fieldName].value
  }

  //getter field error
  function getError(fieldName){
    return formValues[fieldName].err
  }

  //getter field Ingore
  function getIgnore(fieldName){
    return formValues[fieldName].ignore
  }

  //getter field Edited
  function getEdited(fieldName){
    return formValues[fieldName].edited
  }




  //validate the form values, if i there any mandatory field empty returns false and sets the errors
  function validateForEmptyFields(){
    let isValid = true
    for (const k of formFields) {
      const value = getValue(k.fieldName)
      if((value === undefined || value === "") && !getIgnore(k.fieldName) && !k.noMandatory){//vacio && !igonrar && mandatory
        isValid = false
        setError(k.fieldName,ERR_MANDATORY)
      }else{
        setError(k.fieldName,"")
      }

    }

    return isValid
  }


  //validates the form values, if there is any value non valid, it sets the error and returns false
  function validateFoValidFields(){
    setIsValidating(true)
    let valid = true


    
    const pwd1Finder = (x)=>x.validator === "password" || x.validator === "password1"
    const pwd2Finder = (x)=>x.validator === "password2"

    const pwd1 = formFields.find(pwd1Finder)
    const pwd2 = formFields.find(pwd2Finder)



    if(pwd1){
      const checkPwd1 = (!pwd1.noMandatory && !getIgnore(pwd1.fieldName) && !pwd1.noValidate) //obligatorio && !ignorar
      const checkPwd2 = (!pwd2.noMandatory && !getIgnore(pwd2.fieldName) && !pwd2.noValidate) //obligatorio && !ignorar

      
      //check password pair first
      if(checkPwd1){ 
        
        if(pwd2){
          if( checkPwd2 ){//pwd2 && !ignorar
            const [validPwdPair,err1,err2] = validatePasswordPair(getValue(pwd1.fieldName),getValue(pwd2.fieldName))
            if(!validPwdPair){
              valid = false
              setError(pwd1.fieldName,err1)
              setError(pwd2.fieldName,err2)
            }
          }
          
        }else{
          const [pwd1Valid,err1] = validatePassword(getValue(pwd1.fieldName))
          if(!pwd1Valid){
            valid=false
            setError(pwd1.fieldName,err1)
          }
          
        }
      }
      
      if(!valid) return false
    }

  
    
    //if passwords valid, check non password fields
    const nonPasswordFields = formFields.filter((field) => !pwd1Finder(field) && !pwd2Finder(field))

    for (const field of nonPasswordFields) {
      const {validator,fieldName,ignoreDefaultValidator,noValidate, noMandatory} = field
      const value = getValue(field.fieldName)
      const setErr = (err)=>setError(field.fieldName,err)
      const ignore = getIgnore(field.fieldName)

      const defaultValidator = (!validator && fieldName && !ignoreDefaultValidator) ? ( defaultValidators[validator] || defaultValidators[fieldName] || validator) : undefined
      const fieldValidator = validator ? validator : defaultValidator

      if(fieldValidator){
        if(ignore || noValidate || noMandatory){
          continue
        }
      }else{
        continue
      }
      //VALIDATIONS
      const currentValid = checkField(value,setErr,fieldValidator)
      valid = currentValid && valid

    }
  
    return valid
  }




  //states like useState
  const statePair = formFields.map(k=>[
    getValue(k.fieldName),      //value
    v=>setValue(k.fieldName,v), //setValue
    getError(k.fieldName),      //error
    e=>setError(k.fieldName,e), //setError
    getIgnore(k.fieldName),     //ignore
    i=>setIgnore(k.fieldName,i) //setIgnore
  ])

  //resets the form to its initials values
  function resetForm(){
    setFormValues(initialState);
  };


  //sets all the ignore flags
  function setAllIgnores(setTo=false){
    setFormValues(prev=>{
      const updated = {...prev}
      Object.keys(updated).forEach((key)=>{
        updated[key].ignore=setTo
      })
      return updated
    })
  }

  //sets the values to its corresponding,
  //if values is Array, will set the values in order as declared on the contructor
  //if values is Object, will set the values using key as <fieldName>
  // also resets <edited> and <ignore>
  function resetFormValues(values=""){
    const newState = {};
    //set initial edited and initial ignore?

    if (Array.isArray(values)) {
      formFields.forEach(({fieldName}, i) => {
        newState[fieldName] = { value: values[i], err: '', edited: false, ignore:false };
      });
    } else if (typeof values === 'object' && values !== null) {
      Object.entries(values).forEach(([key, value]) => {
        if(formFields.some(x=>x.fieldName===key)){
          newState[key] = { value, err: '', edited: false, ignore:false};
        }else{
          console.error("Field not found in field declaration")
        }
      });
    }else if(typeof values === undefined || values === ""){
      formFields.forEach(({fieldName}, i) => {
        newState[fieldName] = { value: '', err: '', edited: false, ignore:false };
      });
    }

    setFormValues(newState);
  }

  //returns true if some field has been edited
  function formIsEdited(){
    return Object.values(formValues).some(x=>x.edited)
  }

  //returns an object with key fieldname and value vits value
  function getFormValues(){
    const result = {}
    for (const field of formFields) {
      result[field.fieldName]=getValue(field.fieldName)
    }
    return result
  }


  return [statePair,{getFormValues,resetForm,formValues,resetFormValues,formIsEdited,validateForEmptyFields, validateFoValidFields, setAllIgnores, setIsValidating,isValidating}]
}




/*
EXAMPLE UTILITZATION
  const [
    [
      [inpName,           setInpName,           errName,            setErrName],
      [inpUsername,       setInpUsername,       errUsername,        setErrUsername],
      [inpPassword,       setInpPassword,       errPassword,        setErrPassword],
      [inpRepeatPassword, setInpRepeatPassword, errRepeatPassword,  setErrRepeatPassword]
      [inpPhone,          setInpPhone,          errPhone,           setErrPhone]
    ],{resetForm,resetFormValues,formIsEdited}] = useForm([
      "name",
      {fieldName:"userName",validator:[{type:"minlength",n:4},{type:"maxlength",n:20},"reducedChars","lowercase"]},
      {fieldName:"password"},
      {fieldName:"password2",validator:"password2"},
      {fieldName:"phone", validator:"phone", noMandatory:true}
    ])


*/