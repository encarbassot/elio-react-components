// DEPRECATED
export function getErrMsgFromResp(resp, defaultMsg = "Ha ocurrido un error inesperado.") {

  if(resp?.success){
    return {}
  }
  let errors = {
    fields: {}, // Field-specific validation errors (for form inputs)
    global: [],  // General validation issues (e.g., entire form invalid)
    code:"GENERAL"
  };

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
