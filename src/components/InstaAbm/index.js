import React from 'react';
import { URL_DB } from './../../constants';
import axios from 'axios';
import { Table, Row, Col, Container, Button, Form, FormControl, Alert, Modal, FormGroup } from 'react-bootstrap';
//import ExpGrillaExcelPDF from '../../components/ExpGrillaExcelPDF';
import { FaRegEdit, FaTrashAlt, } from "react-icons/fa";
import ordenarGrilla from './../../utils/functions/ordenar-grilla'
import swal from 'sweetalert';
import '../../pages/stylePages.css';

class InstaAbm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      lee_mod : props.lee_mod,
      registros: [],
      login_id: sessionStorage.getItem('USUA_ID'),

      modalTitulo:'',
      instaHora:'',
      inst_id : '',
      inho_id : '',
      inst_deno: '',
      inst_deno_redu: '',
      inho_numdia: '',
      inho_hora_d: '',
      inho_hora_h: '',
      filterGrilla: '',
      fetchRegistros: false,
      showModalEdit: false,
      respuestaSp: [],
      respError: '',
      mensajeAlerta: '',
    };

  }

  poblarGrilla = () => {

    const sql = `${URL_DB}SEL_INSTALACIONES_HORARIOS_ABM()`
    axios.get(sql)
    .then((response) => {
      this.setState({
        registros: response.data[0]
      });   
    })
    .catch((error) => console.log(error));

  }

  componentDidMount() {

    this.poblarGrilla()

  }

  /*==========================================================================
   Utilidades de filtros y sort para la grilla ppal 
  *==========================================================================*/
  filtrarDatos() {
    const escapedValue = this.state.filterGrilla.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedValue, 'i');
    return this.state.registros.filter(filtro => 
      regex.test(filtro.inst_deno_grilla) || 
      regex.test(filtro.dia_sem) || 
      regex.test(filtro.inho_hora_d) || 
      regex.test(filtro.inho_hora_h) )
  }

  ordenarGrilla = (key) => {
    const registros = ordenarGrilla(key, this.state.registros);

    this.setState({ registros });
  }
  
  handleModalEdit(a_instaHora,a_altMod,a_regis) {

    if (a_instaHora==='I') {
        this.setState({
          showModalEdit: true,
          modalTitulo : a_altMod==='A'?'Nueva instalación':'Modifica instalación',
          instaHora: a_instaHora,
          inst_id : a_altMod==='A'?0:a_regis.inst_id,
          inho_id : 0,
          inst_deno: a_regis.inst_deno,
          inst_deno_redu: a_regis.inst_deno_redu,
          inho_numdia: 0,
          inho_hora_d: '00:00',
          inho_hora_h: '00:00',

          respError: '',
          mensajeAlerta: '',
          mensajeColor: 'N' 
        });
      } else {
        this.setState({
          showModalEdit: true,
          modalTitulo : a_altMod==='A'?'Nuevo Horario para instalación':'Modifica Horario',
          instaHora: a_instaHora,
          inst_id : a_regis.inst_id,
          inho_id : a_altMod==='A'?0:a_regis.inho_id,
          inst_deno: a_regis.inst_deno,
          inst_deno_redu: a_regis.inst_deno_redu,
          inho_numdia: a_altMod==='A'?1:a_regis.inho_numdia,
          inho_hora_d: a_altMod==='A'?'00:00':a_regis.inho_hora_d,
          inho_hora_h: a_altMod==='A'?'00:00':a_regis.inho_hora_h,

          respError: '',
          mensajeAlerta: '',
          mensajeColor: 'N' 
        });
    }
  }

  handleModalAltaInsta = () => {
    this.setState({
      showModalEdit: true,
      modalTitulo : 'Nueva instalación',
      instaHora: 'I',
      inst_id :0,
      inho_id : 0,
      inst_deno: '',
      inst_deno_redu: '',
      inho_numdia: 0,
      inho_hora_d: '00:00',
      inho_hora_h: '00:00',

      respError: '',
      mensajeAlerta: '',
      mensajeColor: 'N' 
    });
  }

  handleModalExit = () => {
   
    this.setState({ showModalEdit: false })
    this.setState({
      mensajeAlerta : 'No se aplicaron cambios',
      mensajeColor  : 'red',
    })
  }

  handleChange = (event) => {
    const { target } = event;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });

  };

  /*==========================================================================
   Actualizacion : Modificacion a base de datos
*==========================================================================*/

handleGrabar = (event) => {

  const sql =  `${URL_DB}AM_INSTALACIONES_HORARIOS(${this.state.login_id},'${this.state.instaHora}',
${this.state.inst_id},'${encodeURIComponent(this.state.inst_deno)}','${encodeURIComponent(this.state.inst_deno_redu)}',
${this.state.inho_id},'${this.state.inho_numdia}','${this.state.inho_hora_d}','${this.state.inho_hora_h}')`
     
      axios.get(sql)
      .then((response) => {
            this.setState({
              respuestaSp: response.data[0]
            })
            var obj = this.state.respuestaSp[0];
            this.setState({
              respError : obj.respuesta
            })
  
            if (this.state.respError==='OK') {
  
                this.setState({
                    mensajeAlerta : 'Registrado correctamente',
                    mensajeColor  : 'green',
                    showModalEdit : false
                })
                this.poblarGrilla()
            }    
        })
        .catch((error) => {
          alert('ERROR interno API al actualizar BD:'+error+sql)
        })
    
  }
 
  handleBorrar = (a_instaHora, a_reg) => {

    swal({ 
      title : `Eliminar ${a_instaHora==='I'?'Instalación':'Horario'} `,
      text  : ' confirma esta acción ?',
      icon : "warning",  
      buttons : ['No','Si'], 
      }).then( respuesta => {
        if ( respuesta===true ) {
      
          const sql =  `${URL_DB}B_INSTALACIONES_HORARIOS(${this.state.login_id},'${a_instaHora}',${a_reg.inst_id},${a_reg.inho_id})`    
          axios.get(sql)
          .then((response) => {
                this.setState({
                  respuestaSp: response.data[0]
                })
                var obj = this.state.respuestaSp[0];
                this.setState({
                  respError : obj.respuesta
                })
      
                if (this.state.respError==='OK') {
      
                    this.setState({
                        mensajeAlerta : 'Registrado correctamente',
                        mensajeColor  : 'green',
                        showModalEdit : false
                    })
                    this.poblarGrilla()
                }    
            })
            .catch((error) => {
              alert('ERROR interno API al actualizar BD:'+error+sql)
            })
                
        } else {
            this.setState({
              mensajeAlerta : 'No se aplico baja',
              mensajeColor  : 'red',
            })
        }

      });

  }
  
 /*==========================================================================
   RENDER
  *==========================================================================*/

  render() {  

    const registrosFiltrados = this.filtrarDatos();
    const respError = this.state.respError;
    //const mensajeAlerta = this.state.mensajeAlerta;
    //const mensajeColor = this.state.mensajeColor;

    return(
      <div>        
       
        <Container  fluid="true">
          <Row>
            <Col xs={4} style={{fontSize:"22px"}}>
                <b>Definir instalaciones</b>
            </Col>
            <Col xs={3}>
              <Form.Group>
                <FormControl type="text" name="buscar" placeholder="Texto a filtrar" className="mr-sm-2" 
                        onChange={(e) => { this.setState({ filterGrilla: e.target.value })} } /> 
              </Form.Group>
            </Col>
            <Col xs={2}>
      { this.state.lee_mod==='M' 
          ?    <Button variant="primary" size="sm" onClick={this.handleModalAltaInsta} >
                  + Instalacion
               </Button>
          :    <Button variant="outline-danger" size="sm" disabled>Solo Lectura</Button>
      }   
                
            </Col>
            <Col xs={1}>
                <Button  variant='outline-warning' size='sm' onClick={() => {this.setState({ showhelp : true}) } } > 
                Ayuda
                </Button>
     {/**        <ExpGrillaExcelPDF showExportar =  {true}
                      tituloExporta = {'Listado de temas'}
                      sqlExporta= {`${URL_DB}SEL_MATERIA_TEMAS('D',null,null,${this.state.login_prof_id})`}
                
            />
            */}
      
           </Col>
          </Row>

          <Row>
            <Col>
              <Table striped bordered hover size="sm" id="data_table">
                <thead className="Grilla-header">
                <tr>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('cuen_id')}>
                      #Inst</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('subc_id')}>
                      #Hor</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('cuen_deno')}>
                      Instalación</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('subc_deno')}>
                      Dia</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('subc_deno')}>
                      Desde</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('subc_deno')}>
                      hasta</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('debi_credi')}>
                      Alta</Button>
                  </th>
                  <th>Acc Instalac</th>
                  <th>Acc Horarios</th>
                </tr>
                </thead>
                <tbody>
                {
                  this.state.fetchRegistros && 'Cargando...'
                }
                {
                  registrosFiltrados.map((regis,i) => {
                    return (
                      <tr key={i}>
                        <td style={{ backgroundColor:regis.db_color }}>{regis.inst_id}</td>
                        <td style={{ backgroundColor:regis.db_color }}>{regis.inho_id}</td>
                        <td style={{ backgroundColor:regis.db_color }}><b>{regis.inst_deno_grilla}</b></td>
                        <td style={{ backgroundColor:regis.db_color }}>{regis.dia_sem}</td>
                        <td style={{ backgroundColor:regis.db_color }}>{regis.inho_hora_d}</td>
                        <td style={{ backgroundColor:regis.db_color }}>{regis.inho_hora_h}</td>
                        <td style={{ backgroundColor:regis.db_color }}>{regis.alta_f}</td>
                        <td style={{ backgroundColor:regis.db_color }}>
    { regis.inho_id===0 && this.state.lee_mod==='M' &&
      <>
                            <Button variant="primary" size="sm" onClick={()=>{this.handleModalEdit('I','M',regis)}}>
                              <FaRegEdit /> 
                            </Button>
                            <Button variant="primary" size="sm" onClick={()=>{this.handleModalEdit('H','A',regis)}}>
                              + Horario
                            </Button>
      </>}
    { regis.inho_id===0 && regis.canti===0 && this.state.lee_mod==='M' &&
      <>
                            <Button variant="danger" size="sm" onClick={()=>{this.handleBorrar('I',regis)}}>
                              <FaTrashAlt />
                            </Button>
      </>}

                        </td>
                        <td>
    { regis.inho_id>0 && this.state.lee_mod==='M' &&
      <>
                            <Button variant="primary" size="sm" onClick={()=>{this.handleModalEdit('H','M',regis)}}>
                              <FaRegEdit /> 
                            </Button>
                            <Button variant="danger" size="sm" onClick={()=>{this.handleBorrar('H',regis)}}>
                              <FaTrashAlt />
                            </Button>
      </>}
                        </td>
                      </tr>  
                    ) 
                  }) 
                }
                </tbody>
              </Table>
            </Col>
          </Row>
        </Container>



        

        <Modal show={this.state.showModalEdit} onHide={this.handleModalExit} dialogClassName="modal-60" >
          <Modal.Header closeButton>
            <Modal.Title>{this.state.modalTitulo}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
{ this.state.instaHora==='I' &&
<>
              <Row>
                <Col md={1}>
                  #{this.state.inst_id}
                </Col>
                <Col md={7}>      
                  <FormGroup>
                    Denominación Full
                    <FormControl  type="text" name={'inst_deno'} value={this.state.inst_deno}
                      onChange={this.handleChange}
                    />
                  </FormGroup>
                </Col>
                <Col md={4}>      
                  <FormGroup>
                  Denominación Reducida
                    <FormControl  type="text" name={'inst_deno_redu'} value={this.state.inst_deno_redu}
                      onChange={this.handleChange}
                    />
                  </FormGroup>
                </Col>
              </Row>
</>}
{ this.state.instaHora==='H' &&
<>
              <Row>
                <Col><b>{this.state.inst_deno}</b></Col>
              </Row>
              <Row>
                <Col md={4}>      
                  <FormGroup>
                    Dia
                    <select className="form-control" name="inho_numdia" value={this.state.inho_numdia} 
                        onChange={this.handleChange} >
                        { this.state.inho_numdia==='' &&  // Cuando esta vacio ponemos un reg de 'Seleccion' para que haga el change
                                      <option key={'0'} value={''} disabled >( Seleccione día )</option>
                      }
                          <option key={1} value={1}>Domingo</option>
                          <option key={2} value={2}>Lunes</option>
                          <option key={3} value={3}>Martes</option>
                          <option key={4} value={4}>Miércoles</option>
                          <option key={5} value={5}>Jueves</option>
                          <option key={6} value={6}>Viernes</option>
                          <option key={7} value={7}>Sábado</option>
                    </select>
                  </FormGroup>
                </Col>
                <Col md={4}>      
                  <FormGroup>
                    Hora desde
                    <FormControl  type="time" name={'inho_hora_d'} value={this.state.inho_hora_d}
                      onChange={this.handleChange}
                    />
                  </FormGroup>
                </Col>
                <Col md={4}>      
                  <FormGroup>
                    Hora hasta
                    <FormControl  type="time" name={'inho_hora_h'} value={this.state.inho_hora_h}
                      onChange={this.handleChange}
                    />
                  </FormGroup>
                </Col>
              </Row>
</>}
                <br />
                <Row>
                    <Col>
                      <Button variant="success" size="sm" onClick={this.handleGrabar}>
                          Grabar
                      </Button>
                      <Button variant="secondary" size="sm" onClick={this.handleModalExit}>
                          Cancelar
                      </Button>
                      </Col>
                      <Col xs={6}>
                      <Alert key="1" variant="danger" show={respError.length >3 ? true : false} >
                        {respError}
                      </Alert>
                    </Col>
                  </Row>
            </Form>
          </Modal.Body>
        </Modal>





      </div>
    );
  }
}

export default InstaAbm;
