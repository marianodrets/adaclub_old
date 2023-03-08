import React, { useState } from 'react';
import { URL_DBQUERY } from '../../constants';
import axios from 'axios';
import Webcam from "react-webcam";

//ver este video
//https://www.youtube.com/watch?v=Ci2VOmQdeBY

const WebcamComponent = () => <Webcam />;

const videoConstraints = {
    width: 220,
    height: 200,
    facingMode: "user"
};

export const WebcamCapture = (a_alta_usua,a_soci_codi) => {

    const [image,setImage]=useState('');
    const webcamRef = React.useRef(null);

    
    const capture = React.useCallback(
        () => {
        const imageSrc = webcamRef.current.getScreenshot();
        setImage(imageSrc)



        var body = {} //new Object();
        body.soci_codi = 2050; //a_soci_codi;
        body.alta_usua = 1; //a_alta_usua;
        body.imagen  = imageSrc
        
        const sql = `${URL_DBQUERY}/putFotSoc/`
        axios.post(sql, body )
console.log(sql)
console.log(body)
        .then((response) => {
           /* this.setState({
                respuestaSp: response.data[0]
            }) */
    
            //var obj = this.state.respuestaSp[0];
            console.log(response.data[0])
           /* this.setState({
                respError : obj.respuesta
            }) */
          })
          .catch((error) => {
            alert('ERROR interno API al actualizar BD:'+error)
          })
  

        });


    return (
        <div className="webcam-container">
            <div className="webcam-img">

                {image === '' ? <Webcam
                    audio={false}
                    height={200}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    width={220}
                    videoConstraints={videoConstraints}
                /> : <img src={image} />}
            </div>
            <div>
                {image !== '' ?
                    <button onClick={(e) => {
                        e.preventDefault();
                        setImage('')
                    }}
                        className="webcam-btn">
                        Intentar denuevo</button> :
                    <button onClick={(e) => {
                        e.preventDefault();
                        capture();
                    }}
                        className="webcam-btn">Tomar Foto</button>
                }
            </div>
        </div>
    );
};

/*
export const WebcamCapture = (a_alta_usua,a_soci_codi) => {

    const [image,setImage]=useState('');
    const webcamRef = React.useRef(null);

    
    const capture = React.useCallback(
        () => {
        const imageSrc = webcamRef.current.getScreenshot();
        setImage(imageSrc)



        var body = {} //new Object();
        body.soci_codi = a_soci_codi;
        body.alta_usua = a_alta_usua;
        body.imagen  = imageSrc
        
        const sql = `${URL_DBQUERY}/putFotSoc/`
        axios.post(sql, body )
console.log(sql)
console.log(body)
        .then((response) => {

    
            //var obj = this.state.respuestaSp[0];
            console.log(response.data[0])

          })
          .catch((error) => {
            alert('ERROR interno API al actualizar BD:'+error)
          })
  

        });


    return (
        <div className="webcam-container">
            <div className="webcam-img">

                {image === '' ? <Webcam
                    audio={false}
                    height={200}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    width={220}
                    videoConstraints={videoConstraints}
                /> : <img src={image} />}
            </div>
            <div>
                {image !== '' ?
                    <button onClick={(e) => {
                        e.preventDefault();
                        setImage('')
                    }}
                        className="webcam-btn">
                        Intentar denuevo</button> :
                    <button onClick={(e) => {
                        e.preventDefault();
                        capture();
                    }}
                        className="webcam-btn">Tomar Foto</button>
                }
            </div>
        </div>
    );
};

*/