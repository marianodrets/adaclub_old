import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
    background-color: ${props => props.mensajeColor};
    color: white;
    padding: 16px;
    position: absolute;
    top: ${props => props.top}px;
    right: 16px;    
    z-index: 999;
    transition: top0.5s ease;

    > i {
        margin-left: 8px
    }
`;

export default class Notifications extends React.Component {

    constructor(props){
        super(props);

        this.state = {
            top: -100,
            mensaje: props.mensaje, 
            mensajeColor : props.mensajeColor,
        };

        this.timeout = null;
    }

    componentDidMount() {
        this.onShow()
      }
    
    onShow = () => {

        //this.setState({mensajeColor : "#444"});

        if (this.timeout) {
            clearTimeout(this.timeout)
            this.setState({ top: -100}, () => {
                this.timeout = setTimeout(() => {
                    this.showNotification();
                }, 500);
            })
        } else {
            this.showNotification();
        }

    }

    showNotification = () => {
        this.setState({
            top: 16,
        }, () => {
            this.timeout = setTimeout(() => {
                this.setState({
                    top: -100
                })
            }, 3000);
        })
    }

    render(){
        return(
            <Container top={this.state.top} 
                     mensajeColor={this.state.mensajeColor.length >2 ? this.state.mensajeColor : "#444"}> 
                {this.state.mensaje} <i className="fas fa-bell"></i>
            </Container>
        );
    }
}