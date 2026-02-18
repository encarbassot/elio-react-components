import "./InputSelect.css"
import { useEffect, useRef, useState } from "react"
import dropdownIco from "../../../assets/icons/triangleDown.svg"
import { Hint } from "../../Hint/Hint"

export function InputSelect({
  options=[],
  onChange,
  value,
  wide=false,
  title,
  inline=false,
  optional=true,
  allowUnselect=false,
  unselectStr="Ninguno",
  formatViewOption=x=>x,
  error="",
  className="",
  ...props
}){

  const [isOpen,setIsOpen] = useState(false)
  const [selected,setSelected] = useState(value || options[0])
  const dropdownRef = useRef(null)

  function handleSelect(op){
    setSelected(op)
    setIsOpen(false)
    if(onChange) onChange(op)
  }

  useEffect(()=>{
    if(value !== selected){
      setSelected(value)
    }
  },[value])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
 
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  return (<>
    <div className={"elio-react-components InputSelect" + (inline? " row":"") + (className?" "+className:"")} ref={dropdownRef} {...props}>
      {
        title &&
        <p className='InputSelect__title'>
          {title}
          {!optional && <Hint asterisk>Requerido</Hint>}
        </p>
      }

      <div className="InputSelect__container">
        <div className="InputSelect__selected"
          onClick={()=>setIsOpen(!isOpen)}
        >
          <span>{formatViewOption(selected)}</span>
          <img className={"InputSelect__dropdown" + (isOpen?" open":"")} src={dropdownIco} alt="" />
        </div>
        {isOpen &&
          <div className={"InputSelect__wrapper"+(wide?" wide":"")}>
            
              <div className="InputSelect__items">
                {
                  allowUnselect &&
                  <p
                    className={"InputSelect__items__item" + (!selected?" active":"")}
                    onClick={()=>handleSelect(null)}
                  >{unselectStr}</p>
                }
                {options.map((op,i)=>
                  <p
                    key={i}
                    className={"InputSelect__items__item" + (op===selected?" active":"")}
                    onClick={()=>handleSelect(op)}
                  >{formatViewOption(op)}</p>
                )}
              </div>
          
          </div>
        }
      </div>
      {
        error && <p className="InputSelect__error">{error}</p>
      }
    </div>
  </>)
}