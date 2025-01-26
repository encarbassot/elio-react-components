import { useEffect, useState } from "react"
import "./InputToggle.css"
import "../inputs.css"


export default function InputToggle({
  value = false,
  onChange,
  disabled = false,
  title,
}){


  const [inpValue,setInpValue] = useState(value)

  useEffect(() => {
    setInpValue(value)
  }, [value])

  function handleChange(e) {
    e.preventDefault()
    if (disabled) return; // Prevent change if disabled
    const newValue = !inpValue
    setInpValue(newValue)

    // Notify the parent component if onChange is provided
    if (onChange) {
      onChange(newValue)
    }
  }

  return (
    <div className="elio-react-components Inputs InputToggle input__base__row">
      {
        title && 
        <p className="input__title">{title}</p>
      }
      <button 
        className={"action"+ (inpValue ? " checked" : "")} 
        onClick={e=>handleChange(e)}
      >
        <div className="wrapper">
          <span className="slider"></span>
        </div>
      </button>
    </div>
  )
}