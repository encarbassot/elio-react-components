import "./Hint.css"

import hintIco from "../../assets/icons/hint.svg"

export function Hint({children,asterisk=false,custom, className="",...props}){


  if(!children) return null

  return (<>
  <span className={"elio-react-components HintIco "+ className}>
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