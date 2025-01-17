import './TemplateSidePanel.css';

//icons
import iconAmpliar from "../../assets/icons/expand.svg"  
import iconContraer from "../../assets/icons/contract.svg"

import { useState } from 'react';
import { useLocalStorage } from '../../hooks';
import { useLoginData } from '../../../contexts/LoginDataContext';
import SidePanelOption from './TemplateSidePanelOption';
import { Link } from 'react-router-dom';
import ExpandingLogo from '../../../components/ExpandingLogo/ExpandingLogo';


export default function SidePanel({children, logo, options = [], footerOptions = []}) {

  const {name, logout, permissions} = useLoginData()


  const [expanded,setExpanded] = useLocalStorage("sidebar-expansioin",false)


  
  return (
    <div className="elio-react-components Template__SidePanel">

<div className={"Sidepanel "+(expanded ? "extended" : "")} >
        <>
          <nav className={'Sidepanel__list'}>

            <Link to="/">
              {/* <img src={logo} alt="Logo" /> */}
              <ExpandingLogo expanded={!expanded}/>
            </Link>

            {options.map(({ ico, text, href, subOptions = [], isVisible, onClick }, index) => {
            if (isVisible !== undefined){
              if(typeof isVisible == "function" && !isVisible()) return null
            } // Skip if user doesn't have sufficient permissions
            
            return (
              <SidePanelOption
                key={index}
                ico={ico}
                text={text}
                href={href}
                expanded={expanded}
                options={subOptions}
                onClick={onClick}
              />
            );
          })}

          


          </nav>
        </>
        <footer className='Sidepanel__footer'>
       
          {footerOptions.map(({ ico, text, href, subOptions = [], minPermissions = Infinity, onClick }, index) => {
            if (permissions > minPermissions) return null; // Skip if user doesn't have sufficient permissions
            return (
              <SidePanelOption
                key={index}
                ico={ico}
                text={text}
                href={href}
                expanded={expanded}
                options={subOptions}
                onClick={onClick}
              />
            );
          })}

          <SidePanelOption
            ico={expanded ? iconContraer : iconAmpliar}
            text={expanded ? "Contraer" : "Ampliar"}
            onClick={()=>setExpanded(!expanded)}
            expanded={expanded}
          />
          
          <span className='Sidepanel__version'>v2.0.2</span>
        </footer>
      </div>

      <main>

        {children}
      </main>
    </div>
  );
}
  