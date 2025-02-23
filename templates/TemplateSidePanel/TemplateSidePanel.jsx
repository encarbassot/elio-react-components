import './TemplateSidePanel.css';

//icons
import iconAmpliar from "../../assets/icons/expand.svg"  
import iconContraer from "../../assets/icons/contract.svg"

import { useLocalStorage } from '../../hooks';
import SidePanelOption from './TemplateSidePanelOption';

export default function SidePanel({
  children,
  options = [],
  version,
  bottom=null,
  phoneNavbarBottom = false, //TODO
}) {

  const navOptions = options.filter(x=>!x.noNavbar)
  const logo = options.find(x=>x.type === "logo")


  const [expanded,setExpanded] = useLocalStorage("sidebar-expansioin",false)


  

  function renderOptions(isFooter) {
    return navOptions
      .filter((x) => x.isFooter === isFooter && x.type !== "logo")
      .map(({ subOptions = [], isVisible, ...more }, index) => {
        if (typeof isVisible === "function" && !isVisible()) return null;
  
        return (
          <SidePanelOption key={index} expanded={expanded} options={subOptions} {...more} />
        );
      });
  }


  return (
    <div className="elio-react-components Template__SidePanel">

      <div className={"Sidepanel "+(expanded ? "extended" : "")} >

        {logo && <SidePanelOption {...logo}/>}

        <div className='Sidepanel__scrollableColumn'>
          <nav className="Sidepanel__list">
            {renderOptions(false)}
          </nav>

          <footer className="Sidepanel__footer">
            {renderOptions(true)} {/* Render footer options */}

            <SidePanelOption
              ico={expanded ? iconContraer : iconAmpliar}
              text={expanded ? "Contraer" : "Ampliar"}
              onClick={() => setExpanded(!expanded)}
              expanded={expanded}
            />

            {version && <span className="Sidepanel__version">{version}</span>}
            {bottom}
          </footer>
        </div>
      </div>

      <main>

        {children}
      </main>
    </div>
  );
}
  