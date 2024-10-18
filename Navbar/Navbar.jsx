  import "./Navbar.css"
import { Link } from "react-router-dom"
import { useState } from "react"
import NavbarButton from "./NavbarButton"

export default function Navbar({links,logo}) {
  const [isOpen, setIsOpen] = useState(false)

  // const links = [
  //   { to: "/nosotros", text: "Sobre nosotros" },
  //   { to: "/calculate", text: "Calcula tu envío" },
  //   { to: "https://lamess.lobolink.eu/lobo/#!//coreLogin/", text: "Zona clientes" },
  // ]

  return (
    <>
      <nav className={"Navbar" + (isOpen ? " open" : "")}>

        <div className="Navbar__wrapper">
          <div className="Navbar__content">

            <Link to="/" >
              <img src={logo} alt=""  className="logo"/>
            </Link>

            <div className="landscapeLinks">
              {links.map((link,i)=> (
                <Link className="hideOnPhone" key={i} to={link.to} onClick={() => setIsOpen(false)}>
                  {link.text}
                </Link>
              ))}
            </div>
            
          </div>
          <div className="Navbar__button">
            {/* <button onClick={() => setIsOpen(!isOpen)}>open</button> */}
            <NavbarButton isOpen={isOpen} onClick={() => setIsOpen(!isOpen)}/>
          </div>
        </div>
        <div className="Navbar__drop__wrapper">
          <div className={"Navbar__drop__content" + (isOpen ? " open" : "")}>
            {links.map((link,i)=> (
              <Link key={i} to={link.to} onClick={() => setIsOpen(false)}>
                {link.text}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      <div 
        className={"Navbar__drop" + (isOpen ? " open" : "")} 
        onClick={() => setIsOpen(false)}
      >

      </div>
    </>
  )
}
