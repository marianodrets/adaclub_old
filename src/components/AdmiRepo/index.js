import React from 'react';
import { URL_DB } from './../../constants';
import axios from 'axios';
import { Table, Row, Col, Container, Button, Form, FormControl } from 'react-bootstrap';
import exportToCSV from '../../utils/functions/export-excel';
import swal from 'sweetalert';
import ordenarGrilla from './../../utils/functions/ordenar-grilla'
import { DiDatabase } from "react-icons/di";
import { FaDownload } from "react-icons/fa";
import '../../pages/stylePages.css';

class AdmiRepo extends React.Component {
  constructor(props) {
    super(props);

    var hoy = new Date(); 
    var primer = new Date(hoy.getFullYear(),hoy.getMonth(),1);

    this.state = {
      lee_mod : props.lee_mod,
      desde : primer.toISOString().split('T')[0],
      hasta : hoy.toISOString().split('T')[0],
      socio : '',

      registros: [],
      login_id: sessionStorage.getItem('USUA_ID'),

      filterGrilla: '',
      fetchRegistros: false,
      expSql : '',
      expTitulo:'Reporte Administración',
      expSubtit: '',
      respuestaSp: [],
      respError: '',
      mensajeAlerta: '',
    };
    
  }

  componentDidMount() {
  
  }

  /*==========================================================================
   Utilidades de filtros y sort para la grilla ppal 
  *==========================================================================*/
  filtrarDatos() {
    const escapedValue = this.state.filterGrilla.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedValue, 'i');
    return this.state.registros.filter(filtro =>  
      regex.test(filtro.acti) ||
      regex.test(filtro.cuen_deno) || 
      regex.test(filtro.subc_deno) )
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
  
      this.setState({ fetchRegistros: true })

      const sql = `${URL_DB}SEL_CAJA_MOVIM_GRILLA('${this.state.desde}','${this.state.hasta}')`
      axios.get(sql)
        .then((response) => {
          this.setState({
            registros: response.data[0],
            expSql: sql,
            expSubtit: `Grilla por conceptos entre ${this.state.desde} y ${this.state.hasta}`
          })
        })
        .catch((error) => console.log(error))
        .finally(() => {
          this.setState({ fetchRegistros: false })
        })
      
    }
  }


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
            <Col xs={3} style={{fontSize:"22px"}}>
                <b>Grilla por conceptos</b>
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
                  <Button  variant='outline-primary' size='sm' onClick={this.poblarGrilla} > 
                  <DiDatabase />Consultar
                  </Button>
              </Col>
            <Col xs={2}>
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
  }           </Col>
          </Row>

          <Row>
            <Col>
              <Table striped bordered hover size="sm" id="data_table">
                <thead className="Grilla-header">
                <tr>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('acti')}>
                      Actividad</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('cuen_deno')}>
                      Concepto</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('subc_deno')}>
                      SubConcepto</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('ingreso')}>
                      Ingreso</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('egreso')}>
                      Egreso</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('canti')}>
                      Cant Movim</Button>
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
                        <td>{regis.acti}</td>
                        <td>{regis.cuen_deno}</td>
                        <td>{regis.subc_deno}</td>
                        <td style={{textAlign:"right"}}>{regis.ingreso}</td>
                        <td style={{textAlign:"right"}}>{regis.egreso}</td>
                        <td style={{textAlign:"center"}}>{regis.canti}</td>
                      </tr>  
                    ) 
                  }) 
                }
                </tbody>
       { registrosFiltrados.length>0 &&      
                <tfoot className="Grilla-header">
                  <td style={{textAlign:"center"}}>{`${registrosFiltrados.length} Reg`}</td>
                  <td />
                  <td>{`Total = ${registrosFiltrados.reduce((acum, act) => acum + Number(act.movi_monto),0)}`}</td>
                  <td style={{textAlign:"right"}}>{registrosFiltrados.reduce((acum, act) => acum + Number(act.ingreso),0)}</td>
                  <td style={{textAlign:"right"}}>{registrosFiltrados.reduce((acum, act) => acum + Number(act.egreso),0)}</td>
                  <td style={{textAlign:"center"}}>{registrosFiltrados.reduce((acum, act) => acum + Number(act.canti),0)}</td>
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

export default AdmiRepo;
