import React from 'react';
import { URL_DBQUERY } from '../../constants';
import axios from 'axios';
import Webcam from "react-webcam";
import { Row, Col, Button } from 'react-bootstrap';

//ver este video
//https://www.youtube.com/watch?v=Ci2VOmQdeBY

export default class WebcamCapture extends React.Component {
    setRef = Webcam => {
        this.Webcam = Webcam
    }
    
    constructor(props) {
        super(props);

        this.state={
            alta_usua: props.alta_usua,
            soci_codi: props.soci_codi,
            imagenFoto: null,
            tengoFoto: false 
        }
    }

    foto=()=>{
        var captura=this.Webcam.getScreenshot();
        console.log(captura)
        this.setState({ imagenFoto:captura, tengoFoto: true })
    }

    grabaFoto=()=>{
        var body = {} //new Object();
        body.soci_codi = this.state.soci_codi;
        body.alta_usua = this.state.alta_usua;
        body.imagen  = this.state.imagenFoto;
        
        const sql = `${URL_DBQUERY}/putFotSoc/`
        axios.post(sql, body )
        .then((response) => {
            //var obj = this.state.respuestaSp[0];
            console.log(response.data[0])
            this.props.onSubmitFunction(true) // acepto y subo señar para cerrar la modal
          })
          .catch((error) => {
            alert('ERROR interno API al actualizar BD:'+error)
          })

    }

    render(){
        return (
            <div>
             
                <Row>
                    {/* panel izquierdo, camara web  */}
                    <Col md={6}>
                        <Row>
                            <Col>
                            <Webcam audio={false} 
                                width={220}
                                height={200}
                                ref={this.setRef}
                                screenshotFormat="image/jpeg"
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                            <Button variant="primary" size="sm" onClick={this.foto}>
                                Tomar Foto
                            </Button>
                            </Col>
                        </Row>
                    </Col>
                    {/* panel derecho, foto a subir  */}
                    <Col md={6}>
                        <Row>
                            <Col>
                            <div style={{paddingTop:"15px"}} >
                            <img src={this.state.imagenFoto} 
                                    width={220}
                                    height={170}
                                    alt="" />
                            </div>
                            </Col>
                        </Row>
                        <br />
                        <Row>
                            <Col>
                            <Button variant="success" size="sm" 
                                    onClick={this.grabaFoto} 
                                    disabled={!this.state.tengoFoto} >
                                Grabar esta foto en Socio
                            </Button>
                            </Col>
                        </Row>
                    </Col>
                </Row>
             
            </div>
        )
    }
}

