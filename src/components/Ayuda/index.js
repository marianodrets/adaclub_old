import React from 'react';
import { Button, Modal, Row, Col } from 'react-bootstrap';
import hlp_adaclub_flow_cuotas from './../../assets/images/hlp_adaclub_flow_cuotas.jpg';
import hlp_adaclub_arma_tempo from './../../assets/images/hlp_adaclub_arma_tempo.jpg';
import hlp_adaclub_arma_tempo_agrega from './../../assets/images/hlp_adaclub_arma_tempo_agrega.jpg';
//import hlp_ergoapp_rutina from './../../assets/images/hlp_ergoapp_rutina.jpg';
//import ergoApp_logo from './../../assets/images/ErgoApp_Logo.jpg';
import { NOMBRE_SIST } from '../../constants';


class Ayuda extends React.Component {
    constructor(props) {
      super(props);

      this.state = {
        clave : props.clave, 
        imagen : '',
        imagen_sec : '',
        clave_ant : '',
        clave_prx : '',
        html_help : '',
      }; 
     
    }


    select_tema = (a_clave) => {

        this.setState({ clave : a_clave }) ;

        if (a_clave==='cuotas-socios') {
            this.setState({ titulo : `Funcionamiento cuotas cobradas de ${NOMBRE_SIST}`,
                            imagen : hlp_adaclub_flow_cuotas,
                            imagen_sec : '',
                            clave_ant : '',
                            clave_prx : 'config-actividad',
                            html_help : `
            Política de cobro de cuotas :
            <ul>
            <li><b>Cuota Social:</b> La cuota social es contínua y se cobra todos los meses aunque el socio no asista</li>
            <li><b>Cuota de actividad:</b> El profesor genera las cuotas que caja luego cobrará al socio. Esta asi diseñado para evitar mensajes a caja confusos</li>
            </ul>
            
            <b>Flexibilidad al definir cuota de actividad:</b><br>
            - Puede definir categorias: Para admin/definir valor de cuota. (Ej: Infantil/ Cadete/ Mayor/ Mayor_12 ) <br>
            - Genera Temporada: Armado de lista de socios, definiendo que mes se le cobrará, (Ej: el alumno entra a mitad de mes, o quiere unos dias de prueba, o se lesionó en un partido y no puede entrenar por dos meses, en enero no se entrena, etc)<br>
            - Se puede bonificar la cuota de actividad: Si por ejemplo son 3 hermanos, se les puede cobrar el 50% a los 3. 0% es bonificación total<br>
            
            Tener en cuenta:
            <ul>
            <li><b>Administración:</b>Maneja y modifica todos los valores a pedido del profesor.</li>
            <li><b>Administración:</b>Configura a la actividad como "arancelada"</li>
            <li><b>Caja:</b>Cobra todas las cuotas al socio en un solo recibo </li>
            <li><b>Profesor:</b>Solicita a Caja la liquidacion de sus honorarios</li>
            </ul>
        
            `});
        }

        if (a_clave==='config-actividad') {
            this.setState({ titulo : `Profesor Configura Actividad en ${NOMBRE_SIST}`,
            imagen : hlp_adaclub_arma_tempo_agrega,
            imagen_sec : hlp_adaclub_arma_tempo,
            clave_ant : 'cuotas-socios',
            clave_prx : '*',
            html_help : `
            Administración de alumnos para el profesor :
            <ul>
            <li><b>Categorias:</b> Se puede diferenciar el valor de cuota por rangos de edad (Infantil/Cadete/etc.), ó bien una categ Unica.</li>
            <li><b>Valor de Cuotas:</b> Tanto las categ como los valores se acuerdan con el club y la administración de este coloca el valor actual.</li>
            <li><b>Armado de temporada:</b> El profesor genera la lista de sus alumnos, puede incluir de a un alumno. Inicialmente puede cargar los socios que se inscribieron para ese deporte, o bien copiar la temporada anterior.</li>     
            <li><b>Visualiz de cuotas pagadas:</b> Si el alumno pagó la cuota, se verá en verde con el dedo en OK,y ya no se podrá des-clickear.</li>
            </ul>        
`});


        }

    }
        

    

    componentDidMount() {
        this.select_tema(this.state.clave)
    }

    render() {

        return (
           
            <div>
            <Modal.Header closeButton>
            <Modal.Title>Ayuda : {this.state.titulo}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Row>
                    <Col xs={3}>
                        <img  style={{ width: '100%' }} 
                                src={this.state.imagen} 
                                alt={'imagen_hlp'} />
                    </Col>
                    <Col xs={9}>
                        <Row>
                            <Col>
                                <div className="note-body"
                                    dangerouslySetInnerHTML={{__html: this.state.html_help }}>
                                </div>
                            </Col>
                        </Row>
                    {this.state.imagen_sec!=='' &&
                        <Row>
                            <Col>
                                <img  style={{ width: '80%' }} 
                                    src={this.state.imagen_sec} 
                                    alt={'imagen_sec_hlp'} />
                            </Col>
                        </Row>
                    }
                    </Col>
                </Row>

                <Button variant={'secondary'} size="sm" 
                        onClick={(e)=>{ this.select_tema('*') }}> 
                   <i className="fas fa-info"></i> Gral
                </Button>
                <Button variant={'warning'} size="sm" 
                        onClick={(e)=>{ this.select_tema(this.state.clave_ant) }}> 
                     <i className="fas fa-hand-point-left"></i> Anterior
                </Button>
                <Button variant={'warning'} size="sm" 
                        onClick={(e)=>{ this.select_tema(this.state.clave_prx) }}> 
                    Próxima <i className="fas fa-hand-point-right"></i>
                </Button>
            </Modal.Body>    


            </div>
  

        )
    }
}

export default Ayuda;

