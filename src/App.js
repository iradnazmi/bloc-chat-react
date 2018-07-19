import React, { Component } from 'react';
import './App.css';
import * as firebase from 'firebase';
import { RoomList } from "./components/RoomList.js";
import { MessageList } from "./components/MessageList.js";


<script src="https://www.gstatic.com/firebasejs/5.2.0/firebase.js"></script>
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
      activeRoom: ''
    };
    this.activeRoom = this.activeRoom.bind(this);
  }

  activeRoom(room) {
    this.setState({ activeRoom: room });
  }

  render() {
    const viewMessages = this.state.activeRoom;
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Bloc Chat</h1>
        </header>
        <div>
          <h2>{this.state.activeRoom.title || "Select A Room"}</h2>
          <RoomList firebase={firebase} activeRoom={this.activeRoom} />
          { viewMessages ?
            (<MessageList firebase={firebase} activeRoom={this.state.activeRoom.key}/>)
            : (null)
          }
        </div>
      </div>
    );
  }
}

export default App;
