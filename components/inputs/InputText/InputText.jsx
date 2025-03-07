import { Hint } from "../../Hint/Hint";
import "../inputs.css"
import './InputText.css'
import React, {  forwardRef, useRef, useImperativeHandle } from 'react'



export const InputText = forwardRef(({
  icon,
  alt,
  error,
  value,
  onChange,
  placeholder,
  title,
  typeNumber=false,
  showArrows=false,
  inline=false,
  onEnter,
  onKeyDown,
  alignRight=false,
  optional=false,
  hint="",
  ...props
},ref) => {
  const inpRef = useRef(null);

  if(showArrows && !typeNumber) console.warn("showArrows only works with typeNumber=true")
  
  //seleccionar el campo, con el cursor al final
  useImperativeHandle(ref, () => ({
    focus: () => {
      inpRef.current.focus();
      if (inpRef.current.value) {
        const length = inpRef.current.value.length;
        inpRef.current.setSelectionRange(length, length);
      }
    }
  }));

  function _onChange(e){
    // TODO if (key === "Enter" && onEnter) onEnter(e)
    onChange && onChange(e)
  }

  function handleOnEnter(event){

    if(onkeydown) onKeyDown(event)


    if(onEnter && event.key === "Enter") onEnter()
  }

  return (
    <div className={'elio-react-components Inputs input__base'+ (inline?"__row":"")}>
      {
        title &&
        <p className='input__title'>{title}
          {optional && <Hint asterisk>Opcional</Hint>}
          {hint && <Hint className="input__title__hint">{hint}</Hint>}
        </p>
      }

    <div className="input__container">
      {icon && <img className={error ? "input__icon error" : "input__icon"}
        src={icon}
        alt={alt}
        />}
      <div className="input__fieldWrapper">
        <input
          ref={inpRef}
          className={"input__element" + (error ? " error" : "") + (alignRight ? " alignRight" : "") + (showArrows ? " showArrows" : "")}
          type={typeNumber?"number":"text"}
          value={value}
          onChange={_onChange}
          placeholder={placeholder}
          onKeyDown={handleOnEnter}
          {...props}
          />
        {error &&
          <div className="messageError">
            {error}
          </div>
        }
      </div>
    </div>
    </div>
  )
})


