import React, { createContext, useState, useContext} from 'react';

export const ModalsContext = createContext();

export function useModalsContext(){
  return useContext(ModalsContext)
}


export function ModalsProvider({ children }) {

  const [modalsList,setModalsList] = useState([])



  function pushModal(modal){
    if(modalsList.length>0){
      document.removeEventListener("keydown",modalsList[modalsList.length-1])
    }
    setModalsList([...modalsList,modal])
    document.addEventListener("keydown",modal)
  }

  function removeModal(modal){

    document.removeEventListener("keydown",modal)
    const updated = modalsList.filter(x=>x!==modal)
    setModalsList(updated)
    if(updated.length>0){
      document.addEventListener("keydown",updated[updated.length-1])
    }
  }

  return (
    <ModalsContext.Provider value={{
      pushModal,
      removeModal
    }}>
      {children}
    </ModalsContext.Provider>
  );
}

