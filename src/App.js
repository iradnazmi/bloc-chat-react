import React, { Component } from 'react';
import './App.css';
import * as firebase from 'firebase';
import { RoomList } from "./components/RoomList.js";
import { MessageList } from "./components/MessageList.js";
import { User } from "./components/User.js";
import { ChatRoomParticipants } from "./components/ChatRoomParticipants.js";

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
      user: null,
    };
    this.activeRoom = this.activeRoom.bind(this);
    this.settingUser = this.settingUser.bind(this);
  }

  activeRoom(room) {
    this.setState({
      activeRoom: room
    });
    const userRef = firebase.database().ref("presence/" + this.state.user.uid);
    const roomKey = room === "" ? "" : room.key;
    userRef.update({ currentRoom: roomKey });
  }

  settingUser(user) {
    this.setState({
      user: user
    });
  }

  render() {
    let messageList;
    let currentUser;
    let roomList;
    let roomParticipants;
    if (this.state.user !== null) {
      roomList = (
        <RoomList firebase={firebase} activeRoom={this.activeRoom} user={this.state.user.email} />
      );
      currentUser = this.state.user.displayName;
    } else {
      currentUser = "Guest";
    }

    if (this.state.user !== null && this.state.activeRoom) {
      messageList = (
        <MessageList firebase={firebase} activeRoom={this.state.activeRoom.key} user={this.state.user.displayName} />
      );
      roomParticipants = (
        <ChatRoomParticipants firebase={firebase} activeRoom={this.state.activeRoom.key} user={this.state.user.displayName} />
      );
    }

    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title" onClick={() => this.setState({ activeRoom: ""})}> TeChat</h1>
          <h3 className="slogan">Talk to friends all across the globe about the latest in technology!</h3>
        </header>
        <div className="user-options">
          <User firebase={firebase} settingUser={this.settingUser} welcome={currentUser} />
        </div>
        <div className="member-list">
          <h2>{this.state.activeRoom.title || "Select A Room"}</h2>
          <div>
            {roomParticipants}
          </div>
          <div>{roomList}</div>
        </div>
        <div className="message-section">
          {messageList}
        </div>
      </div>
    );
  }
}

export default App;
