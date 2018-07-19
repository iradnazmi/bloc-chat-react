import React, { Component } from 'react';

class RoomList extends Component {
  constructor(props) {
    super(props);
      this.state = {
        title: '',
        rooms: []
      };

    this.roomsRef = this.props.firebase.database().ref('rooms');
    this.createRoom = this.createRoom.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  createRoom(e) {
    this.roomsRef.push({ title: this.state.title });
  }

  handleChange(e) {
    this.setState({ title: e.target.value });
  }

  componentDidMount() {
    this.roomsRef.on('child_added', snapshot => {
      const room = snapshot.val();
      room.key = snapshot.key;
      this.setState({ rooms: this.state.rooms.concat( room ) })
    });
  }

  render() {
    const chatRoomForm =
      <form onSubmit={this.createRoom}>
        <input type="text" value={this.state.title} placeholder="Enter your room name" onChange={this.handleChange}/>
        <input type="submit" value="Create Chat Room"/>
      </form>
    const roomList = this.state.rooms.map((room) =>
      <li key={room.key}> {room.title} </li>
    );
    return(
      <div>
        <div> {chatRoomForm} </div>
        <ul> {roomList} </ul>
      </div>
    );
  }
}

export default RoomList
