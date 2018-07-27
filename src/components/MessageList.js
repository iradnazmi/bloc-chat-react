import React, { Component } from 'react';

export class MessageList extends Component {
  constructor(props) {
    super(props);
      this.state = {
        messages: [],
        username: "",
        content: "",
        sentAt: "",
        newContent: "",
      };

      this.handleChange = this.handleChange.bind(this);
      this.createMessage = this.createMessage.bind(this);
      this.editMessage = this.editMessage.bind(this);
      this.updateMessage = this.updateMessage.bind(this);
      this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  deleteMessage(messageKey) {
    const fbMessages = this.props.firebase.database().ref("rooms/" + this.props.activeRoom + "/messages/" + messageKey);
    fbMessages.remove();
  }

  editMessage(message) {
    const edit = (
      <form onSubmit={this.updateMessage}>
        <input type="text" defaultValue={message.content} ref={(input) => this.input = input}/>
        <input type="submit" value="Update" />
        <button type="button" onClick={() => this.setState({ newContent: "" })}>Cancel</button>
      </form>
    );
    return edit;
  }

  updateMessage(e) {
    e.preventDefault();
    const messagesRef = this.props.firebase.database().ref("rooms/" + this.props.activeRoom + "/messages");
    const updates = {[this.state.newContent + "/content"]: this.input.value};
    messagesRef.update(updates);
    this.setState({ newContent: "" });
  }

  createMessage(e) {
    const messagesRef = this.props.firebase.database().ref("rooms/" + this.props.activeRoom + "/messages");
    const member = this.props.firebase.database().ref("rooms/" + this.props.activeRoom + "/members");
    e.preventDefault();
    messagesRef.orderByChild("username").equalTo(this.state.username).once("value", snapshot => {
      if (!snapshot.val()) {
        member.push({
          username: this.state.username,
          isTyping: false
        });
      }
    });
    messagesRef.push({
      username: this.state.username,
      content: this.state.content,
      sentAt: this.state.sentAt
    });
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
    });
  }

  handleKeyDown(e) {
    const member = this.props.firebase.database().ref("rooms/" + this.props.activeRoom + "/members");
    member.orderByChild("username").equalTo(this.props.user).once("value", snapshot => {
      if (snapshot.val()) {
        snapshot.forEach((item) => {
          const updates = { [item.key + "/isTyping"]: true };
          member.update(updates);
        });
      }
    });
    setTimeout(() => {
      member.orderByChild("username").equalTo(this.props.user).once("value", snapshot => {
        if (snapshot.val()) {
          snapshot.forEach((item) => {
            const updates = { [item.key + "/isTyping"]: false };
            member.update(updates);
          });
        }
      });
    }, 3500);
  }

  componentDidMount() {
    const messagesRef = this.props.firebase.database().ref("rooms/" + this.props.activeRoom + "/messages");
    messagesRef.on('value', snapshot => {
      const messageChanges = [];
      snapshot.forEach((message) => {
        messageChanges.push({
          key: message.key,
          username: message.val().username,
          content: message.val().content,
          sentAt: message.val().sentAt
        });
      });
      this.setState({ messages: messageChanges })
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.activeRoom !== this.props.activeRoom) {
      const messagesRef = this.props.firebase.database().ref("rooms/" + nextProps.activeRoom + "/messages");
      messagesRef.on('value', snapshot => {
        let messageChanges = [];
        snapshot.forEach((message) => {
          messageChanges.push({
            key: message.key,
            username: message.val().username,
            content: message.val().content,
            sentAt: message.val().sentAt
          });
        });
        this.setState({ messages: messageChanges })
      });
    }
  }

  render() {
    const messageBar = (
      <form onSubmit={this.createMessage}>
        <input type="text" value={this.state.content} placeholder="Enter your message" onChange={this.handleChange} onKeyDown={this.handleKeyDown}/>
        <input type="submit" value="Send"/>
      </form>
    );
    const messageList = (
      this.state.messages.map((message) =>
        <li key= {message.key}>
          <p>{message.sentAt} {message.username}</p>
          {(this.state.newContent === message.key) && (this.props.user === message.username) ?
            this.editMessage(message)
            :
            <div>
              <p>{message.content}</p>
            {this.props.user === message.username ?
              <div>
                <button onClick={() => this.setState({newContent: message.key})}>Edit</button>
                <button onClick={(e) => this.deleteMessage(message.key)}>Delete</button>
              </div>
              : null
            }
            </div>
          }
        </li>
      )
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
