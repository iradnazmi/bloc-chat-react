import React, { Component } from 'react';

export class User extends Component {
  constructor(props) {
    super(props);
    this.state = {
      adminStatus: false
    };
    this.signIn = this.signIn.bind(this);
    this.signOut = this.signOut.bind(this);
  }

  componentDidMount() {
    this.props.firebase.auth().onAuthStateChanged(user => {
      this.props.settingUser(user);
      const userOnline = this.props.firebase.database().ref(".info/connected");
      if (user) {
        const userRef = this.props.firebase.database().ref("presence/" + user.uid);
        userOnline.on("value", snapshot => {
          if (snapshot.val()) {
            userRef.update({
              username: user.displayName,
              userOnline: true
            })
            userRef.onDisconnect().update({
              userOnline: false,
              currentRoom: ""
            });
          }
        });
      }
    });
  }

  signIn() {
    const provider = new this.props.firebase.auth.GoogleAuthProvider();
    this.props.firebase.auth().signInWithPopup(provider).then(result => {
      const user = result.user;
      this.props.settingUser(user);
    });
  }

  signOut() {
    this.props.firebase.auth().onAuthStateChanged(user => {
      const userRef = this.props.firebase.database().ref("presence/" + user.uid);
      userRef.update({ userOnline: false, currentRoom: "" });
    });
    this.props.firebase.auth().signOut().then(() => {
      this.props.settingUser("Guest");
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
