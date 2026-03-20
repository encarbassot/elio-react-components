import { useState } from "react"
import "./ButtonModal.css"
import { TextModal } from "../TextModal/TextModal"


export default function ButtonModal({
  // BUTTON PROPS
  buttonClassName,
  buttonContent,
  buttonOnClick,

  // MODAL PROPS
  children,
  ...otherModalProps
  
}){

  const [isOpen,setIsOpen] = useState(false)

  function handleButtonOnClick(){
    if (buttonOnClick && typeof buttonOnClick === "function"){ 
      buttonOnClick(isOpen,setIsOpen)
    }else{
      setIsOpen(!isOpen)
    }
  }

  return (<>
      <button className={`ButtonModal ${buttonClassName}`} onClick={handleButtonOnClick}>
        {buttonContent}
      </button>
      {
        isOpen && (
          <TextModal {...otherModalProps} setIsOpen={setIsOpen}>
            {children}
          </TextModal>
        )
      }
  </>)
}
