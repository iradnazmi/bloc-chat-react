import React, { Component } from 'react';

export class RoomList extends Component {
  constructor(props) {
    super(props);
      this.state = {
        creator: "",
        title: "",
        rooms: [],
        newName: ""
      };

      this.roomsRef = this.props.firebase.database().ref('rooms');
      this.createRoom = this.createRoom.bind(this);
      this.handleChange = this.handleChange.bind(this);
      this.updateRoom = this.updateRoom.bind(this);
      this.editRoomName = this.editRoomName.bind(this);
  }

  editRoomName(room) {
    const newRoomName = (
      <form onSubmit={this.updateRoom}>
        <input type="text" defaultValue={room.title} ref={(input) => this.input = input}/>
        <input type="submit" value="Update" />
        <button type="button" onClick={() => this.setState({ newName: "" })}>Cancel</button>
      </form>
    );
    return newRoomName;
  }

  updateRoom(e) {
    e.preventDefault();
    const updates = {[this.state.newName + "/title"]: this.input.value};
    this.roomsRef.update(updates);
    this.setState({ newName: "" });
  }

  deleteRoom(roomKey) {
    const fbRooms = this.props.firebase.database().ref("rooms/" + roomKey);
    fbRooms.remove();
    this.props.activeRoom("")
  }

  createRoom(e) {
    e.preventDefault();
    this.roomsRef.push({ title: this.state.title, creator: this.state.creator });
    this.setState({
      title: "",
      creator: ""
    });
  }

  handleChange(e) {
    e.preventDefault();
    this.setState({
      [e.target.name]: e.target.value,
      creator: this.props.user
    });
  }

  selectRoom(room) {
    this.props.activeRoom(room);
  }

  componentDidMount() {
    this.roomsRef.on('value', snapshot => {
      const roomChanges = [];
      snapshot.forEach((room) => {
        roomChanges.push({
          key: room.key,
          title: room.val().title,
          creator: room.val().creator
        });
      });
      this.setState({ rooms: roomChanges })
    });
  }

  render() {
    const chatRoomForm = (
      <form onSubmit={this.createRoom}>
        <input type="text" name="title" value={this.state.title} placeholder="Enter your room name" onChange={this.handleChange}/>
        <input type="submit" value="Create Chat Room"/>
      </form> );
    const roomList = this.state.rooms.map((room) =>
      <li key={room.key}>
        {this.state.newName === room.key ?
          this.editRoomName(room)
          :
          <div className="room-section">
            <h3 id="room-titles" onClick={(e) => this.selectRoom(room,e)}>{room.title}</h3>
            {this.props.user === room.creator ?
              <div>
                <button id="delete-room" onClick={(e) => this.deleteRoom(room.key)}>Delete</button>
                <button id="edit-name" onClick={() => this.setState({ newName: room.key })}>Edit</button>
              </div>
              :
              null
            }
          </div>
        }
      </li>
    );
    return(
      <div>
        <div> {chatRoomForm} </div>
        <ul> {roomList} </ul>
      </div>
    );
  }
}

export default RoomList;
