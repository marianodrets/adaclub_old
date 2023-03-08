import React from 'react';
import { URL_DB } from './../../constants';
import axios from 'axios';
import { Table, Row, Col, Container, Button, Form, FormControl } from 'react-bootstrap';
import exportToCSV from '../../utils/functions/export-excel';
import { FaDownload } from "react-icons/fa";
import ordenarGrilla from './../../utils/functions/ordenar-grilla'
import '../../pages/stylePages.css';

class CobranzaRepo extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      lee_mod : props.lee_mod,
      acti  : '',

      registros: [],
      actividades: [],
      login_id: sessionStorage.getItem('USUA_ID'),

      filterGrilla: '',
      fetchRegistros: false,
      expSql : '',
      expTitulo:'Reporte de Deudores',
      expSubtit: '',
      respuestaSp: [],
      respError: '',
      mensajeAlerta: '',
    };

  }

  componentDidMount() {

    const sql = `${URL_DB}SEL_ACTI_TEMPO_DD_ACTIVIDADES(0)`
    axios.get(sql)
    .then((response) => {
      this.setState({
        actividades: response.data[0]
      });    
    })
    .catch((error) => console.log(error));
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
  poblarGrilla = (p_opc) => {

    this.setState({acti: p_opc, 
                  registros: [],
                  fetchRegistros: true,});
     
    const sql = `${URL_DB}SEL_COBRANZA_DEUDORES('${p_opc}')`
    axios.get(sql)
    .then((response) => {
      this.setState({
        registros: response.data[0],
        expSql: sql,
        expSubtit: this.state.actividades.find(f => f.acti_acti===this.state.acti).acti_deno
      })
    })
    .catch((error) => console.log(error))
    .finally(() => {
      this.setState({ fetchRegistros: false })
    })

  }

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
                <b>Reporte Deudores</b>
            </Col>
            <Col xs={4}>
                <Form.Group>
                <select className="form-control" name="acti" value={this.state.acti} 
                        style={{fontWeight: "bold" }}
                        onChange={(e) => {
                                          this.poblarGrilla(e.target.value)
                                          }} >
                        { this.state.acti==='' &&  // Cuando esta vacio ponemos un reg de 'Seleccion' para que haga el change
                                      <option key={'0'} value={''} disabled >( Seleccione reporte )</option>
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
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('soci_codi')}>
                      #Socio</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('soci_ingre_f')}>
                      Ingreso</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('apenom')}>
                      Apellido y Nombre</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('edad')}>
                      Edad</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('categ')}>
                      Categoria</Button>
                  </th>
{ this.state.acti ==='0' &&
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('ult_mes_cuota')}>
                      Ult.cuota paga</Button>
                  </th>
}
{ this.state.acti !=='0' &&
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('ult_mes_cuota')}>
                      Cuota Impaga</Button>
                  </th>
}
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('meses_deu')}>
                      Meses deuda</Button>
                  </th>
 { this.state.acti !=='0' &&
                    <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('meses_deu')}>
                    Ult.Club</Button>
                    </th>
 }   
  { this.state.acti !=='0' &&
                    <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('meses_deu')}>
                    Meses Club</Button>
                    </th>
 }                 
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
                        <td style={{textAlign:"center"}}>{regis.soci_codi}</td>
                        <td style={{textAlign:"center"}}>{regis.soci_ingre_f}</td>
                        <td>{regis.apenom}</td>
                        <td style={{textAlign:"center"}}>{regis.edad}</td>
                        <td>{regis.categ}</td>
                        <td style={{backgroundColor:regis.color_deu}}>
                            {regis.ult_mes_cuota}</td>
                        <td style={{textAlign:"center"}}>{regis.meses_deu}</td>

                        <td style={{backgroundColor:regis.color_deu_2}}>
                            {regis.ult_mes_cuota_2}</td>
                        <td style={{textAlign:"center"}}>{regis.meses_deu_2}</td>
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

export default CobranzaRepo;
