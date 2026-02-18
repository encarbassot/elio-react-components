
import React, { useState, forwardRef, useRef, useImperativeHandle, useEffect } from 'react'

import lockIcon from "../../../assets/icons/candado.svg"
import eye_hidden from '../../../assets/icons/eye-hidden.svg'
import eye_visible from '../../../assets/icons/eye-visible.svg'
import "../inputs.css"
import { Hint } from '../../Hint/Hint'
// import "./InputPassword.css" 

//export default
export const  InputPassword = forwardRef(({icon,error,value,onChange,title,onEnter, onKeyDown, optional = false,...props},ref)=>{
    const [visible,setVisible] = useState(false)
    const [isCapsLockActive,setIsCapsLockActive] = useState(false)
  
    const inpRef = useRef(null);
  
    useEffect(()=>{
  
      const checkCapsLock = (event) => {
        if(event.code === "CapsLock"){
          setIsCapsLockActive(!event.getModifierState("CapsLock"))
          return
        }
        setIsCapsLockActive(event.getModifierState('CapsLock'))
      }
  
      document.addEventListener('keydown',checkCapsLock)
      return ()=>{
        document.removeEventListener('keydown',checkCapsLock)
      }
    },[])
  
  
    //focus input con el cursor al final
    useImperativeHandle(ref, () => ({
      focus: () => {
        inpRef.current.focus();
        if (inpRef.current.value) {
          const length = inpRef.current.value.length;
          inpRef.current.setSelectionRange(length, length);
        }
      }
    }));
  
    //cambia visibilidad de la contraseña
    function handleChangeVisibility(){
      setVisible((prev)=>!prev)
      inpRef.current?.focus()
    }


    function handleOnEnter(event){

      if(onkeydown) onKeyDown(event)
  
      if(onEnter && event.key === "Enter") onEnter(event)
    }
  
    return(
      <div className='elio-react-components Inputs input__base'>
      {
        title &&
        <p className='input__title'>
          {title}
          {!optional && <Hint asterisk>Requerido</Hint>}
        </p>
        
      }
        <div className="input__container">
          {icon && <img className={error ? "input__icon password error" : "input__icon"}
            src={icon || lockIcon}
            alt="password icon"
          />}
          <div className="input__fieldWrapper">
            <div className={error ? "input__combinedInput password error" : "input__combinedInput"}>
              <input
                ref={inpRef}
                className={error ? "inputLogin password error" : "inputLogin"}
                type={visible ? "text" : "password"}
                value={value}
                onChange={onChange}
                placeholder={visible ? "CONTRASEÑA VISIBLE" : "CONTRASEÑA"}
                onKeyDown={handleOnEnter}
                {...props}
              />
              <img
                className={error ? "input__eye password error" : "input__eye"}
                alt="toggle password"
                title={visible ? "Hide password" : "Show password"}
                src={visible ? eye_visible : eye_hidden}
                onClick={handleChangeVisibility}
              />
            </div>
  
            {error &&
              //si hay error lo muestra
              <>
              {isCapsLockActive ?
                //muestra solo si ya ha fallado una vez y tiene las mayusculas activadas
                <div className="messageError">Bloq. Mayús. Está activado</div>
                :
                <div className="messageError">{error}</div>
              }
              </>
            }
          </div>
        </div>
      </div>
    )
})
