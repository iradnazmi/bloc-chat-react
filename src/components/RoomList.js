import React, { Component } from 'react';
import { Col, Navbar, DropdownButton, MenuItem, FormGroup, InputGroup, FormControl, Button } from 'react-bootstrap';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import ".././styles/RoomList.css";

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
      <div className="room-edit">
        <form onSubmit={this.updateRoom}>
          <FormGroup>
            <InputGroup>
              <FormControl type="text" defaultValue={room.title} inputRef={(input) => this.input = input} />
              <InputGroup.Button>
                <Button type="submit" alt="update">Update</Button>
                <Button type="button" alt="cancel" onClick={() => this.setState({ newName: "" })}>Cancel</Button>
              </InputGroup.Button>
            </InputGroup>
          </FormGroup>
        </form>
      </div>
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
    const fbRoomMessages = this.props.firebase.database().ref("messages/" + roomKey)
    fbRooms.remove();
    fbRoomMessages.remove();
    this.props.activeRoom("")
  }

  createRoom(e) {
    e.preventDefault();
    if (this.props.user === "Guest") {
      this.roomsRef.push({ title: this.state.title, creator: "Guest"});
    } else {
      this.roomsRef.push({ title: this.state.title, creator: this.state.creator });
    }
    this.setState({
      title: "",
      creator: ""
    });
  }

  handleChange(e) {
    e.preventDefault();
    this.setState({
      [e.target.name]: e.target.value,
      creator: this.props.user.displayName
    });
  }

  selectRoom(room) {
    this.props.activeRoom(room);
  }

  componentDidMount() {
    this._ismounted = true;
    this.roomsRef.on('value', snapshot => {
      const roomChanges = [];
      snapshot.forEach((room) => {
        roomChanges.push({
          key: room.key,
          title: room.val().title,
          creator: room.val().creator
        });
      });
      this.setState({ rooms: roomChanges });
    });
  }

  render() {
    const userDisplay = this.props.user === null ? "Guest" : this.props.user.displayName;
    const chatRoomForm = (
      <form onSubmit={this.createRoom}>
        <FormGroup>
          <InputGroup>
            <FormControl type="text" name="title" value={this.state.title} placeholder="Enter your room name" onChange={this.handleChange} />
            <InputGroup.Button>
              <Button type="submit">Create Chat Room</Button>
            </InputGroup.Button>
          </InputGroup>
        </FormGroup>
      </form>
    );

    const roomList = this.state.rooms.map((room) =>
      <CSSTransition key={room.key} classNames="room-transition" timeout={{ enter: 500, exit: 300 }}>
        <li className="room-list-item">
        {this.state.newName === room.key ?
          this.editRoomName(room)
          :
          <div className="room-block">
            <h3 id="room-title cursor-color-change" onClick={(e) => this.selectRoom(room,e)}>{room.title}</h3>
            {userDisplay === room.creator ?
              <DropdownButton
                title={<span className="fa fa-angle-double-down"></span>}
                id ="bg-nested-dropdown"
                className="room-options"
              >
                <MenuItem onClick={() => this.setState({ newName: room.key })}>Edit</MenuItem>
                <MenuItem onClick={(e) => this.deleteRoom(room.key)}>Delete</MenuItem>
              </DropdownButton>
              :
              <div className="no-options"></div>
            }
          </div>
        }
        </li>
      </CSSTransition>
    );

    return(
      <Col xs={12} className="room-list">
      {this.props.user !== null ?
        <Navbar.Form>{chatRoomForm}</Navbar.Form>
        :
        null
      }
        <TransitionGroup component="ul">
          {roomList}
        </TransitionGroup>
      </Col>
    );
  }
}

export default RoomList;
