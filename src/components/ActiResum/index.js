import React  from 'react';
import { URL_DB } from '../../constants';
import axios from 'axios';
import { Row, Col, Container, Table, Button, Form, FormControl, Modal } from 'react-bootstrap';
import Notifications from '../Notifications';
import { FaGlasses, FaDownload } from "react-icons/fa";
import exportToCSV from '../../utils/functions/export-excel';
import ordenarGrilla from './../../utils/functions/ordenar-grilla'
import ShowLogElemento from '../ShowLogElemento';
import '../../pages/stylePages.css';

class ActiResum extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      lee_mod : props.lee_mod,
      registros: [],
      filterGrilla:'',
      meses:[],
      temporadas:[],
      actividades:[],
      login_id: sessionStorage.getItem('USUA_ID'),
      tempo: '',
      acti: '',

      soci_codi: '',
      fetchmeses: false,
      fetchRegistros: false,
      expSql : '',
      expTitulo:'Resumen mensual Ingresos / Egresos',
      expSubtit: '',
      showLogElem: false,

      respuestaSp: [],
      respError: '',
      mensajeAlerta: '',
    };
   
  }

  async getTemporadas() {

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
      regex.test(filtro.movi_id) || 
      regex.test(filtro.actividad) || 
      regex.test(filtro.cuen_deno) ||
      regex.test(filtro.subc_deno) || 
      regex.test(filtro.movi_deno) || 
      regex.test(filtro.movi_monto) || 
      regex.test(filtro.cpro_razon) ||
      regex.test(filtro.movi_compro_tipo) || 
      regex.test(filtro.movi_compro_nro) )
  }
  

  componentDidMount = () => {
    this.getInicio()
  }
  /*==========================================================================
   Utilidades de filtros y sort para la grilla ppal 
  *==========================================================================*/
   filtrarDatos() {
    const escapedValue = this.state.filterGrilla.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedValue, 'i');
    return this.state.registros.filter(filtro => 
      regex.test(filtro.movi_id) || 
      regex.test(filtro.actividad) || 
      regex.test(filtro.cuen_deno) ||
      regex.test(filtro.subc_deno) || 
      regex.test(filtro.movi_deno) || 
      regex.test(filtro.movi_monto) || 
      regex.test(filtro.cpro_razon) ||
      regex.test(filtro.movi_compro_tipo) || 
      regex.test(filtro.movi_compro_nro) )
  }
      
  ordenarGrilla = (key) => {
    const registros = ordenarGrilla(key, this.state.registros);

    this.setState({ registros });
  }


  poblarMeses = (a_tempo, a_acti) => {

    this.setState({ fetchmeses: true,
                    tempo : a_tempo,
                    acti : a_acti });

    const sql =  `${URL_DB}SEL_ACTI_RESUMEN_MENSUAL('${a_tempo}','${a_acti}')`;
    axios.get(sql)
    .then((response) => {
        this.setState({
        meses: response.data[0],
        expSql: sql,
        expSubtit: this.state.actividades.find(f => f.acti_acti===this.state.acti).acti_deno
        });
    })
    .finally(() => {
        this.setState({ fetchmeses: false })
        })  

  }


  poblarGrilla = (a_reg) => {
    this.setState({ fetchRegistros: true })
    const sql =  `${URL_DB}SEL_CAJA_MOVIMIENTOS('${this.state.acti}','${a_reg.desde_f}','${a_reg.hasta_f}')`;
    axios.get(sql)
    .then((response) => {
      this.setState({
        registros: response.data[0]
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

    const registrosFiltrados = this.filtrarDatos();
    //const respError = this.state.respError;
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
                  <b>{`Resumen Mensual`}</b>
              </Col>
              <Col md={1} >
                <Form.Group>
                    <select className="form-control" name="tempo" value={this.state.tempo} 
                        style={{fontWeight: "bold" }}
                        onChange={(e) => {
                                          this.poblarMeses(e.target.value,this.state.acti )
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
                                          this.poblarMeses(this.state.tempo,e.target.value)
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
              <Col xs={2}>
                <Form.Group>
                  <FormControl type="text" name="buscar" placeholder="Texto a filtrar" className="mr-sm-2" 
                          onChange={(e) => { this.setState({ filterGrilla: e.target.value })} } /> 
                </Form.Group>
              </Col>

              <Col xs={1}>
                <Button  variant='outline-warning' size='sm' onClick={() => {this.setState({ showhelp : true}) } } > 
                Ayuda
                </Button>
              </Col>
              <Col xs={1}>
    { this.state.meses.length > 0 &&
                  <Button variant='outline-success' size='sm' 
                          onClick={(e) => exportToCSV(this.state.expTitulo,this.state.expSubtit,this.state.expSql) } > 
                          <FaDownload /> Excel
                  </Button>
    }
              </Col>
            </Row>
            <Row>
              {/* ======= grila de meses izq ==========*/}
              <Col md={3}>
              <Table  bordered hover size="sm" id="data_table"  
                      style={{border: "2px solid #aaa"}} >
              <thead className="Grilla-header-primary">
                <tr>
                  <th>Mes</th>
                  <th>Ingreso</th>
                  <th>Egreso</th>
                  <th>Total</th>
                  <th>Ver</th>
                </tr>
                </thead>
                <tbody>
                {
                  this.state.fetchmeses && 'Cargando...'
                }
                {  this.state.meses.map((mes,i) => {
  
                      return (
                        <tr key={i}>
                          <td style={{textAlign: "center"}}>{mes.mes}</td>
                          <td style={{textAlign: "right"}}>{mes.ingreso}</td>
                          <td style={{textAlign: "right"}}>{mes.egreso}</td>
                          <td style={{textAlign: "right"}}>{mes.suma}</td>
                          <td>
                           <div style={{backgroundColor: "#6c757d", color:"white", textAlign: "center" }}
                                 onClick={() => this.poblarGrilla(mes)}>
                                <FaGlasses />
                            </div>
                          </td>
                        </tr> 
                      ) 
                    }) 
                  }  
                  </tbody>
                </Table>
              </Col>
              {/* ======= grila detalle derecha ==========*/}
              <Col md={9}>
              <Table striped bordered hover size="sm" id="data_table">
                <thead className="Grilla-header">
                <tr>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('movi_id')}>
                      #ID</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('actividad')}>
                      Actividad</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('cuen_deno')}>
                      Concepto</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('subc_deno')}>
                      SubConcepto</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('cpro_razon')}>
                      Proveedor</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('movi_fecha_f')}>
                      Fecha</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('movi_deno')}>
                      Denominación</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('ingreso')}>
                      Ingreso</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('egreso')}>
                      Egreso</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('movi_compro_tipo')}>
                      Tipo</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('movi_compro_nro')}>
                      Comprobante</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('movi_alta_f')}>
                      Alta</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('movi_baja_f')}>
                      Baja</Button>
                  </th>              
                  <th>Acciones</th>
                </tr>
                </thead>
                <tbody>
                {
                  this.state.fetchRegistros && 'Cargando...'
                }
                {
                  registrosFiltrados.map((regis, i) => {
                    return (
                      <tr key={i} style={{backgroundColor: regis.color_row}}>
                        <td style={{textAlign: "center"}}>{regis.movi_id}</td>
                        <td style={{textAlign: "left"}}>{regis.actividad}</td>
                        <td style={{textAlign: "left"}}>{regis.cuen_deno}</td>
                        <td style={{textAlign: "left"}}>{regis.subc_deno}</td>
                        <td style={{textAlign: "center"}}>{regis.cpro_razon}</td>
                        <td style={{textAlign: "center"}}>{regis.movi_fecha_f}</td>
                        <td style={{textAlign: "left"}}>{regis.movi_deno}</td>
                        <td style={{textAlign: "right", backgroundColor: regis.color}}>{regis.ingreso}</td>
                        <td style={{textAlign: "right", backgroundColor: regis.color}}>{regis.egreso}</td>
                        <td style={{textAlign: "left"}}>{regis.movi_compro_tipo}</td>
                        <td style={{textAlign: "center"}}>{regis.movi_compro_nro}</td>
                        <td style={{textAlign: "center"}}>{regis.movi_alta}</td>
                        <td style={{textAlign: "center"}}>{regis.movi_baja}</td>
                        <td style={{textAlign: "center"}}>{regis.movi_subc_id}</td>
                      </tr>  
                    ) 
                  }) 
                }
                </tbody>
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



      </div>
    );
  }
}

export default ActiResum;
