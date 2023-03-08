import React from 'react';
import { URL_DB, NOMBRE_SIST } from './../../constants';
import axios from 'axios';
import { Container, Tab, Tabs  } from 'react-bootstrap';
import Usuarios from '../../components/Usuarios';
import UsuaLog from '../../components/UsuaLog';



class SysadminPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      login_id: sessionStorage.getItem('USUA_ID'),
      accesos: [],
      usma_item_def : '',
  
      showhelp : false,
    };
    this.setState({ usma_item_def : '8005'})
  }

  cargaAccesos = (a_usua_id) => {

    const sql = `${URL_DB}SEL_USU_ROLES_SHOW_MENU(${a_usua_id},null,null)`
     axios.get(sql)
       .then((response) => {
          this.setState({
           accesos : response.data[0].filter((item) => { 
                                      return item.usma_orden.substr(0,2)==="80" &&  // 80-sistema
                                              item.usma_item!=="CAB" })
          },() => {
            this.setState({
              usma_item_def : this.state.accesos.length===0?'':this.state.accesos[0].usma_item
            })
          }) 
       })
       .catch((error) => console.log(error))       
  }

  componentDidMount() {

    document.title = NOMBRE_SIST;
    this.cargaAccesos(this.state.login_id);

  }
 
  
  /*==========================================================================
   RENDER
  *==========================================================================*/

  render() {  

    
    return(
      <div>        
  
        <Container  fluid="true">
        <Tabs defaultActiveKey={this.state.usma_item_def}
                transition={true}
                id="tab-example"
                className="nav nav-tabs" >
        
          { this.state.accesos.map((opc,i) => {
            return (
              <Tab eventKey={opc.usma_item} title={opc.usma_des_item} key={i}>
                {opc.usma_item==='sist_usua' && <Usuarios lee_mod={opc.lee_mod} /> }
                {opc.usma_item==='sist_log' && <UsuaLog lee_mod={opc.lee_mod} /> }

              </Tab>
                  )
            })
          }
        </Tabs>
        </Container>
      </div>
    );
  }
}

export default SysadminPage;
