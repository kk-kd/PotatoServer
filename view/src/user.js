import React from "react"
import $ from 'jquery'; 
import {get, post} from './utility.js'

export class UserList extends React.Component {
    constructor(props) {
      super(props);
  
      this.state = {person: []};
    }

    componentDidMount() {
      this.UserList();
    }

    UserList() {
      $.getJSON('localhost:3000/Users/13')
        .then(({ results }) => this.setState({ person: results }));
    }

    render() {
      const persons = this.state.person.map((item, i) => (
        <div>
          <h1>{ item.name.first }</h1>
          <span>{ item.cell }, { item.email }</span>
        </div>
      ));

      return (
        <div>
            <h1>Simple Back End Call below:</h1>
          <div>{ persons }</div>
        </div>
      );
    }
  }