import { Link, useLocation, useNavigate } from "react-router-dom"
import log from "../../../utils/log"
import React, { useEffect, useState } from "react"
import { ROUTES } from "../../../routes/navigationConfig"


export default function SidePanelOption({ico,text,path,expanded,onClick, options, type="option"}){

  // const match = href && useMatch(href || "")
  const navigate = useNavigate()
  const {pathname} = useLocation()
  // log("LOCATION",location)

  const [isCurrent, setIsCurrent] = useState(false)
  const [isSuboption, setIsSuboption] = useState(-1)

  useEffect(() =>{
    if(options && options.length>0){
      const sup = options.find(op=>pathname.startsWith(getSubOptionHref(op)))
      setIsSuboption(sup ? options.indexOf(sup) : -1)
    }
    if(pathname.startsWith(path)){
      setIsCurrent(true)
    }else{
      setIsCurrent(false)
    }
  },[pathname])


  function getSubOptionHref(option) {
    if (option.path) {
      return option.path.startsWith("/") ? option.path : `${path}/${option.path}`;
    }
    return "";
  }
  


  //  --------------------------------- HANDLERS ---------------------------------

  function handleClick(){
    if(path){
      navigate(path)
    }

    if(onClick){
      onClick()
    }
  }

  function handleOptionClick(event, option) {
    event.preventDefault();
    event.stopPropagation();
    
    if (option.path) {
      const newPath = getSubOptionHref(option);
      
      console.log("Navigating to:", newPath); // Log before navigating
      navigate(newPath);
      
      setTimeout(() => {
        console.log("Current location:", window.location.pathname);
      }, 500); // Delay to verify
    }
  
    if (option.onClick) {
      option.onClick();
    }
  }

  if(type === "logo"){
    return <Link to={path} className="logo">
        {React.isValidElement(ico) ? ico : <img src={ico} alt="logo" />}
    </Link>
  }


  return(<>

    <div 
      onClick={handleClick}
      className={'Sidepanel__option '+(isCurrent && isSuboption < 0 ? " selected" : "")}       
    >
      <div className="row">
        <div className="content">
          {React.isValidElement(ico) ? ico : <img src={ico} alt="ico" className='Sidepanel__option__icon' />}
          <span className={"Sidepanel__text"+(expanded ? "": " hide")}>{text}</span>
        </div>
        <span className="Sidepanel__option__border"/>
      </div>

      {options && options.length>0 &&
      
        <ul className={"Sidepanel__option__options" + (expanded && pathname.startsWith(path)  ? "": " hide")}>
          
          {options.map((op,i)=>
            <li key={i} className={'Sidepanel__subOption'+(isSuboption === i?" selected":"")} onClick={(e)=>handleOptionClick(e,op)} >
              <div className="content">
                {op.ico && (React.isValidElement(op.ico) ? op.ico : <img src={op.ico} alt="ico" className='Sidepanel__option__icon' />)}
                <span className="Sidepanel__text">{op.text}</span>
              </div>
              <span className="Sidepanel__option__border"/>

            </li>
          )}

        </ul>
      }
    </div>

      
    
  
  </>)
}