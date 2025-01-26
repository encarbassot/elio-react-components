import { useEffect } from 'react';
import './Modal.css'
// import { ReactDimmer } from "react-dimmer";
import { useModalsContext } from '../ModalsContext';
import { createPortal } from 'react-dom';

export function Modal({ closeModal,children,zIndex = 19,dimmer=true}) {

  const {pushModal,removeModal} = useModalsContext()

  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && closeModal) {
        event.stopPropagation()
        event.preventDefault()
        closeModal()
      }
    };

    pushModal(handleEscapeKey)

    // document.addEventListener('keydown', handleEscapeKey);
    return () => {
      removeModal(handleEscapeKey)
      // document.removeEventListener('keydown', handleEscapeKey);
    };
  }, []);

  return createPortal (
    <>
      
      <div className="elio-react-components gloval__modal" style={{zIndex:zIndex+1}}>
        {children}
      </div>

    </>,
    document.getElementById('modal-root')
  )
}