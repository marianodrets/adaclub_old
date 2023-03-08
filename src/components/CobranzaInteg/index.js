import React  from 'react';
import { URL_DB, URL_DBQUERY, NOMBRE_SIST } from '../../constants';
import axios from 'axios';
import { Row, Col, Container, Table, Button, Form, Alert, Card, Modal } from 'react-bootstrap';
import Notifications from '../Notifications';
import Recibo from '../Recibo';
import {  FaTimes, FaCheck, FaRegEdit } from "react-icons/fa";
import Ayuda from '../../components/Ayuda';
import AutosuggestsComponent from '../Autosuggest/index.js';
import '../Autosuggest/autosuggest.css';
import '../../pages/stylePages.css';
import printJS from 'print-js';
import swal from 'sweetalert';

class CobranzaInteg extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      lee_mod : props.lee_mod,
      registros: [],
      filterGrilla:'',
      socio:[],
      mails:[],
      comporPago:[],
      login_id: sessionStorage.getItem('USUA_ID'),

      showModalEdit: false,
      soci_codi: '',
      apenom  : '', 
      soci_mail: '',
      soci_celular: '', 
      deu_soci_mail: '',

      autosuggestValue: '',
      showhelp: false,

      cuotas:[],
      total: 0,
  
      soci_baja_f:'',
      borrar:[1],
      showRecibo : false,
  
      respuestaSp: [],
      respError: '',
      mensajeAlerta: '',
    };
    
  }

  async getCuotas(a_socio) {

    this.setState({ fetchRegistros: true });
    const sql =  `${URL_DB}SEL_COBXCAJA_ACOBRAR_RS(${this.state.login_id},${a_socio},'N')`;
    axios.get(sql)
    .then((response) => {
      this.setState({
        cuotas: response.data[0]
      })
      if(this.state.cuotas.length>0){
        this.setState({ total : this.state.cuotas[0].total})
      }
    })      
    .catch((error) => console.log(error))
    .finally(() => {
      this.setState({ fetchRegistros: false })
    })
  }
 
  async getDatos(a_socio) {

    const sql = `${URL_DB}SEL_COBXCAJA_SHOWDATOS(${a_socio})`
    axios.get(sql)
    .then((response) => {
      this.setState({
        socio: response.data[0],
        mails: response.data[0].filter((e)=>{return e.soci_mail!==null})
      },() => {
        this.setState({
          deu_soci_mail: this.state.mails.length===0?'':this.state.mails[0].soci_mail,
        })
      })
    })
    .catch((error) => console.log(error));
  }
  
  async getComportam(a_socio) {

    const sql = `${URL_DB}SEL_SOCIOS_PAGO_COMPORTAM(${a_socio})`
    axios.get(sql)
    .then((response) => {
      this.setState({
        comporPago: response.data[0],
      })
    })
    .catch((error) => console.log(error));
  }

  async getSocio(a_socio) {
    try{
      await Promise.all([ this.getCuotas(a_socio), this.getDatos(a_socio), this.getComportam(a_socio) ])
    } catch(e) {
      console.log(e);
    } finally {

    }
  }


  componentDidMount = () => {
    //this.getInicio()
    //this.handleAlta()
  }

  handleChange = (event) => {
    const { target } = event;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;
    this.setState({
      [name]: value
    })
  }

  handleChangeCobra(a_si_no,i) {

    const cuotas = this.state.cuotas
    cuotas[i].si_no = a_si_no==='S'?'N':'S';
    
    let sum = 0;
    for (let i = 0; i < cuotas.length; i++) {
      if(cuotas[i].si_no==='S') { sum += Number(cuotas[i].valor);}
    }

    this.setState({
      cuotas: cuotas,
      total : sum 
    })
    
  }
 
  handleChangeSugg_soci_codi = (suggestion) => {

    this.setState({
      soci_codi: suggestion.codigo
    },()=>{  this.getSocio(this.state.soci_codi)  });

  };

  handleModalEdit(regis) {

    this.setState({
      showModalEdit: true,
      soci_codi:  regis.soci_codi,
      apenom  :   regis.apenom, 
      soci_mail:  regis.soci_mail===null?'':regis.soci_mail,
      soci_celular: regis.soci_celular===null?'':regis.soci_celular, 

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


  resetPantalla = () => {
      this.setState({ 
                  cuotas: [],
                  socio : [],
                  total : 0 
      }) 
  }
  /*==========================================================================
   Imprime y reset de pantala
  *==========================================================================*/
  printReciboActual = () => {
        
    this.setState({cuotas: [],
                  socio : [],
                  total : 0 ,
                  showRecibo : true
                  });
  }

  printForm = () => {
    printJS({ printable:"recibo",
            type:"html",
            targetStyles:['*'],
            header : 'Recibo oficial'

    })
  }

  enviarEmailsGrupo = () => {
 
    this.state.mails.forEach((elem) => {
      this.enviarEmailRecibo(elem.soci_mail);
    });

      
    
  }


 /*==========================================================================
   Envios de Mail : Deudas y Recibo
  *==========================================================================*/
   enviarEmailRecibo = (a_email) => {
  
    // mails a todo el grupo con email
    var node = document.getElementById("div_recibo")
    var htmlContent = node.innerHTML;

    axios.post(`${URL_DBQUERY}/sendMail/form`,{
      email  : a_email,
      asunto : 'Email enviado por el sistema',
      mensaje: `Le imprimimos un recibo oficial : `,
      sistema: NOMBRE_SIST,
      detalle : htmlContent
      })
      .catch((error) => {
        alert('ERROR interno API al enviar mail:'+error)
      })
      .finally(()=>{ 
        swal({ 
          title : `Recibo enviado`,
          text  : `al mail ${a_email}`
        });

    })
      
  }
  
   enviarEmailDeuda = () => {
    
    // me traigo la tabla de deuda y filtro solo la deuda (solo un mail)
    this.setState({ cuotas : this.state.cuotas.filter((e) => {return e.deuda==='S'})},
    ()=>{
      this.setState({ total : this.state.cuotas[0].total})
  
      var node = document.getElementById("tab_deuda")
      var htmlContent = node.innerHTML;

      axios.post(`${URL_DBQUERY}/sendMail/form`,{
        email  : this.state.deu_soci_mail,
        asunto : 'Email enviado por el sistema',
        mensaje: `Le informamos una deuda total de $${this.state.total}.-, y un detalle : `,
        sistema: NOMBRE_SIST,
        detalle : htmlContent
        })
        .catch((error) => {
          alert('ERROR interno API al enviar mail:'+error)
        })
        .finally(()=>{ 
            swal({ 
              title : `Resumen de deuda enviado`,
              text  : `al mail ${this.state.deu_soci_mail}`
            });
            this.resetPantalla()
        })
    });
  }

 /*==========================================================================
   Actualizacion : Emision del Recibo
  *==========================================================================*/
   handleGrabar = (event) => {
    event.preventDefault();

   var recibo_json = this.state.cuotas.filter(function(reg){
    return reg.si_no === 'S';
  })  
  .map((item) => { 
    var obj = {}
    obj.concep    = item.concep;
    obj.concep_acti= item.concep_acti;
    obj.acti_cate = item.acti_cate;
    obj.soci_codi = item.soci_codi;
    obj.sofa_grupo= item.sofa_grupo;
    obj.mes_f     = item.mes_f;
    obj.valor     = item.valor;
    obj.orden     = item.orden;
    return ( obj )
  })  


const sql =  `${URL_DB}A_COBXCAJA_GENERA_RECIBO(${this.state.login_id},${this.state.soci_codi},'${String(JSON.stringify(recibo_json))}')`;
    axios.get(sql)
    .then((response) => {
      this.setState({
        respuestaSp: response.data[0][0].respuesta,
        ret_reci_punto: response.data[0][0].reci_punto,
        ret_reci_reci : response.data[0][0].reci_reci
      },() => {             
          if (this.state.respuestaSp==='OK') {
              this.setState({
                  mensajeAlerta : 'Registrado correctamente',
                  mensajeColor  : 'green',
                  respError     : '',
              })
              this.printReciboActual();      
          } else {
              this.setState({
                respError     : this.state.respuestaSp
              })    
          }    
      })
    })
    .catch((error) => {
        alert('ERROR interno API al actualizar BD:'+error)
    })

  }

  /* Modificacion de mail/celular */
  handleActuDatos = (event) => {
    event.preventDefault();

//call M_SOCIOS_MAIL_CELU(1,2050,'1154840444','marianodrets@gmail.com') 
const sql =  `${URL_DB}M_SOCIOS_MAIL_CELU(${this.state.login_id},${this.state.soci_codi},'${this.state.soci_celular}','${this.state.soci_mail}')`;
    axios.get(sql)
    .then((response) => {
      this.setState({
        respuestaSp: response.data[0][0].respuesta,
      },() => {             
          if (this.state.respuestaSp==='OK') {
              this.setState({
                  mensajeAlerta : 'Registrado correctamente',
                  mensajeColor  : 'green',
                  respError     : '',
                  showModalEdit : false,
              })
              this.getDatos(this.state.soci_codi);      
          } else {
              this.setState({
                respError     : this.state.respuestaSp
              })    
          }    
      })
    })
    .catch((error) => {
        alert('ERROR interno API al actualizar BD:'+error)
    })

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
            <Col md={2} style={{fontSize:"22px"}}>
                <b>{`Socio #${this.state.soci_codi}`}</b>
            </Col>
            <Col md={4} >
            <Form.Group>
            <AutosuggestsComponent  tabla={'socio'}
                                    placeholder={'Digite Apellido Socio a editar'} 
                                    denoValue={this.state.autosuggestValue}
                                    onSubmitFunction={this.handleChangeSugg_soci_codi}
                                  />
              </Form.Group>  
            </Col>
 
            <Col md={2}>
              <Button  variant='outline-warning' size='sm' onClick={() => {this.setState({ showhelp : true}) } } > 
              Ayuda
              </Button>
            </Col>
          </Row>
          <Row>
          </Row>
          <Row>
              <Col md={5} sm={12}>
              <Row>
                <Col>
                  <Card>
                  <Card.Header>Selecione items a cobrar:</Card.Header>
                  <Card.Body>
                  <Table  bordered hover size="sm" id="tab_deuda" name='tab_deuda'>
                  <thead />
                  <tbody>
                    {
                      this.state.fetchRegistros && 'Cargando...'
                    }
                    {  this.state.cuotas.map((cuo,i) => {
      
                          return (
                            <tr key={i}>
                              <td>{`#${cuo.soci_codi}`}</td>
                              <td style={{backgroundColor: cuo.color_b}}>{cuo.mes_d}</td>
                              <td style={{backgroundColor: cuo.color_b}}>{cuo.concep_d}</td>
                              <td>{cuo.valor}</td>
                              <td style={{ width:'40px'}}>
                              <div onClick={() => this.handleChangeCobra(cuo.si_no, i)}
                                  style={{backgroundColor: cuo.si_no==='S'?"#1A73E8":"white",
                                          color: cuo.si_no==='S'?"white":"black",
                                          textAlign :"center", cursor: "pointer" }} >
                                { cuo.si_no === 'S' && <FaCheck /> }
                                { cuo.si_no === 'N' && <FaTimes /> }
                              </div>
                              </td>
                            </tr> 
                          ) 
                        }) 
                      }  
                      </tbody>
                    </Table>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
              <Row>   
                <Col md={5} style={{textAlign:"right"}}>
      { this.state.mails.length>0 && this.state.total>0 &&   
                  <Button variant="info" size="sm" 
                          onClick={this.enviarEmailDeuda}>
                      Enviar Deuda al Mail :</Button>
      }
      { this.state.mails.length===0 && this.state.soci_codi!=='' &&
          <p style={{ color:"red", fontStyle:"italic"  }}>No hay Mails cargados</p>
      }
                </Col>
     
                <Col md={7}>
      { this.state.mails.length>0 && this.state.total>0 &&    
                <select className="form-control" name="deu_soci_mail" value={this.state.deu_soci_mail} 
                        onChange={this.handleChange} >
                        { this.state.mails.map((em,i) => { 
                            return (
                                    <option key={i} 
                                            value={em.soci_mail}> {em.soci_mail}
                                    </option>
                                    ) 
                          }) }

                    </select>
        }
                    </Col>
              </Row>
              </Col>
              <Col md={7} sm={12}>
                <Row>
                <Card>
                <Card.Header>Total a imputar</Card.Header>
                <Card.Body>
                <Row>
                  <Col style={{fontSize: "30px", textAlign :"center" }} >
                    {`$ ${this.state.total}`}
                  </Col>
                </Row>
                <Row>
                  <br ></br>
                </Row>
                <Row>
                  <Col>
                  <Table  bordered hover size="sm" id="data_table">
                  <thead>
                    <tr>
                      <th>#Soc</th>
                      <th>Cat</th>
                      <th>Apellido y nombre</th>
                      <th>Mail</th>
                      <th>Celular</th>
                      <th>Baja</th>
                    </tr>
                  </thead>
                  <tbody>
                  {  this.state.socio.map((dat,i) => {
                        return (
                          <tr key={i}>
                            <td>{dat.soci_codi}</td>
                            <td style={{backgroundColor: dat.cate_color}}>{dat.cate_deno}</td>
                            <td>{dat.apenom}</td>   
                            <td>{dat.soci_mail}</td>
                            <td>{dat.soci_celular}</td>
                            <td style={{backgroundColor: dat.color_baja}}>{dat.baja}</td>
                            <td>
            { this.state.lee_mod==='M' &&                   
                        <Button variant="primary" size="sm" onClick={() => this.handleModalEdit(dat)}>
                                <FaRegEdit />
                        </Button>
            }
                            </td>
                          </tr>
                        ) 
                      }) 
                  }  
                  </tbody>
                  </Table>
                  </Col>
                </Row>
                <Row>
                  <Col md={4}>  
                  </Col>
                  <Col xs={8}>
  { this.state.cuotas.length > 0 &&
          <>
            { this.state.lee_mod==='M' 
                ?    <Button variant="success" size="sm" onClick={this.handleGrabar}>
                      Generar Recibo</Button>
                :    <Button variant="outline-danger" size="sm" disabled>Solo Lectura</Button>
            }  
                      <Button variant="secondary" size="sm" 
                              onClick={this.resetPantalla}>
                        Cancelar</Button>
        </>
      }
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <Alert key="1" variant="danger" show={respError.length >3 ? true : false} >
                        {respError}</Alert>
                  </Col>
                </Row>
                </Card.Body>
                </Card>
                </Row>
                <br />
                <Row>
                {  this.state.comporPago.map((regCP,i) => {
                        return (
                          <Table style={{textAlign:"center"}}  border>
                          <thead />
                          <tbody>
                          <tr key={1} style={{backgroundColor:"#f2f2f2"}}>
                              <td>M.Cuota</td>
                              <td>{regCP.mes01}</td>
                              <td>{regCP.mes02}</td>
                              <td>{regCP.mes03}</td>
                              <td>{regCP.mes04}</td>
                              <td>{regCP.mes05}</td>
                              <td>{regCP.mes06}</td>
                          </tr>
                          <tr key={2}>
                              <td style={{backgroundColor:"#f2f2f2"}}>Mes Pago</td>
                              <td style={{backgroundColor:regCP.color01}}>{regCP.mespag01}</td>
                              <td style={{backgroundColor:regCP.color02}}>{regCP.mespag02}</td>
                              <td style={{backgroundColor:regCP.color03}}>{regCP.mespag03}</td>
                              <td style={{backgroundColor:regCP.color04}}>{regCP.mespag04}</td>
                              <td style={{backgroundColor:regCP.color05}}>{regCP.mespag05}</td>
                              <td style={{backgroundColor:regCP.color06}}>{regCP.mespag06}</td> 
                              </tr> 
                      </tbody>
                      </Table>
                        ) 
                      }) 
                  }  



                </Row>
              </Col>
            </Row>
          </Form>
         
        </Container>


        < Modal show={this.state.showRecibo}  onHide={() => { this.setState({ showRecibo : false}) } } 
                dialogClassName="modal-60">
          <Modal.Header closeButton>
          <Modal.Title>
              {`Recibo ${this.state.ret_reci_punto} - ${this.state.ret_reci_reci} Generado`}
          </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Row>
                <Col xs={3}>
                <Button variant="primary" size="sm" 
                        onClick={()=>{ this.printForm() }}>Imprimir Recibo</Button>   
                </Col>
                <Col xs={3}>
      { this.state.mails.length>0  &&   
                <Button variant="info" size="sm" 
                          onClick={this.enviarEmailsGrupo}>
                      Enviar Recibo al Mail</Button>
      }
      { this.state.mails.length===0 && 
          <p style={{ color:"red", fontStyle:"italic"  }}>No hay Mails cargados</p>
      }
                </Col>
                <Col xs={3}>
                <Button variant="secondary" size="sm" 
                        onClick={()=>{ this.setState({ showRecibo:false }) }}>Cerrar</Button>   
                </Col>
              </Row>
              <br />
              <Row>
                <Col>
                  <Recibo punto={this.state.ret_reci_punto}
                          reci={this.state.ret_reci_reci} 
                                  />
                </Col>
            </Row>
            </Form>
          </Modal.Body>
        </Modal>


        <Modal show={this.state.showModalEdit} onHide={this.handleModalExit} dialogClassName="modal-40" >
          <Modal.Header closeButton>
            <Modal.Title>
            {`Actualizar Mail/Celular de ${this.state.apenom}` }
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
                <Row> 
                  <Col md={8}> 
                    <Form.Group>
                      <Form.Label>E-mail</Form.Label>
                      <Form.Control type="text" name="soci_mail" value={this.state.soci_mail}
                                    onChange={this.handleChange} />
                    </Form.Group>
                  </Col>
                  <Col md={4}> 
                    <Form.Group>
                      <Form.Label>Celular</Form.Label>
                      <Form.Control type="number" name="soci_celular" value={this.state.soci_celular}
                                    onChange={this.handleChange} />
                    </Form.Group>
                  </Col>
                </Row>
                <br />
                <Row>
                    <Col>
                      <Button variant="success" size="sm" onClick={this.handleActuDatos}>
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


        < Modal show={this.state.showhelp} onHide={() => { this.setState({ showhelp : false}) } } dialogClassName="modal-90">
            <Ayuda clave={'cuotas-socios'}/>
        </Modal>


      </div>
    );
  }
}

export default CobranzaInteg;
