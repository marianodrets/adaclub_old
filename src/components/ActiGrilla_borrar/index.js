import React  from 'react';
import { URL_DB } from '../../constants';
import axios from 'axios';
import { Row, Col, Container, Table, Button, Form, Alert, Modal } from 'react-bootstrap';
import Notifications from '../Notifications';
//import AutosuggestComponent from '../../components/Autosuggest/index.js';
import {  FaTimes, FaCheck, FaThumbsUp, FaGlasses } from "react-icons/fa";
import ShowLogElemento from '../ShowLogElemento';
import Ayuda from '../Ayuda';
import '../../components/Autosuggest/autosuggest.css';
import '../../pages/stylePages.css';

class ActiGrilla extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      lee_mod : props.lee_mod,
      registros: [],
      filterGrilla:'',
      grilla:[],
      temporadas:[],
      actividades:[],
      login_id: sessionStorage.getItem('USUA_ID'),
      tempo: '',
      acti: '',

      soci_codi: '',
      fetchingregistros: false,
      showLogElem: false,
      showhelp: false,

      respuestaSp: [],
      respError: '',
      mensajeAlerta: '',
    };
   
  }

  async getTemporadas() {

    this.setState({ fetchingregistros: true });
    const sql =  `${URL_DB}SEL_ACTI_TEMPO_DD_TEMPO()`;
    axios.get(sql)
    .then((response) => {
      this.setState({
        temporadas: response.data[0]
      },() => {
        if(this.state.temporadas.length>0){
          this.setState({ tempo : this.state.temporadas[0].tempo_actual_f})
        }
      });     
    })      
    .catch((error) => console.log(error))
  }

 
  async getActividades() {

    const sql = `${URL_DB}SEL_ACTI_TEMPO_DD_ACTIVIDADES('A')`
    axios.get(sql)
    .then((response) => {
      this.setState({
        actividades: response.data[0]
      });    
    })
    .catch((error) => console.log(error));
  }
       
  async getInicio() {
    try{
      await Promise.all([ this.getTemporadas(), this.getActividades() ])
    } catch(e) {
      console.log(e);
    } 
  }

  filtrarDatos = () => {
    const escapedValue = this.state.filterGrilla.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedValue, 'i');
    return this.state.registros.filter(filtro => 
   
      regex.test(filtro.soci_codi) || 
      regex.test(filtro.apenom) ||
      regex.test(filtro.edad) )
  }
  

  componentDidMount = () => {
    this.getInicio()
  }

  poblarGrilla = (a_tempo, a_acti) => {

    this.setState({ fetchRegistros: true,
                    tempo : a_tempo,
                    acti : a_acti });
    const sql =  `${URL_DB}SEL_ACTI_TEMPORADA_ARMA_RS('${a_tempo}','${a_acti}')`;
    axios.get(sql)
    .then((response) => {
      this.setState({
        grilla: response.data[0]
      });
    })
    .finally(() => {
      this.setState({ fetchRegistros: false })
    })  
    
  }

  handleShowLog = (regis) => {
    
    this.setState({
      showLogElem : true,
      soci_codi   : regis.soci_codi,
    });
  
  }

  /*==========================================================================
   RENDER
  *==========================================================================*/

  render() {  

    //const registrosFiltrados = this.filtrarDatos();
    const respError = this.state.respError;
    const mensajeAlerta = this.state.mensajeAlerta;
    const mensajeColor = this.state.mensajeColor;

    return(
      <div>        
        {mensajeAlerta.length >1 ? <Notifications mensaje={mensajeAlerta}
                                                  mensajeColor={mensajeColor}
                                    /> : '' }

        <Container fluid="true">
          <Form>
            <Row>
              <Col md={3} style={{fontSize:"22px"}}>
                  <b>{`Consulta Temporada`}</b>
              </Col>
              <Col md={1} >
                <Form.Group>
                    <select className="form-control" name="tempo" value={this.state.tempo} 
                        style={{fontWeight: "bold" }}
                        onChange={(e) => {
                                          this.poblarGrilla(e.target.value,this.state.acti )
                                        }} >
                        { this.state.temporadas.map((tem) => { 
                            return (
                                    <option key={tem.tempo_d} 
                                            value={tem.tempo_f}
                                    > {tem.tempo_d}
                                    </option>
                                    ) 
                          }) }

                    </select>
                  </Form.Group>
              </Col>  
              <Col md={3} >
                <Form.Group>
                    <select className="form-control" name="acti" value={this.state.acti} 
                        style={{fontWeight: "bold" }}
                        onChange={(e) => {
                                          this.poblarGrilla(this.state.tempo,e.target.value)
                                          }} >
                        { this.state.acti==='' &&  // Cuando esta vacio ponemos un reg de 'Seleccion' para que haga el change
                                      <option key={'0'} value={''} disabled >( Seleccione Actividad )</option>
                      }
                        { this.state.actividades.map((act) => { 
                            return (
                                    <option key={act.acti_acti} 
                                            value={act.acti_acti}
                                    > {act.acti_deno}
                                    </option>
                                    ) 
                          }) }

                    </select>
                  </Form.Group>
              </Col>  
              <Col xs={3}>
                    <Alert key="1" variant="danger" show={respError.length >3 ? true : false} >
                    {respError}</Alert>
              </Col>
              <Col xs={1}>
                <Button  variant='outline-warning' size='sm' onClick={() => {this.setState({ showhelp : true}) } } > 
                Ayuda
                </Button>
              </Col>
            </Row>
            <Row>
              <Col>
              <Table  bordered hover size="sm" id="data_table">
              <thead className="Grilla-header">
                <tr>
                  <th>#Soc</th>
                  <th>Apelido y nombre</th>
                  <th>Edad</th>
                  <th>Categ</th>
                  <th style={{textAlign: "center"}}>Ene</th>
                  <th style={{textAlign: "center"}}>Feb</th>
                  <th style={{textAlign: "center"}}>Mar</th>
                  <th style={{textAlign: "center"}}>Abr</th>
                  <th style={{textAlign: "center"}}>May</th>
                  <th style={{textAlign: "center"}}>Jun</th>
                  <th style={{textAlign: "center"}}>Jul</th>
                  <th style={{textAlign: "center"}}>Ago</th>
                  <th style={{textAlign: "center"}}>Sep</th>
                  <th style={{textAlign: "center"}}>Oct</th>
                  <th style={{textAlign: "center"}}>Nov</th>
                  <th style={{textAlign: "center"}}>Dic</th>
                  <th>% Pago</th>
                  <th>Liga</th>
                  <th>Ingreso</th>
                  <th>Baja</th>
                  <th>Ver</th>
                </tr>
                </thead>
                <tbody>
                {
                  this.state.fetchRegistros && 'Cargando...'
                }
                {  this.state.grilla.map((lis,i) => {
  
                      return (
                        <tr key={i}>
                          <td>{`#${lis.soci_codi}`}</td>
                          <td style={{backgroundColor: lis.color_b}}>{lis.apenom}</td>
                          <td style={{backgroundColor: lis.color_b, textAlign : "center"}}>{lis.edad}</td>
                          <td style={{backgroundColor: lis.color_b}}>{lis.tema_acti_cate}</td>

                          <td style={{backgroundColor: lis.t_mes01_col_f, color:lis.t_mes01_col, textAlign: "center" }}>
                              { lis.t_mes01 === 'S' && <FaCheck /> }
                              { lis.t_mes01 === 'N' && <FaTimes /> }
                              { lis.t_mes01 === 'P' && <FaThumbsUp /> }
                          </td>
                          <td style={{backgroundColor: lis.t_mes02_col_f, color:lis.t_mes02_col, textAlign: "center" }}>
                              { lis.t_mes02 === 'S' && <FaCheck /> }
                              { lis.t_mes02 === 'N' && <FaTimes /> }
                              { lis.t_mes02 === 'P' && <FaThumbsUp /> }
                          </td>
                          <td style={{backgroundColor: lis.t_mes03_col_f, color:lis.t_mes03_col, textAlign: "center" }}>
                            
                              { lis.t_mes03 === 'S' && <FaCheck /> }
                              { lis.t_mes03 === 'N' && <FaTimes /> }
                              { lis.t_mes03 === 'P' && <FaThumbsUp /> }
                          </td>
                          <td style={{backgroundColor: lis.t_mes04_col_f, color:lis.t_mes04_col, textAlign: "center" }}>
                              
                              { lis.t_mes04 === 'S' && <FaCheck /> }
                              { lis.t_mes04 === 'N' && <FaTimes /> }
                              { lis.t_mes04 === 'P' && <FaThumbsUp /> }
                          </td>
                          <td style={{backgroundColor: lis.t_mes05_col_f, color:lis.t_mes05_col, textAlign: "center" }}>
                              
                              { lis.t_mes05 === 'S' && <FaCheck /> }
                              { lis.t_mes05 === 'N' && <FaTimes /> }
                              { lis.t_mes05 === 'P' && <FaThumbsUp /> }
                          </td>
                          <td style={{backgroundColor: lis.t_mes06_col_f, color:lis.t_mes06_col, textAlign: "center" }}>
                              
                              { lis.t_mes06 === 'S' && <FaCheck /> }
                              { lis.t_mes06 === 'N' && <FaTimes /> }
                              { lis.t_mes06 === 'P' && <FaThumbsUp /> }
                          </td>
                          <td style={{backgroundColor: lis.t_mes07_col_f, color:lis.t_mes07_col, textAlign: "center" }}>
                            
                              { lis.t_mes07 === 'S' && <FaCheck /> }
                              { lis.t_mes07 === 'N' && <FaTimes /> }
                              { lis.t_mes07 === 'P' && <FaThumbsUp /> }
                          </td>
                          <td style={{backgroundColor: lis.t_mes08_col_f, color:lis.t_mes08_col, textAlign: "center" }}>
                              { lis.t_mes08 === 'S' && <FaCheck /> }
                              { lis.t_mes08 === 'N' && <FaTimes /> }
                              { lis.t_mes08 === 'P' && <FaThumbsUp /> }
                          </td>
                          <td style={{backgroundColor: lis.t_mes09_col_f, color:lis.t_mes09_col, textAlign: "center" }}>
                              { lis.t_mes09 === 'S' && <FaCheck /> }
                              { lis.t_mes09 === 'N' && <FaTimes /> }
                              { lis.t_mes09 === 'P' && <FaThumbsUp /> }
                          </td>
                          <td style={{backgroundColor: lis.t_mes10_col_f, color:lis.t_mes10_col, textAlign: "center" }}>
                              { lis.t_mes10 === 'S' && <FaCheck /> }
                              { lis.t_mes10 === 'N' && <FaTimes /> }
                              { lis.t_mes10 === 'P' && <FaThumbsUp /> }
                          </td>
                          <td style={{backgroundColor: lis.t_mes11_col_f, color:lis.t_mes11_col, textAlign: "center" }}>
                              { lis.t_mes11 === 'S' && <FaCheck /> }
                              { lis.t_mes11 === 'N' && <FaTimes /> }
                              { lis.t_mes11 === 'P' && <FaThumbsUp /> }
                          </td>
                          <td style={{backgroundColor: lis.t_mes12_col_f, color:lis.t_mes12_col, textAlign: "center" }}>
                              { lis.t_mes12 === 'S' && <FaCheck /> }
                              { lis.t_mes12 === 'N' && <FaTimes /> }
                              { lis.t_mes12 === 'P' && <FaThumbsUp /> }
                          </td>

                          <td style={{width: "70px", backgroundColor: lis.porcen_color_b, textAlign : "center"}}>
                                {lis.tema_porcen_pago}
                          </td>
                          
                          <td style={{backgroundColor: lis.t_liga_col_f, color:lis.t_liga_col, textAlign: "center" }}>
                              { lis.t_paga_liga === 'S' && <FaCheck /> }
                              { lis.t_paga_liga === 'N' && <FaTimes /> }
                              { lis.t_paga_liga === 'P' && <FaThumbsUp /> }
                          </td>
                          <td>{lis.soci_ingre_f}</td>
                          <td style={{backgroundColor: lis.color_b}}>
                              {lis.soci_baja_f}</td>
                          <td>
                           <div style={{backgroundColor: "#6c757d", color:"white", textAlign: "center" }}
                                 onClick={() => this.handleShowLog(lis)}>
                                <FaGlasses />
                            </div>
                          </td>
                        </tr> 
                      ) 
                    }) 
                  }  
                  </tbody>
       { this.state.grilla.length>0 &&      
                <tfoot className="Grilla-header">
                  <td />
                  <td style={{textAlign:"center"}}>{`${this.state.grilla.length} Reg`}</td>
                  <td colSpan={19} />
                </tfoot>
        }
                </Table>
              </Col>
            </Row>
          </Form>
         
        </Container>





        < Modal show={this.state.showLogElem} 
                onHide={() => { this.setState({ showLogElem : false}) } } 
                dialogClassName="modal-60">
            <ShowLogElemento  ulog_clave={'SOCIOS'} 
                              ulog_id_number={this.state.soci_codi}
                              />
        </Modal>



        < Modal show={this.state.showhelp} onHide={() => { this.setState({ showhelp : false}) } } dialogClassName="modal-90">
            <Ayuda clave={'config-actividad'}/>
        </Modal>



      </div>
    );
  }
}

export default ActiGrilla;
