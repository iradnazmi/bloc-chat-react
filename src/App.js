import React, { Component } from 'react';
import './App.css';
import * as firebase from 'firebase';
import { RoomList } from "./components/RoomList.js";
import { MessageList } from "./components/MessageList.js";
import { User } from "./components/User.js";

// Initialize Firebase
var config = {
  apiKey: "AIzaSyDWcY-4kK2oZJ1XWhxE6FxhkV8pz5zjihE",
  authDomain: "bloc-chat-9d041.firebaseapp.com",
  databaseURL: "https://bloc-chat-9d041.firebaseio.com",
  projectId: "bloc-chat-9d041",
  storageBucket: "bloc-chat-9d041.appspot.com",
  messagingSenderId: "516845922610"
};
firebase.initializeApp(config);

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeRoom: "",
      user: null
    };
    this.activeRoom = this.activeRoom.bind(this);
    this.settingUser = this.settingUser.bind(this);
  }

  activeRoom(room) {
    this.setState({ activeRoom: room });
  }

  settingUser(user) {
      this.setState({ user: user })
  }


  render() {
    const viewMessages = this.state.activeRoom;
    const theUser = !this.state.user === null ? this.state.user.displayName : "Guest";
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title"> TeChat</h1>
        </header>
        <div>
          <User firebase={firebase} settingUser={this.settingUser} welcome={theUser}/>
        </div>
        <div>
          <h2 className="room-option">{this.state.activeRoom.title || "Select A Room"}</h2>
          <RoomList className="listsection" firebase={firebase} activeRoom={this.activeRoom} />
          { viewMessages ?
            <MessageList firebase={firebase} activeRoom={this.state.activeRoom.key} user={this.state.user.displayName} />
            : null
          }
        </div>
      </div>
    );
  }
}

export default App;
