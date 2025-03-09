import "./TextModal.css";
import { Modal } from "../Modal/Modal";
import ico_close from "../../../assets/icons/cancel.svg"
import { useEffect } from "react";
export function TextModal({
  title,
  contentClassName,
  children,
  setIsOpen,
  cancelar,
  aceptar,
  aceptarRed,
  cancelarRed,
  aceptarLoading=false,
  cancelarLoading=false,
  aceptarText="ACEPTAR",
  cancelarText="CANCELAR",
  buttons=[]
}) {

  const isLoading = aceptarLoading || cancelarLoading || buttons.some(x=>x.loading)





  function handleClickOutside(e){
    e.stopPropagation()

    if(setIsOpen){
      setIsOpen(false)
    }
  }

  function handleClickInside(e){
    e.preventDefault()
    e.stopPropagation()
  }


  return (
    <>
      <Modal closeModal={setIsOpen}>
        <div className="elio-react-components textModal__background" onClick={e=>handleClickOutside(e)}>

          <div className="elio-react-components textModal" onClick={e=>handleClickInside(e)}>

          {(title || setIsOpen) &&
            <header className="textModal__header">
              <h2 className="textModal__text">{title}</h2>
              {setIsOpen&&
                <img src={ico_close} alt="" 
                  className="textModal__close"
                  onClick={()=>setIsOpen(false)}
                />
              }
            </header>
          }
          <div className={contentClassName || "textModal__content"}>
            {children}
          </div>
          {
            (aceptar || cancelar) &&
            <footer className="textModal__buttons__cont">
              {
                aceptar && (
                  <button onClick={aceptar} className={"textModal__button"+(aceptarRed?" red":"") + (aceptarLoading? " loading":"")} disabled={isLoading}>
                    {aceptarLoading ?
                    <span className="spinner small"/>
                    :
                    aceptarText
                    }
                  </button>
                )
              }
              {
                cancelar &&(
                  <button onClick={cancelar} className={"textModal__button"+(cancelarRed?" red":"") + (cancelarLoading?" loading":"")} disabled={isLoading}>
                  {cancelarLoading ?
                  <span className="spinner small"/>
                  :
                  cancelarText
                  }
                    </button>
                )
              }
              {
                (buttons && buttons.length >0) &&
                buttons.map(({onClick,red,text,loading},i)=>
                <button key={i} onClick={onClick} className={"textModal__button"+(red?" red":"")+(loading?" loading":"")} disabled={isLoading}>{
                  loading?
                  <span className="spinner small"/>
                  :
                  text
                  }</button>
                )
              }
            </footer>
          }
          </div>
        </div>


      </Modal>
    </>
  );
};
