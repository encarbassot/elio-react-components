import './TemplateSidePanel.css';

//icons
import iconAmpliar from "../../assets/icons/expand.svg"  
import iconContraer from "../../assets/icons/contract.svg"

import { useLocalStorage } from '../../hooks';
import SidePanelOption from './TemplateSidePanelOption';
import { Link } from 'react-router-dom';


export default function SidePanel({
  children,
  options = [],
  footerOptions = [],
  version,
  logo,
  bottom=null,
  phoneNavbarBottom = false
}) {


  const [expanded,setExpanded] = useLocalStorage("sidebar-expansioin",false)


  
  return (
    <div className="elio-react-components Template__SidePanel">

      <div className={"Sidepanel "+(expanded ? "extended" : "")} >
        <nav className={'Sidepanel__list'}>
          <Link to="/">
            {logo}
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
        <footer className='Sidepanel__footer'>


       
          {footerOptions.map(({ ico, text, href, subOptions = [], isVisible, onClick }, index) => {

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

          <SidePanelOption
            ico={expanded ? iconContraer : iconAmpliar}
            text={expanded ? "Contraer" : "Ampliar"}
            onClick={()=>setExpanded(!expanded)}
            expanded={expanded}
          />
          
          {version && <span className='Sidepanel__version'>{version}</span>}


          {bottom}
        </footer>
      </div>

      <main>

        {children}
      </main>
    </div>
  );
}
  