import React  from 'react';
import { URL_DB } from '../../constants';
import axios from 'axios';
import Autosuggest from 'react-autosuggest';
import './autosuggest.css';


class AutosuggestsComponent extends React.Component {
    
constructor(props) {
  super(props);

  // Autosuggest is a controlled component.
  // This means that you need to provide an input value
  // and an onChange handler that updates this value (see below).
  // Suggestions also need to be provided to the Autosuggest,
  // and they are initially empty because the Autosuggest is closed.
  this.state = {
    tabla: props.tabla,
    placeholder: props.placeholder,
    value: props.denoValue,
    suggestion:'',
    suggestions: [],
    languages : [],
  };
}

componentDidMount() {
     
  //this.setState({ fetchingregistros: true });
  const sql = `${URL_DB}SEL_AUTOSUGGEST('${this.state.tabla}')`
  axios.get(sql)
    .then((response) => {
      this.setState({
        languages: response.data[0]
      })
    })
    .catch((error) => console.log(error))
}

// de cuando voy digitando en la caja autosuggest
onChange = (event, { newValue }) => {
  this.setState({
    value: newValue
  });
};

escapeRegexCharacters = (str) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Teach Autosuggest how to calculate suggestions for any given input value.
getSuggestions = value => {
 /*
  const inputValue = value.trim().toLowerCase();
  const inputLength = inputValue.length;

  return inputLength === 0 ? [] : this.state.languages.filter(lang =>
    lang.descripcion.toLowerCase().slice(0, inputLength) === inputValue
  );
  */
 
  const escapedValue = this.escapeRegexCharacters(value.trim());
  const regex = new RegExp(escapedValue, 'i');
  
  return this.state.languages.filter(user => regex.test(user.descripcion));
 
};

// When suggestion is clicked, Autosuggest needs to populate the input
// based on the clicked suggestion. Teach Autosuggest how to calculate the
// click en lista dev valor
getSuggestionValue = suggestion => {
  this.props.onSubmitFunction(suggestion) 
  this.setState({suggestion});
  return (suggestion.descripcion);
};

// Aca dibuja todas las opciopnes del combo
renderSuggestion = suggestion => {
  return(
  <div style={{backgroundColor:suggestion.color, padding:"2px"}}>
    {suggestion.descripcion}
  </div>
  )
};

// cada vez que digito armo opciones
onSuggestionsFetchRequested = ({ value }) => {
  this.setState({
    suggestions: this.getSuggestions(value)
  });
};

// Autosuggest will call this function every time you need to clear suggestions.
onSuggestionsClearRequested = () => {
  this.setState({
    suggestions: []
  });
};

render() {
  const { value, suggestions } = this.state;

  // Autosuggest will pass through all these props to the input.
  const inputProps = {
    placeholder: this.state.placeholder,
    value,
    onChange: this.onChange
  };

  // Finally, render it!
  return (
    <Autosuggest
      suggestions={suggestions}
      onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
      onSuggestionsClearRequested={this.onSuggestionsClearRequested}
      getSuggestionValue={this.getSuggestionValue}
      renderSuggestion={this.renderSuggestion}
      inputProps={inputProps}
    />
  );
}

}

export default AutosuggestsComponent;

  