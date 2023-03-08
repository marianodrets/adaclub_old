import React from 'react';
import { URL_DB } from './../../constants';
import axios from 'axios';
import { Table, Row, Col, Container, Form, FormControl } from 'react-bootstrap';
//import ExpGrillaExcelPDF from '../../components/ExpGrillaExcelPDF';
//import swal from 'sweetalert';
import Notifications from '../../components/Notifications';
import '../../pages/stylePages.css';
//import Ayuda from '../../components/Ayuda';
//import DialogComponent from '../../components/Dialog';
//import BootBox from 'react-bootbox';

class MensajesPersona extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      pers_id : props.pers_id,
      opc_tiempo : props.tiempo,  // 'H'= historico  'U'=ultimos mensajes      

      histoMensajes: [],
      filterGrilla: '',
      empe_id: '',
      buscarGrillaValue: '',
      compoShowModal: false,
      showModalBorr: false,
      fetchhistoMensajes: true,

      respuestaSp: [],
      respError: '',
      mensajeAlerta: '',
    };

    this.filtrarDatos = this.filtrarDatos.bind(this);
  }

  componentDidMount() {

    const sql = `${URL_DB}SEL_PERSONA_MENSAJES ('D',${this.state.pers_id},'P','${this.state.opc_tiempo}')`;
    axios.get(sql)
    .then((response) => {
        this.setState({
        histoMensajes: response.data[0],
        })
        console.log(this.state.histoMensajes)
    })  
    .catch((error) => console.log(error))
    .finally(() => {
        this.setState({ fetchhistoMensajes: false })
    })

  }

  filtrarDatos() {
    const escapedValue = this.state.filterGrilla.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedValue, 'i');

    return this.state.histoMensajes.filter(filtro => regex.test(filtro.peme_texto) )  
  }
  

  /*==========================================================================
   RENDER
  *==========================================================================*/

  render() {  

    //const respError = this.state.respError;
    const mensajeAlerta = this.state.mensajeAlerta;
    const mensajeColor = this.state.mensajeColor;
    const histoMensajesFiltrados = this.filtrarDatos();

    return(
      <div>        
        {mensajeAlerta.length >1 ? <Notifications mensaje={mensajeAlerta}
                                                  mensajeColor={mensajeColor}
                                    /> : '' }

        <Container  fluid="true">

          <Row>
            <Col xs={6}>
                <b>Historicos de mensajes</b>
            </Col>
            <Col xs={4}>
            <Form.Group>
                <FormControl type="text" name="buscar" placeholder="Texto a filtrar" className="mr-sm-2" 
                        onChange={(e) => { this.setState({ filterGrilla: e.target.value })} } /> 
              </Form.Group>
            </Col>
            <Col xs={2}>
          
            </Col>
          </Row>

          <Row>
            <Col>
              <div className="barra_v_modal">
              <Table hover size="sm" id="data_table">
                <tbody>
                {
                  this.state.fetchhistoMensajes && 'Cargando...'
                }
                {
                  histoMensajesFiltrados.map((reg) => {
                    return (
                      <tr key={reg.peme_id}>
                        <td style={{ width: "3%" }}>
                            {reg.peme_preg_resp==='R' &&
                               <i style={{ color: reg.color_regis }} className="fas fa-user-graduate"></i> 
                            }
                            {reg.peme_preg_resp==='P' &&
                                <i className="far fa-question-circle"></i>
                            }
                        </td>
                        <td style={{ width: "79%" , paddingLeft: reg.margen }}>
                            <FormControl as="textarea"  name="peme_texto"
                                        defaultValue={reg.peme_texto} 
                                        placeholder="escribe tu pregunta aqui"
                                        style={{ backgroundColor: reg.color_regis }}
                                        disabled={ reg.permi_modi==='S'? false : true }
                                        onChange={this.handleChange} />
  {reg.peme_preg_resp==='R' &&
                              <br />  // Despues de cada respuesta dejo espacio ppara separar visualmente los temas
  }
                        </td>
                        <td style={{ width: "8%", textAlign: "left", fontSize: 10 }}>
                            {reg.peme_alta_f}
                        </td> 
                        <td style={{ width: "10%", fontSize: 10  }}>
                            {`#${reg.peme_id}`}
                        </td>
                      </tr>  
                    ) 
                  }) 
                }
                </tbody>
              </Table>
              </div>
            </Col>
          </Row>
        </Container>

    
      
        {/*
        < Modal show={this.state.showhelp} onHide={() => { this.setState({ showhelp : false}) } } dialogClassName="modal-90">
            <Ayuda clave={'prof_def_tema'}/>
        </Modal> */}

      </div>
    );
  }
}

export default MensajesPersona;
