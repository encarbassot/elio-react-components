import "./InputSelect.css"
import { useEffect, useRef, useState } from "react"
import dropdownIco from "../../../assets/icons/triangleDown.svg"

export function InputSelect({options,onChange,value,wide=false,title,...props}){

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
    <div className="elio-react-components InputSelect" ref={dropdownRef} {...props}>
      {
        title &&
        <p className='InputSelect__title'>{title}</p>
      }

      <div className="InputSelect__container">
        <div className="InputSelect__selected"
          onClick={()=>setIsOpen(!isOpen)}
        >
          <span>{selected}</span>
          <img className={"InputSelect__dropdown" + (isOpen?" open":"")} src={dropdownIco} alt="" />
        </div>
        {isOpen &&
          <div className="InputSelect__wrapper">
            
              <div className="InputSelect__items">
                {options.map((op,i)=>
                  <p
                    key={i}
                    className={"InputSelect__items__item" + (op===selected?" active":"")}
                    onClick={()=>handleSelect(op)}
                  >{op}</p>
                )}
              </div>
          
          </div>
        }
      </div>
    </div>
  </>)
}