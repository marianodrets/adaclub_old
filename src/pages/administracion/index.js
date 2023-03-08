import React from 'react';
import { URL_DB, NOMBRE_SIST } from './../../constants';
import axios from 'axios';
import { Container, Tab, Tabs  } from 'react-bootstrap';
import AdmiTari from '../../components/AdmiTari';
import AdmiPlan from "../../components/AdmiPlan";
import CajaMovim from "../../components/CajaMovim";
import InstaAbm from "../../components/InstaAbm";
import ActiAbm from "../../components/ActiAbm";
import AdmiRepo from "../../components/AdmiRepo";



class AdministracionPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      login_id: sessionStorage.getItem('USUA_ID'),
      toggleState : 1,
      accesos: [],
      usma_item_def : '',
  
      showhelp : false,
      filterGrilla: '',
      fetchingregistros: false,
      respuestaSp: [],
      respError: '',
      mensajeAlerta: '',
    };

  }

  cargaAccesos = (a_usua_id) => {

    const sql = `${URL_DB}SEL_USU_ROLES_SHOW_MENU(${a_usua_id},null,null)`
     axios.get(sql)
       .then((response) => {
          this.setState({
           accesos : response.data[0].filter((item) => { 
                                      return item.usma_orden.substr(0,2)==="20" &&  // 20-Administracion
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
                {opc.usma_item==='admi_reg' && <CajaMovim lee_mod={opc.lee_mod} clubActi={'C'}/> }
                {opc.usma_item==='admi_repo' &&  <AdmiRepo lee_mod={opc.lee_mod} /> }
                {opc.usma_item==='admi_aran' &&  <AdmiTari lee_mod={opc.lee_mod} /> }
                {opc.usma_item==='admi_plan' &&  <AdmiPlan lee_mod={opc.lee_mod} /> }
                {opc.usma_item==='insta_tari' && 'Tarifas Alquileres canchas y quincho'}
                {opc.usma_item==='insta_abm' &&  <InstaAbm lee_mod={opc.lee_mod} />}
                {opc.usma_item==='acti_abm' && <ActiAbm lee_mod={opc.lee_mod} />}
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

export default AdministracionPage;
