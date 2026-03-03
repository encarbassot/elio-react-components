import "./Hint.css"

import hintIco from "../../assets/icons/hint.svg"
import { TextModal } from "../Modals/TextModal/TextModal"
import { useState } from "react"

export function Hint({children,asterisk=false,custom, right=false, className="",...props}){

  const [isOpen,setIsOpen] = useState(false)

  function openModal(e){
    e.stopPropagation()
    setIsOpen(true)
  }

  if(!children) return null

  return (<>

  {isOpen && <TextModal aceptar={()=>setIsOpen(false)}>
    {children}
    </TextModal>}

  <span className={"elio-react-components HintIco"+(right?" right":"")+ (className?" "+className:"")}
    onClick={openModal}
  >
    {
      asterisk ? <span className="HintIco__asterisk">*</span> 
      : custom ? custom
      : <img src={hintIco} className="HintIco__ico" alt="hint"/>
    }
    <span className="HintIco__hint" {...props}>
      {children}
    </span>
  </span>
  </>) 
}