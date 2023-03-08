import React from 'react';
import { URL_DB } from './../../constants';
import axios from 'axios';
import { Table, Row, Col, Container, Button, Form, FormControl } from 'react-bootstrap';
//import ExpGrillaExcelPDF from '../../components/ExpGrillaExcelPDF';
import swal from 'sweetalert';
import ordenarGrilla from './../../utils/functions/ordenar-grilla'
import { FaGlasses } from "react-icons/fa";
import { DiDatabase } from "react-icons/di";
import '../../pages/stylePages.css';

class UsuaLog extends React.Component {
  constructor(props) {
    super(props);

    var hoyd = new Date();
    var ayer = new Date();
    ayer.setDate(ayer.getDate() - 30);
  
    this.state = {
      lee_mod : props.lee_mod,
      desde : ayer.toISOString().split('T')[0],
      hasta : hoyd.toISOString().split('T')[0],
      socio : '',

      registros: [],
      usuaLog: [],
      login_id: sessionStorage.getItem('USUA_ID'),

      filterGrilla: '',
      fetchRegistros: false,
      respuestaSp: [],
      respError: '',
      mensajeAlerta: '',
    };



    //this.ordenarGrilla        = this.ordenarGrilla.bind(this);
    
  }

  componentDidMount() {

    this.poblarGrilla();
  
  }

  
  /*==========================================================================
   Utilidades de filtros y sort para la grilla ppal 
  *==========================================================================*/
  filtrarDatos() {
    const escapedValue = this.state.filterGrilla.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedValue, 'i');
    return this.state.registros.filter(filtro => 
      regex.test(filtro.ulog_fecha_hora) || 
      regex.test(filtro.ulog_clave) ||
      regex.test(filtro.ulog_param) || 
      regex.test(filtro.ulog_acciones) )
  }

  ordenarGrilla = (key) => {
    const registros = ordenarGrilla(key, this.state.registros);

    this.setState({ registros });
  }
  
  /*==========================================================================
   Completo datos de grilla principal 
  *==========================================================================*/
  poblarGrilla = (p_opc) => {

    this.setState({registros: []});

    if(this.state.desde.length<8) {
      swal({ 
        title : `Consulta entre fechas `,
        text  : ' complete fecha <desde>',});
    }
    if(this.state.hasta.length<8) {
      swal({ 
        title : `Consulta entre fechas `,
        text  : ' complete fecha <hasta>',});
    }
    if(this.state.hasta < this.state.desde) {
      swal({ 
        title : `Consulta entre fechas `,
        text  : ' <hasta> no puede ser menor que <desde>',});
    }
    if(this.state.desde.length>8 && this.state.desde.length>8){
  
        this.setState({ fetchRegistros: true,
        });
        const sql = `${URL_DB}SEL_USUARIOS_ACUM_LOG('${this.state.desde}','${this.state.hasta}')`
        axios.get(sql)
          .then((response) => {
            this.setState({
              usuaLog: response.data[0],
            })
          })
          .catch((error) => console.log(error))
          .finally(() => {
            this.setState({ fetchRegistros: false })
          })
    }

  }

  poblarLog = (a_ulog_clave, a_ulog_usua_id) => {

    const sql = `${URL_DB}SEL_USUARIOS_LOG('${a_ulog_clave}',${a_ulog_usua_id},null,null,'${this.state.desde}','${this.state.hasta}')`
    axios.get(sql)
      .then((response) => {
        this.setState({
          registros: response.data[0]
        }) 
      })
      .catch((error) => console.log(error));
    }
  
  /* Opciones del menu, trato hombres, mujeres o todos */
  handleChange = (event) => {
    const { target } = event;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({[name]: value });

  };
  
  
  /*==========================================================================
   RENDER
  *==========================================================================*/

  render() {  

    const registrosFiltrados = this.filtrarDatos();

    return(
      <div>        
       
        <Container  fluid="true">
          <Row>
            <Col xs={3} style={{fontSize:"22px"}}>
                <b>Log usuarios/acciones</b>
            </Col>
            <Col xs={2}>
              <Form.Group>
                <Form.Label><b>Desde</b></Form.Label>
                <Form.Control type="date" name="desde" value={this.state.desde} onChange={this.handleChange}
                                        style={{ fontWeight: "bold" }} />
              </Form.Group>
            </Col>
            <Col xs={2}>
              <Form.Group>
                <Form.Label><b>Hasta</b></Form.Label>
                <Form.Control type="date" name="hasta" value={this.state.hasta} onChange={this.handleChange}
                                        style={{ fontWeight: "bold" }} />
              </Form.Group>
            </Col>
            <Col xs={1}>
                <Button variant='outline-primary' size='sm' 
                        onClick={this.poblarGrilla} > 
                <DiDatabase />Consultar
                </Button>
            </Col>
            <Col xs={3}>
              <Form.Group>
              <Form.Label><b>Buscar en grilla amarilla</b></Form.Label>
                <FormControl type="text" name="buscar" placeholder="Texto a filtrar" className="mr-sm-2" 
                        onChange={(e) => { this.setState({ filterGrilla: e.target.value })} } /> 
              </Form.Group>
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
            <Col md={5}>
              <Table striped bordered hover size="sm" id="data_table">
                <thead className="Grilla-header">
                <tr>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('ulog_usua_id')}>
                      #ID</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('usu_apenom')}>
                      Nombre Efector</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('ulog_clave')}>
                      Actividad</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('canti')}>
                      #Veces</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('min')}>
                      Desde</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('max')}>
                      Hasta</Button>
                  </th>
                  <th>Detalle</th>
                </tr>
                </thead>
                <tbody>
                {
                  this.state.fetchRegistros && 'Cargando...'
                }
                {
                  this.state.usuaLog.map((regis,i) => {
                    return (
                      <tr key={i}>
                        <td>{regis.ulog_usua_id}</td>
                        <td>{regis.usu_apenom}</td>
                        <td>{regis.ulog_clave}</td>
                        <td style={{ textAlign:"center"}}>{regis.canti}</td>
                        <td>{regis.min}</td>
                        <td>{regis.max}</td>
                        <td style={{ textAlign:"center"}}>
                          <Button variant="secondary" size="sm" 
                              onClick={() => this.poblarLog(regis.ulog_clave, regis.ulog_usua_id) }>
                                <FaGlasses /></Button>
                        </td>
                      </tr>  
                    ) 
                  }) 
                 }
                </tbody>
              </Table>
            </Col>
           {/* ==================  parte derecha ====================== */}
            <Col md={7}>
              <Table striped bordered hover size="sm" id="data_detalle">
                <thead className="Grilla-header-warning">
                <tr>
                  <th>Fecha-Hora</th>
                  <th>Activi</th>
                  <th>#Identif</th>
                  <th>Acción</th>
                </tr>
                </thead>
                <tbody style={{backgroundColor:"#ffffe6"}}>
                {
                  this.state.fetchRegistros && 'Cargando...'
                }
                { 
                  registrosFiltrados.map((rlog,i) => {
                    return (
                      <tr key={i}>
                        <td>{rlog.ulog_fecha_hora}</td>
                        <td>{rlog.ulog_clave}</td>
                        <td>{rlog.ulog_param}</td>
                        <td style={{ backgroundColor:rlog.ulog_color_semaf}}>{rlog.ulog_acciones}</td>
                      </tr>  
                    ) 
                  }) 
                 }
                </tbody>
              </Table>
            </Col>
           

          </Row>
        </Container>

      </div>
    );
  }
}

export default UsuaLog;
