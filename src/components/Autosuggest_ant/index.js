import React from 'react';
import { URL_DB } from './../../constants';
import axios from 'axios';
import Autosuggest from 'react-autosuggest';


class AutosuggestsComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      data: [], 
      tabla: props.tabla,
      placeholder: props.placeholder,
      nicknameValue: props.denoValue,
      suggestion:null,
      nicknameSuggestions: [],
    };    

  this.escapeRegexCharacters = this.escapeRegexCharacters.bind(this);
  this.getSuggestions = this.getSuggestions.bind(this);
  this.getSuggestionNickname = this.getSuggestionNickname.bind(this);
  this.renderSuggestion = this.renderSuggestion.bind(this);
  }

  componentDidMount() {
    //this.setState({ fetchingregistros: true });
    const sql = `${URL_DB}SEL_AUTOSUGGEST('${this.state.tabla}')`
    axios.get(sql)
      .then((response) => {
        this.setState({
          data: response.data[0]
        })
      })
      .catch((error) => console.log(error))
  }

  onNicknameChange = (event, { newValue }) => {
    this.setState({
      nicknameValue: newValue
    });
  };
  
  onNicknameSuggestionsFetchRequested = ({ value }) => {
    this.setState({
      nicknameSuggestions: this.getSuggestions(value)
    });
  };

  onNicknameSuggestionsClearRequested = () => {
    this.setState({
      nicknameSuggestions: []
    });
  };

  onNicknameSuggestionSelected = (event, { suggestion }) => {
    this.setState({
      nicknameValue: suggestion.descripcion
    });
  };

  escapeRegexCharacters = (str) => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  
  getSuggestions = (value) => {
    const escapedValue = this.escapeRegexCharacters(value.trim());
    const regex = new RegExp(escapedValue, 'i');
    //const regex = new RegExp('^' + escapedValue, 'i'); esto es solo para lo que empiecen...
    //console.log(this.state.data);
    
    return this.state.data.filter(user => regex.test(user.descripcion));
  }
  
  getSuggestionNickname = (suggestion) => {
    this.props.onSubmitFunction(suggestion) 
    this.setState({suggestion});
    return (suggestion);
  }
  
  renderSuggestion = (suggestion) => {
    return (
      <span>{suggestion.descripcion}</span>
    );
  }

  render() {
    const { 
      placeholder,
      nicknameValue, 
      nicknameSuggestions
    } = this.state;

    const nicknameInputProps = {
      placeholder: placeholder,
      value: nicknameValue,
      onChange: this.onNicknameChange
    };
    
    return (
      <div className="container">
        <Autosuggest 
          suggestions={nicknameSuggestions}
          onSuggestionsFetchRequested={this.onNicknameSuggestionsFetchRequested}
          onSuggestionsClearRequested={this.onNicknameSuggestionsClearRequested}
          onSuggestionSelected={this.onNicknameSuggestionSelected}
          getSuggestionValue={this.getSuggestionNickname}
          renderSuggestion={this.renderSuggestion}
          inputProps={nicknameInputProps}
        />
      </div>
    );
  }
}
//AutosuggestsComponent.defaultProps = { data : []};


export default AutosuggestsComponent;
  
