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
        currentRoomMessages: []
      };

      this.messagesRef = this.props.firebase.database().ref('messages');
      this.handleChange = this.handleChange.bind(this);
      this.createMessage = this.createMessage.bind(this);
      this.formatMsToHr = this.formatMsToHr.bind(this);
      this.deleteMessage = this.deleteMessage.bind(this);
  }

  componentDidMount() {
    this.messagesRef.on('child_added', snapshot => {
      const message = snapshot.val();
      message.key = snapshot.key;
      this.setState({ messages: this.state.messages.concat(message) })
    });
  }

  deleteMessage(messageKey) {
    const newMessageList = this.state.messages.filter((e) => {
      return e.key !== messageKey;
    });
    this.setState({
      messages: newMessageList,
      currentRoomMessages: newMessageList
    });
    this.messagesRef.child(messageKey).remove();
  }

  updateMessages(curRoomId) {
    const currentMessages = this.state.messages.filter((e) => {
      return e.roomId === curRoomId;
    });
    this.setState({ currentRoomMessages: currentMessages })
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

  formatMsToHr(ms) {
    var hours = parseInt((ms / (1000*60*60)) % 24);
    var minutes = parseInt((ms / (1000*60)) % 60);
    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes: minutes;
    if (hours > 12) {
      hours = hours - 12;
      return hours + ":" + minutes + "PM";
    } else {
      return hours + ":" + minutes + "AM";
    }
  }

  handleChange(e) {
    e.preventDefault();
    var timestamp = new Date().toLocaleTimeString('en-US', { hour: 'numeric', hour12: true, minute: 'numeric' });
    this.setState({
      username: this.props.user,
      content: e.target.value,
      sentAt: timestamp,
      roomId: this.props.activeRoom
    })
  }

  componentWillUnmount() {
    this.messagesRef.off('child_added', snapshot => {
      const message = snapshot.val();
      message.key = snapshot.key;
      this.setState({ messages: this.state.messages.concat(message) })
    });
  }

  render() {
    const activeRoom = this.props.activeRoom;
    const messageBar = (
      <form onSubmit={this.createMessage}>
        <input type="text" value={this.state.content} placeholder="Enter your message" onChange={this.handleChange}/>
        <input type="submit" value="Send"/>
      </form>
    );
    const messageList =(
      this.state.messages.map((message) => {
        if (message.roomId === activeRoom) {
          return <li key={message.key}>
                   {message.sentAt} - {message.username}: {message.content}
                    <button id="delete-message" onClick={null}>Delete Message</button>
                 </li>
        }
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
