import { useEffect, useState } from "react"
import "./ElioForm.css"
import { InputText }     from "../inputs/InputText/InputText"
import InputPhone        from "../inputs/InputPhone/InputPhone"
import { InputPassword } from "../inputs/InputPassword/InputPassword"
import { InputSelect }   from "../inputs/InputSelect/InputSelect"
import InputToggle       from "../inputs/InputToggle/InputToggle"


// ── Helpers ────────────────────────────────────────────────────────────────

const BASE_FIELDS = new Set(["id", "active", "created_at", "updated_at"])

/** Duck-type check: does this look like an ElioModel instance? */
function isElioModel(model) {
  return (
    model != null &&
    typeof model.fields === "function" &&
    model._fields != null &&
    typeof model._fields === "object"
  )
}

/**
 * Returns ordered array of { name, field } to render.
 * `field` is an ElioField-like object with at least { _type, _required, _optional, _rules, _meta }.
 */
function resolveFieldList(model, fieldNames) {
  const elio = isElioModel(model)
  const allFields = elio ? model.fields() : (model && typeof model === "object" ? model : {})

  const names = fieldNames
    ? fieldNames
    : Object.keys(allFields).filter(k => {
        if (BASE_FIELDS.has(k)) return false
        if (elio) return allFields[k]._groups?.includes("public")
        return true
      })

  return names.filter(n => allFields[n]).map(n => ({ name: n, field: allFields[n] }))
}

/** Map an ElioField (or plain descriptor) to a logical input kind. */
function inputKind(name, field) {
  const type = field._type ?? field.type
  if (name === "password")                              return "password"
  if (name === "phone")                                 return "phone"
  if (type === "boolean")                               return "toggle"
  if (type === "number")                                return "number"
  if (type === "enum")                                  return "select"
  if (type === "date")                                  return "date"
  if (field._rules?.some(r => r.name === "email"))      return "email"
  return "text"  // string, text, ref, hex, raw → plain text
}

function defaultValue(field) {
  if (field._default !== undefined) return field._default
  if ((field._type ?? field.type) === "boolean") return false
  return ""
}


// ── Component ──────────────────────────────────────────────────────────────

/**
 * ElioForm – auto-generates a form from an ElioModel (or a plain schema object).
 *
 * @example — with ElioModel
 *   import { Workspace } from '../models/Workspace'
 *   import { ElioModel, ElioField } from 'elioapi/frontend'
 *   const WorkspaceModel = Workspace(ElioModel, ElioField)
 *
 *   <ElioForm
 *     model={WorkspaceModel}
 *     fields={["name", "description"]}
 *     onSubmit={(values) => api.workspaces.create(values)}
 *   />
 *
 * @example — without elioapi (plain schema)
 *   <ElioForm
 *     model={{
 *       name:  { _type: "string", _required: true,  _optional: false, _rules: [] },
 *       email: { _type: "string", _required: true,  _optional: false, _rules: [{ name: "email" }] },
 *     }}
 *     onSubmit={(values) => console.log(values)}
 *   />
 */
export default function ElioForm({
  model,
  fields: fieldNames,
  initialValues = {},
  onSubmit,
  onCancel,
  submitLabel = "Submit",
  cancelLabel = "Cancel",
  isLoading = false,

  values,
  onChange,
}) {
  const resolvedFields = resolveFieldList(model, fieldNames)

  const [internalValues, setInternalValues] = useState(() => {
    const init = values ?? {}
    for (const { name, field } of resolvedFields) {
      console.log("Initializing field", name, "with initial value", initialValues[name])
      init[name] = initialValues[name] !== undefined
        ? initialValues[name]
        : defaultValue(field)
    }
    return init
  })

  useEffect(()=>{
    if (values) setInternalValues(values)
  },[values])

  const [errors, setErrors] = useState({})

  function setValue(name, value) {
    setInternalValues(prev => {
      const newValues = ({ ...prev, [name]: value })
      if (onChange) onChange(newValues)
      return newValues
    })
    
    setErrors(prev => ({ ...prev, [name]: "" }))
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (isElioModel(model)) {
      const { value: validated, errors: validationErrors } = model.validate(undefined, internalValues)
      if (validationErrors) {
        setErrors(validationErrors)
        return
      }
      if (onSubmit) await onSubmit(validated ?? internalValues)
    } else {
      if (onSubmit) await onSubmit(internalValues)
    }
  }

  return (
    <form className="elio-react-components ElioForm" onSubmit={handleSubmit}>

      {resolvedFields.map(({ name, field }) => {
        const kind        = inputKind(name, field)
        const title       = name.replace(/_/g, " ")
        const optional    = field._optional ?? field.optional ?? !(field._required ?? field.required ?? false)
        const error       = errors[name] || ""
        const enumValues  = field._meta?.enumValues ?? field.enumValues ?? []

        return (
          <div key={name} className="ElioForm__field">
            {kind === "toggle"
              ? <InputToggle
                  title={title}
                  value={internalValues[name]}
                  onChange={v => setValue(name, v)}
                />
              : kind === "select"
              ? <InputSelect
                  title={title}
                  options={enumValues}
                  value={internalValues[name]}
                  onChange={v => setValue(name, v)}
                  optional={optional}
                  error={error}
                />
              : kind === "password"
              ? <InputPassword
                  title={title}
                  value={internalValues[name]}
                  onChange={e => setValue(name, e.target.value)}
                  optional={optional}
                  error={error}
                />
              : kind === "phone"
              ? <InputPhone
                  title={title}
                  value={internalValues[name]}
                  onChange={v => setValue(name, v)}
                  error={error}
                />
              : <InputText
                  title={title}
                  value={internalValues[name]}
                  onChange={e => setValue(name, e.target.value)}
                  typeNumber={kind === "number"}
                  optional={optional}
                  error={error}
                />
            }
          </div>
        )
      })}

      <div className="ElioForm__actions">
        {onCancel && (
          <button type="button" className="secondary" onClick={onCancel} disabled={isLoading}>
            {cancelLabel}
          </button>
        )}
        {
          !onSubmit &&
          <button type="submit" disabled={isLoading}>
            {isLoading ? <span className="spinner small" /> : submitLabel}
          </button>
        }
      </div>

    </form>
  )
}
