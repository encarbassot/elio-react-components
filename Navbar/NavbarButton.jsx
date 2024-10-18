
import "./NavbarButton.css"

export default function NavbarButton({isOpen,onClick}){

  return <div className={"menu-btn"+(isOpen?" open":"")} onClick={onClick}>
  <div className="menu-btn_burger">
  </div>
</div>
}