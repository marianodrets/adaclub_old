import React, {useState, useEffect } from "react";
import { Dropdown } from 'react-bootstrap';
import {NOMBRE_INSTITUCION} from '../../constants';
import { Link } from 'react-router-dom';
import { FaBars, FaPowerOff} from "react-icons/fa";
import { AiOutlineClose} from "react-icons/ai";
import { FaUserAlt } from 'react-icons/fa';
import { SidebarData} from './SidebarData'
import './Navbar.css';

// Fuente: https://www.youtube.com/watch?v=CXa0f4-dWi4

function Navbar() {
    const [sidebar,setSidebar] = useState(false)
    const [modulo,setmodulo] = useState('')
    const showSidebar = () => setSidebar(!sidebar)
    const selectOption = (a_modulo) => {
        setSidebar(!sidebar)
        setmodulo(a_modulo)
    }
   
    useEffect(()=>{
        function onMouseClick(e) {
           if(e.clientX > 300) {
                setSidebar(false)
            } 
        }
        window.addEventListener("click",onMouseClick);

       return() => {
            window.removeEventListener("click",onMouseClick);
        }
    })
    

    return (
        <>
    <div className="navbar">
        <Link to="#" className='menu-bars'>
            <FaBars onClick={showSidebar}/>
        </Link>
        <div style={{color:"red", width:"20%", fontSize:"16px",  paddingLeft:"20px"}}>
            {NOMBRE_INSTITUCION}
        </div>
        <div style={{color:"white", width:"50%", fontSize:"22px", fontWeight:"bold"}}>
            {modulo}
        </div>
        <div style={{textAlign:"right", width:"20%"}}>
        <Dropdown>
            <Dropdown.Toggle align="end" id="dropdown-menu-align-end" size="sm">
                <FaUserAlt /> {sessionStorage.getItem('USUA_APENOM')} 
            </Dropdown.Toggle>
            <Dropdown.Menu>
 {/* esto no anda en PROD, si en desa   
            <Dropdown.Item onClick={() => {window.location='/UsuarioLogueado'}}>
                    Datos Usuario</Dropdown.Item> 
            <Dropdown.Divider />
    */}
            <Dropdown.Item onClick={() => { window.location = '/'; 
                                            sessionStorage.setItem('USUA_ID',0);
                                            sessionStorage.setItem('USUA_APENOM','')
                                    }}><FaPowerOff/> Cerrar Sesión</Dropdown.Item>
            </Dropdown.Menu>
        </Dropdown>
        </div>
        <div style={{color:"#1a83ff", textAlign:"center", width:"50px"}}>
            {`#${sessionStorage.getItem('USUA_ID')}`}
        </div>
    </div>
        <nav className={ sidebar?'nav-menu active':'nav-menu'}>
            <ul className="nav-menu-items">
                <li className="navbar-toggle">
                    <Link to="#" className="menu-bars">
                        <AiOutlineClose onClick={showSidebar}/>
                    </Link>
                </li>
                {SidebarData.map((item, i) => {
                    return(
                        <li key={i} className={item.cname}> 
                            <Link to={item.path} onClick={() => { selectOption(item.titleFull) }}>
                                {item.icon}
                                <span>{item.title}</span>
                            </Link>
                        </li>
                    )
                })}
            </ul>   
        </nav>
   
    
    </>)
}

export default Navbar