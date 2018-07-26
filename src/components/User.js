import React, { Component } from 'react';

export class User extends Component {
  constructor(props) {
    super(props);
    this.state = {
      signedIn: false,
      adminStatus: false
    };
    this.signIn = this.signIn.bind(this);
    this.signOut = this.signOut.bind(this);
  }

  componentDidMount() {
    this.props.firebase.auth().onAuthStateChanged(user => {
      this.props.settingUser(user);
    });
  }

  signIn() {
    const provider = new this.props.firebase.auth.GoogleAuthProvider();
    this.props.firebase.auth().signInWithPopup(provider).then(result => {
      const user = result.user;
      this.props.settingUser(user);
      this.setState({ signedIn: !this.state.signedIn });
    });
  }

  signOut() {
    this.props.firebase.auth().signOut().then(() => {
      this.props.settingUser("Guest");
      this.setState({ signedIn: !this.state.signedIn });
    });
  }

  createAdmin() {
    this.setState({ adminStatus: true });
  }

  render() {
    return (
      <div className="login-button">
        <h3>Welcome, {this.props.welcome}</h3>
        { this.props.welcome === "Guest" ?
          <button id="logIn" onClick={this.signIn}>Log In</button>
          :
          <button id="logOut" onClick={this.signOut}>Log Out</button>
        }
      </div>
    )
  }
}

export default User;
