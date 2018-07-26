import React, { Component } from 'react';

export class MessageList extends Component {
  constructor(props) {
    super(props);
      this.state = {
        messages: [],
        username: "",
        content: "",
        sentAt: "",
        roomId: "",
        newContent: "",
        display: []
      };

      this.messagesRef = this.props.firebase.database().ref("rooms/" + this.props.activeRoom + "/messages");
      this.handleChange = this.handleChange.bind(this);
      this.createMessage = this.createMessage.bind(this);
      this.editMessage = this.editMessage.bind(this);
      this.updateMessage = this.updateMessage.bind(this);
  }

  deleteMessage(messageKey) {
    console.log("Deleting Message");
    const fbMessages = this.props.firebase.database().ref("messages/" + messageKey);
    fbMessages.remove();
    console.log("Message Deleted")
  }

  editMessage(message) {
    const newMessageName = (
      <form onSubmit={this.updateMessage}>
        <input type="text" defaultValue={message.content} ref={(input) => this.input = input}/>
        <input type="submit" value="Update" />
        <button type="button" onClick={() => this.setState({ newContent: "" })}>Cancel</button>
      </form>
    );
    return newMessageName;
  }

  updateMessage(e) {
    e.preventDefault();
    const updates = { [this.state.newContent + "/content"]: this.input.value };
    this.messagesRef.update(updates);
    this.setState({ newContent:"" });
  }

  createMessage(e) {
    e.preventDefault();
    if (this.props.user === null) {
      this.messagesRef.push({
        username: "Guest",
        content: this.state.content,
        sentAt: this.state.sentAt,
        roomId: this.state.roomId
      });
    } else {
      this.messagesRef.push({
      username: this.props.user.displayName,
      content: this.state.content,
      sentAt: this.state.sentAt,
      roomId: this.state.roomId
      });
    }
    this.setState({
      username: "",
      content: "",
      sentAt: "",
      roomId: ""
    });
  }

  handleChange(e) {
    e.preventDefault();
    var timestamp = new Date().toLocaleTimeString('en-US', { hour: 'numeric', hour12: true, minute: 'numeric' });
    this.setState({
      username: this.props.user,
      content: e.target.value,
      sentAt: timestamp,
      roomId: this.props.activeRoom,
    })
  }

  componentDidMount() {
    this.messagesRef.on('value', snapshot => {
      const messageChanges = [];
      snapshot.forEach((message) => {
        messageChanges.push({
          key: message.key,
          username: message.val().username,
          content: message.val().content,
          sentAt: message.val().sentAt,
          roomId: message.val().roomId
        });
      });
      this.setState({ messages: messageChanges })
    });
  }
  //   this.messagesRef.on('child_added', snapshot  => {
  //      const message = snapshot.val();
  //      message.key = snapshot.key;
  //      this.setState({ messages: this.state.messages.concat(message) })
  //    });
  // }

  componentWillReceiveProps(nextProps) {
    if (nextProps.activeRoom !== this.props.activeRoom) {
      this.messagesRef.on('value', snapshot => {
        let messageChanges = [];
        snapshot.forEach((message) => {
          messageChanges.push({
            key: message.key,
            username: message.val().username,
            content: message.val().content,
            sentAt: message.val().sentAt,
            roomId: message.val().roomId
          });
        });
        this.setState({ messages: messageChanges })
      });
    }
  }

  render() {
    const selectedRoom = this.props.activeRoom;
    const messageBar = (
      <form onSubmit={this.createMessage}>
        <input type="text" value={this.state.content} placeholder="Enter your message" onChange={this.handleChange}/>
        <input type="submit" value="Send"/>
      </form>
    );
    const messageList =(
      this.state.messages.map((message) => {
        if (message.roomId === selectedRoom) {
          return <li key={message.key}>
            <div> {message.sentAt} {message.username}: </div>
            { (this.state.newContent === message.key) && (this.props.user === message.username) ?
              this.editMessage(message)
              :
              <div>{message.content}</div>
            }
            <button id="edit-message" onClick={() => this.setState({ newContent: message.key })}>Edit</button>
            <button id="delete-message" onClick={null} >Delete Message</button>
          </li>
        }
        return null;
      })
    );
    return (
      <div>
        <div>{messageBar}</div>
        <ul>{messageList}</ul>
      </div>
    );
  }
}

export default MessageList;
