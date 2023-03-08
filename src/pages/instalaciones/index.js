import React from 'react';
import { URL_DB, NOMBRE_SIST } from './../../constants';
import axios from 'axios';

import { Container, Tab, Tabs  } from 'react-bootstrap';
/*import CobranzaInteg from '../../components/CobranzaInteg';
import CobranzaCons from '../../components/CobranzaCons';
import CobranzaRepo from "../../components/CobranzaRepo"; 
import CobranzaLiqui from "../../components/CobranzaLiqui"; 
import AbmProveed from "../../components/AbmProveed";
*/
class InstalacionesPage extends React.Component {
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
                                      return item.usma_orden.substr(0,2)==="70" &&  // 70-Instalaciones
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
                {opc.usma_item==='inst_fijos' &&  <div><b><p>P/prox etapa</p></b><p>Mapa de canchas por dia y que Actividad la ocupa, en horarios fijos</p></div> }
                {opc.usma_item==='inst_excep' && <div><b><p>P/prox etapa</p></b><p>El profesor indicará cuando no usará la cancha (para saber que estará libre, ej: vacaciones, dias de partidos visitante)</p></div> }
                {opc.usma_item==='inst_reserva' && <div><b><p>P/prox etapa</p></b><p>Mostrará en una pagina las canchas libres para alquilar a terceros, antes configurar Admin/Instalaciones</p></div> }
                {opc.usma_item==='inst_repo' && <div><b><p>P/prox etapa</p></b><p>Mostrará la disponibilidad de instalaciones para los socios </p></div> }
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




export default InstalacionesPage;
