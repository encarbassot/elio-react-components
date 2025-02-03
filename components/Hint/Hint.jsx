import "./Hint.css"

import hintIco from "../../assets/icons/hint.svg"

export function Hint({children,...props}){


  if(!children) return null

  return (<>
  <span className="HintIco">
    <img src={hintIco} className="HintIco__ico" alt="hint"/>
    <span className="HintIco__hint" {...props}>
      {children}
    </span>
  </span>
  </>) 
}