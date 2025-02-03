import './InputTime.css'

import { useState,useRef, useEffect } from 'react'


export const InputTime = ({value,onChange, onExit}) => {

  // -------------------------------- VARIABLES Y ESTADOS --------------------------------

  const hourRef = useRef(null)
  const minRef = useRef(null)
  const btnCancelarRef = useRef(null)
  const btnAceptarRef = useRef(null)


  //value of the Modal inputs
  const [hourInpVal,setHourInpVal] = useState(undefined)
  const [minInpVal,setMinInpVal] = useState(undefined)
  
  //modal visibility
  const [lastFocus,setLastFocus] = useState("hours")


  // -------------------------------- CONTROLADORES DE ESTADOS --------------------------------

  //si el usuario cambia el valor por useState
  useEffect(()=>{
    // setInpValue(parseStringValue(value))
    const [hour,min] = value.split(":")
    setHourInpVal(Number(hour))
    setMinInpVal(Number(min))
  },[value])



  useEffect(()=>{
  
    if(!isNaN(hourInpVal) && !isNaN(minInpVal)){
      const val = twoDigitString(hourInpVal)+":"+twoDigitString(minInpVal)
      if(onChange){
        onChange(val)
      }
    }
  },[hourInpVal,minInpVal])


  // -------------------------------- OPERACIONES Y CONVERSIONES --------------------------------
  
  //display the number pretty
  function showNumber(n){
    if(isNaN(n)) return "--"
    return String(n).padStart(2, '0');
  }

  function twoDigitString(number) {
    if(isNaN(number)) return "00"
    return String(number).padStart(2, '0');
  }

 



  // -------------------------------- EVENT HANDLERS --------------------------------

  function  handleExit(){
    if(onExit){
      onExit()
    } 
  }


  function focusMinutes(){
    minRef.current.focus()
  }

  function focusHours(){
    hourRef.current.focus()
  }

  //keypress on hours
  function handleKeyHour(e){

    if (e.key === "Enter" || e.key === "ArrowRight") { 
      //focus next
      focusMinutes()
    }else if (e.key === "ArrowLeft") { 
      btnCancelarRef.current.focus()
    }else if (e.key === "Delete") { 
      setHourInpVal()
    }else if (e.key === "Escape") { 
      handleExit()
    }else{
      const v = handleInputKey(e.key,23,hourInpVal)
      if(!isNaN(v)){
        setHourInpVal(v)
      }
    }
    
  }

  //keypress on minutes
  function handleKeyMin(e){
    if (e.key === "Enter" || e.key === "ArrowRight") { //focus next
      btnAceptarRef.current.focus()
    }else if (e.key === "ArrowLeft") { 
      focusHours()
    }else if (e.key === "Delete") { 
      setMinInpVal()
    }else if (e.key === "Escape") { 
      handleExit()
    }else{
      const v = handleInputKey(e.key,59,minInpVal)
      if(!isNaN(v)){
        setMinInpVal(v)
      }

    }
  }


  //given a key action set the resulting number
  function handleInputKey(key,max,prev){
    if(key === "ArrowUp"){  //add 1
      return prev<max?prev+1:0

    }else if(key === "ArrowDown"){  //substract 1
      return prev>0?prev-1:max

    }else if(!isNaN(key)){  //insert number
      const n = parseInt(key)
      if(!prev) return n
      const newN = (prev*10 + n) % 100
      if(newN>max) return n
      return newN

    }else if(key === "Backspace"){ //delete last
      return Math.floor(prev/10)
    }

  }

  //when user clicks on arrow (UP,DOWN)
  function handleOperation(operation){
    if(lastFocus === "hours"){
      setHourInpVal(prev=>operation(prev,23))
      hourRef.current.focus()
    }else if(lastFocus === "minutes"){
      setMinInpVal(prev=>operation(prev,59))
      minRef.current.focus()
    }
  }

  function addOne(prev,max){
    if(prev===undefined) return 1
    return prev<max?prev+1:0
  }

  function subOne(prev,max){
    if(prev===undefined) return max
    return prev>0?prev-1:max
  }


  return (
    <>

      <div className='elio-react-components inputTime'>
        <div className='inputTime__row--input'>

          <div className='inputTime__timeContainer'>

            <input 
              type="text" 
              title='Hora' 
              value={showNumber(hourInpVal)} 
              className='inputTime__input--hours'
              ref={hourRef}
              onKeyUp={handleKeyHour}
              onFocus={()=>setLastFocus("hours")}
              autoFocus
              readOnly
            />

            <span className='inputTime__spacer'>:</span>

            <input 
              type="text" 
              title='Hora' 
              value={showNumber(minInpVal)} 
              className='inputTime__input--minutes'
              onKeyUp={handleKeyMin}
              onFocus={()=>setLastFocus("minutes")}
              ref={minRef}
              readOnly
            />
          </div>

          <div className='inputTime__buttonContainer'>
            <button className='inputTime__button' onClick={()=>handleOperation(addOne)}>^</button>
            <button className='inputTime__button--down' onClick={()=>handleOperation(subOne)}>^</button>
          </div>

        </div>

      </div>

    </>
  )
}
