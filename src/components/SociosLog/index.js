import React from 'react';
import { URL_DB } from './../../constants';
import axios from 'axios';
import { Table, Row, Col, Container, Button, Form, FormControl } from 'react-bootstrap';
import exportToCSV from '../../utils/functions/export-excel';
import swal from 'sweetalert';
import ordenarGrilla from './../../utils/functions/ordenar-grilla';
import { DiDatabase } from "react-icons/di";
import { FaDownload } from "react-icons/fa";
import '../../pages/stylePages.css';

class SociosLog extends React.Component {
  constructor(props) {
    super(props);

    var currentdate = new Date();

    this.state = {
      lee_mod : props.lee_mod,
      opcion: 'soc',
      desde : currentdate.toISOString().split('T')[0],
      hasta : currentdate.toISOString().split('T')[0],
      socio : '',

      registros: [],
      login_id: sessionStorage.getItem('USUA_ID'),

      filterGrilla: '',
      fetchRegistros: false,
      expSql : '',
      expTitulo:'Log de Socios',
      expSubtit: '',
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
      regex.test(filtro.usu_apenom) || 
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
  poblarGrilla = () => {

    this.setState({registros: []});

    if (this.state.opcion==='soc') {
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
        if(this.state.desde.length>8 && this.state.desde.length>8 && this.state.socio!==''){
      
          this.setState({ fetchRegistros: true,
          });
          const sql = `${URL_DB}SEL_USUARIOS_LOG('SOCIOS',null,${this.state.socio},null,null,null)`
          axios.get(sql)
            .then((response) => {
              this.setState({
                registros: response.data[0],
                expSql: sql,
                expSubtit: `De socio #${this.state.socio}`
              })
            })
            .catch((error) => console.log(error))
            .finally(() => {
              this.setState({ fetchRegistros: false })
            })
      }
    }

    if (this.state.opcion==='fec') {
        const sql = `${URL_DB}SEL_USUARIOS_LOG('SOCIOS',null,null,null,'${this.state.desde}','${this.state.hasta}')`
        axios.get(sql)
          .then((response) => {
            this.setState({
              registros: response.data[0],
              expSql: sql,
              expSubtit: `Entre fechas`
            })
          })
          .catch((error) => console.log(error))
          .finally(() => {
            this.setState({ fetchRegistros: false })
          })

    }    
  }

  /* Opciones del menu, trato hombres, mujeres o todos */
  handleChange = (event) => {
    const { target } = event;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({[name]: value});

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
            <Col xs={1} style={{fontSize:"22px"}}>
                <b>Log</b>
            </Col>
            <Col xs={2}>
                <Form.Group>
                  <Form.Label><b>Seleccione Listado</b></Form.Label>
                  <select className="form-control" name="opcion" onChange={this.handleChange} >
                      <option key={1}  value={'soc'}> por socio </option>
                      <option key={2}  value={'fec'}> entre fechas </option>
                  </select>
                </Form.Group>
            </Col> 
          { this.state.opcion==='soc' &&
            <Col xs={2}>
              <Form.Group>
                <Form.Label><b>Socio</b></Form.Label>
                <Form.Control type="text" name="socio" value={this.state.socio} 
                              onChange={this.handleChange}
                              style={{ fontWeight: "bold" }} />
              </Form.Group>
            </Col>
          }
          { this.state.opcion==='fec' &&          
            <Col xs={2}>
              <Form.Group>
                <Form.Label><b>Desde</b></Form.Label>
                <Form.Control type="date" name="desde" value={this.state.desde} onChange={this.handleChange}
                                        style={{ fontWeight: "bold" }} />
              </Form.Group>
            </Col>
          }
          { this.state.opcion==='fec' &&  
            <Col xs={2}>
              <Form.Group>
                <Form.Label><b>Hasta</b></Form.Label>
                <Form.Control type="date" name="hasta" value={this.state.hasta} onChange={this.handleChange}
                                        style={{ fontWeight: "bold" }} />
              </Form.Group>
            </Col>
          }
            <Col xs={1}>
                <Button  variant='outline-primary' size='sm' onClick={this.poblarGrilla} > 
                <DiDatabase />Consultar
                </Button>
            </Col>
            <Col xs={3}>
              <Form.Group>
              <Form.Label><b>Buscar en esta grilla</b></Form.Label>
                <FormControl type="text" name="buscar" placeholder="Texto a filtrar" className="mr-sm-2" 
                        onChange={(e) => { this.setState({ filterGrilla: e.target.value })} } /> 
              </Form.Group>
            </Col>
            
            <Col xs={1}>
  { this.state.registros.length > 0 &&
                <Button variant='outline-success' size='sm' 
                        onClick={(e) => exportToCSV(this.state.expTitulo,this.state.expSubtit,this.state.expSql) } > 
                        <FaDownload /> Excel
                </Button>
  }
           </Col>
          </Row>

          <Row>
            <Col>
              <Table striped bordered hover size="sm" id="data_table">
                <thead className="Grilla-header">
                <tr>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('ulog_usua_id')}>
                      #ID</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('usu_apenom')}>
                      Nombre Efector</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('ulog_fecha_hora')}>
                      Fecha Hora</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('ulog_clave')}>
                      Actividad</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('ulog_param')}>
                      Entidad</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('ulog_acciones')}>
                      Acciones Efectuadas</Button>
                  </th>
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
                        <td>{regis.ulog_usua_id}</td>
                        <td>{regis.usu_apenom}</td>
                        <td>{regis.ulog_fecha_hora}</td>
                        <td>{regis.ulog_clave}</td>
                        <td>{regis.ulog_param}</td>
                        <td>{regis.ulog_acciones}</td>
                      </tr>  
                    ) 
                  }) 
                }
                </tbody>
                { registrosFiltrados.length>0 &&      
                <tfoot className="Grilla-header">
                  <td />
                  <td style={{textAlign:"center"}}>{`${registrosFiltrados.length} Reg`}</td>
                  <td colSpan={4} />
                </tfoot>
        }
              </Table>
            </Col>
          </Row>
        </Container>

      </div>
    );
  }
}

export default SociosLog;
