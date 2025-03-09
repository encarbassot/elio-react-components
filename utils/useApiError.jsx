import { useState } from "react";
import { TextModal } from "../components/Modals/TextModal/TextModal";

export default function useApiError() {
    const [errModal, setErrModal] = useState(null);   // General error messages
    const [errFields, setErrFields] = useState({});   // Field-specific errors
    const [errCode, setErrCode] = useState(null);   // Field-specific errors

    // Function to validate API response and update state
    function validateResponse(response, defaultMsg = "Ha ocurrido un error inesperado.") {
        if (response?.success) {
            return true; // API call was successful
        }

        const error = getErrMsgFromResp(response, defaultMsg);

        const modalStr = error.global.length ? error.global.join(". ") : null
        const modalComponent = error.global.length ? <TextModal title="Error :(" aceptar={()=>setErrModal(null)} setIsOpen={()=>setErrModal(null)}>{modalStr}</TextModal> : null

        setErrCode(error.code)
        setErrModal(modalComponent);  // Set general error message
        setErrFields(error.fields);  // Set field-specific errors

        return false; // API call failed
    }

    // Clears all errors
    function clearErrors() {
        setErrModal(null);
        setErrFields({});
    }

    function setFieldError(field, message) {
        setErrFields({ ...errFields, [field]: message });
    }

    return { errModal, errFields,errCode, setFieldError, validateResponse, clearErrors };
}












export function getErrMsgFromResp(resp, defaultMsg = "Ha ocurrido un error inesperado.") {

  if(resp?.success){
    return {}
  }
  let errors = {
    fields: {}, // Field-specific validation errors (for form inputs)
    global: [],  // General validation issues (e.g., entire form invalid)
    code:"GENERAL"
  };

  if(!resp){
    return { fields: {}, global: ["El servicio no está disponible en este momento. Por favor, intenta de nuevo más tarde."], code:"GENERAL" };
  }

  if (!resp || typeof resp !== "object" || !resp.err || !resp.err.more) {
    return { fields: {}, global: [defaultMsg], code:"GENERAL" };
  }

  if(resp.err.error && typeof resp.err.error === "string"){
    errors.code = resp.err.error
  }

  // Extract field-specific errors (only if it's an object with string values)
  if (
    resp.err.more.fields &&
    typeof resp.err.more.fields === "object" &&
    Object.values(resp.err.more.fields).every(value => typeof value === "string")
  ) {
    Object.entries(resp.err.more.fields).forEach(([field, message]) => {
      errors.fields[field] = message;
    });
  }

  // Extract additional validation info
  if (resp.err?.more?.more) {
    if (typeof resp.err.more.more === "string") {
      errors.global.push(resp.err.more.more);
    } else if (typeof resp.err.more.more === "object") {
      Object.entries(resp.err.more.more).forEach(([key, detail]) => {
        if (typeof detail === "string") {
          errors.global.push(`${key}: ${detail}`);
        }
      });
    }
  }

  // Fallback to default message if nothing was extracted
  if (!Object.keys(errors.fields).length && errors.global.length === 0) {
    errors.global.push(defaultMsg);
  }

  return errors;
}