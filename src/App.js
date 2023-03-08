//import logo from './logo.svg';
import './App.css';

import React from 'react';
import { URL_DB } from './constants';
import axios from 'axios';
import './assets/styles/index.scss'; // CSS IMPORTS
import { Redirect, Switch, Route, BrowserRouter as Router } from 'react-router-dom';
//import Navbar from './components/Navbar/Navbar';
import Sidebar from './components/SideBar/Sidebar';

//import Home from './pages/home'
import SysadminPage from './pages/sysadmin';
import SociosPage from './pages/socios';
import CobranzaPage from './pages/cobranza';
import ActividadPage from './pages/actividad';
import InstalacionesPage from './pages/instalaciones';
import AdministracionPage from './pages/administracion';
import DatosUsuario from './pages/UsuarioLogueado';
import Login from './components/Login';


class App extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
        login_id: sessionStorage.getItem('USUA_ID')||0,  
        registros: []
      };  
  }

  leeMenu = () => {
    const sql =  `${URL_DB}SEL_USU_ROLES_SHOW_MENU(${this.state.login_id},null,null)`;
    axios.get(sql)
    .then((response) => {
      this.setState({ 
        registros: response.data[0],
      })
    })
    .catch((error) => console.log(error))
    .finally(() => {
      this.setState({ fetchingregistros: false })
    })  
 
    //sessionStorage.setItem('USUA_APENOM','Let Lux')

  }

  componentDidMount() {
    this.leeMenu();
   
  }

  render() {

    return (

      <div>
       
      <Router>
        {/* HEADER */}
   {/*      <Navbar menuItems={this.state.registros} /> */}
         <Sidebar />

      {/* <Header menuItems={this.state.registros} />
        {/* BODY DINAMIC CONTENT */}
        <Switch>

          <Route exact path="/sysadmin" component={SysadminPage} />
          <Route exact path="/socios" component={SociosPage} />
          <Route exact path="/cobranza" component={CobranzaPage} />
          <Route exact path="/actividad" component={ActividadPage} />
          <Route exact path="/administracion" component={AdministracionPage} />
          <Route exact path="/instalaciones" component={InstalacionesPage} />
          <Route path="/UsuarioLogueado" component={DatosUsuario} /> 
          <Route path="/login" component={Login} />
{/*          <Route path="*" component={Home} /> */}
        </Switch>

        { Number(this.state.login_id)===Number(0) &&
                         <Redirect to={'/login'} />   
        }

        {/* FOOTER */}
      </Router>

    
      </div>

    );
  }
}

export default App;



