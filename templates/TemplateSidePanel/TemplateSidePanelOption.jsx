import { useLocation, useNavigate } from "react-router-dom"


export default function SidePanelOption({ico,text,href,expanded,onClick, options}){

  // const match = href && useMatch(href || "")
  const navigate = useNavigate()
  const {pathname} = useLocation()
  // console.log(location)

  function handleClick(){
    if(href){
      navigate(href)
    }

    if(onClick){
      onClick()
    }
  }

  function handleOptionClick(op){
    if(op.href){
      navigate(href+op.href)
    }

    if(op.onClick){
      op.onClick()
    }
  }


  console.log(text, options )
  return(<>

    <div 
      onClick={handleClick}
      className={'Sidepanel__option '+(pathname.startsWith(href) ? "Sidepanel__option--selected" : "")}       
    >
      
      <img src={ico} alt="ico" className='Sidepanel__option__icon' />
      <p className={expanded ? "": "Sidepanel__hide__text"}>{text}</p>
      <span className="Sidepanel__option__border"/>

    </div>

    {options &&
    
      <div className={(expanded && pathname.startsWith(href) ) ? "Sidepanel__option__options": "Sidepanel__option__options--hide"}>
        
        {options.map((op,i)=>
          <p key={i} className={'Sidepanel__subOption'+(pathname===href+op.href?" selected":"")} onClick={()=>handleOptionClick(op)} >{op.text}</p>
        )}
        
      </div>
      
    }
    
  
  </>)
}