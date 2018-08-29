import React, { Component } from 'react';
import './styles/App.css';
import * as firebase from 'firebase';
import { RoomList } from "./components/RoomList.js";
import { MessageList } from "./components/MessageList.js";
import { User } from "./components/User.js";
import { ChatRoomParticipants } from "./components/ChatRoomParticipants.js";
import { Grid, Row, Col, Navbar } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';

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
    let userRef = firebase.database().ref("presence/Guest");
    const roomKey = room === "" ? "" : room.key;
    if (this.state.user !== null) {
      userRef = firebase.database().ref("presence/" + this.state.user.uid);
    }
    userRef.update({ currentRoom: roomKey });
  }

  settingUser(user) {
    this.setState({
      user: user
    });
  }

  render() {
    let messageList, currentUser, roomList, roomParticipants;
    if (this.state.user !== null) {
      currentUser = this.state.user.displayName;
    } else {
      currentUser = "Guest";
    }
    roomList = (
      <RoomList firebase={firebase} activeRoom={this.activeRoom} user={this.state.user} />
    );

    if (this.state.activeRoom) {
      messageList = (
        <MessageList firebase={firebase} activeRoom={this.state.activeRoom.key} user={this.state.user !== null ? this.state.user : "Guest"} />
      );
      roomParticipants = (
        <ChatRoomParticipants firebase={firebase} activeRoom={this.state.activeRoom.key} />
      );
    }

    return (
      <Grid fluid className="main">
        <Row className="show-grid main-row">
          <Col sm={3} xs={12} className="sidenav">
            <Navbar fluid>
              <Navbar.Header>
                <Navbar.Brand>
                  <h1 onClick={() => this.setState({ activeRoom: ""})}> CookieChat</h1>
                </Navbar.Brand>
                <Navbar.Toggle />
              </Navbar.Header>
              <Navbar.Collapse>
                <User firebase={firebase} settingUser={this.settingUser} welcome={currentUser} />
                <Col xs={12} className="room-section">
                  <h2 className="active-room">{this.state.activeRoom.title || "Select A Room"}</h2>
                    {roomParticipants}
                </Col>
                {roomList}
              </Navbar.Collapse>
            </Navbar>
          </Col>

          {messageList}

        </Row>      
      </Grid>
    );
  }
}

export default App;
