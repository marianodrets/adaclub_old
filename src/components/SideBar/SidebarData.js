import React from "react";
import { AiOutlineHome } from "react-icons/ai";
import { FaUserAlt, FaDollarSign, FaHandPaper} from "react-icons/fa";
import { IoMdFootball, IoMdAttach, IoIosKey} from "react-icons/io";
import { GiSoccerField } from "react-icons/gi";

export const SidebarData = [
    {
        title: 'Home',
        path: '/',
        icon: <AiOutlineHome />,
        titleFull:'',
        cname: 'nav-text'
    },
    {
        title: 'Socios',
        path: '/socios',
        icon: <FaUserAlt />,
        titleFull:'Registro de Socios',
        cname: 'nav-text'
    },
    {
        title: 'Caja',
        path: '/cobranza',
        icon: <FaDollarSign />,
        titleFull:'Cobranza de cuotas y Caja',
        cname: 'nav-text'
    },
    {
        title: 'Actividad',
        path: '/actividad',
        icon: <IoMdFootball />,
        titleFull:'Actividades aranceladas, profesores',
        cname: 'nav-text'
    },
    {
        title: 'Admin',
        path: '/administracion',
        icon: <IoMdAttach />,
        titleFull:'Administración de la institución',
        cname: 'nav-text'
    },
    {
        title: 'Instalaciones',
        path: '/instalaciones',
        icon: <GiSoccerField />,
        titleFull:'Canchas e instalaciones, disponibilidad y alquiler',
        cname: 'nav-text'
    },
    {
        title: 'Sistema',
        path: '/sysadmin',
        icon: <IoIosKey />,
        itleFull:'Usuarios y accesos del sistema',
        cname: 'nav-text'
    },
    {
        title: 'Mi cuenta',
        path: '/UsuarioLogueado',
        icon: <FaHandPaper />,
        itleFull:'Mi cuenta de usuario en este sistema',
        cname: 'nav-text'
    },
]

