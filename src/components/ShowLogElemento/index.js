import React from 'react';
import { Toast  } from 'react-bootstrap';
import { URL_DB } from '../../constants';
import axios from 'axios';

class ShowLogElemento extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      ulog_clave    : props.ulog_clave,
      ulog_id_number: props.ulog_id_number,
      renglones:[],
    }; 
  }

  componentDidMount() {

    const sql = `${URL_DB}SEL_USUARIOS_LOG('${this.state.ulog_clave}',null,${this.state.ulog_id_number},null,null,null)`
    axios.get(sql)
      .then((response) => {
        this.setState({
          renglones: response.data[0]
        }) 
        console.log(this.state.renglones)
      })
      .catch((error) => console.log(error));
  }

  render() {    

      let locShowtoast = this.props.showtoast;
      const { handleShowToast } = this.props;

      return (
        <>
          <Toast show={locShowtoast} 
                  style={{ width: 900 }}
                  onClose={handleShowToast}>
            <Toast.Header>
              <strong >{`Detalle de cambios #ID:${this.state.ulog_id_number}`}</strong>
            </Toast.Header>
            <Toast.Body  style={{ backgroundColor: '#ffff99', textAlign:'left' }}>
            <thead />
            <tbody>
            {
                this.state.renglones.map((regis, ind) => {
                  return (
                    <tr key={ind} style={{ backgroundColor: regis.color_fila}} >
                    <td>{`#${regis.ulog_usua_id} ${regis.usu_apenom} : `}</td>
                    <td>{`${regis.ulog_fecha_hora} : `}</td>
                    <td>{regis.ulog_acciones}</td>
                  </tr>
                  ) 
                })                 
            }
            </tbody>

            </Toast.Body>
          </Toast>
        </>
      )  
  }
}

export default ShowLogElemento;

