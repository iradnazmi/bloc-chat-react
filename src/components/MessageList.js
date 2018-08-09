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
    const fbMessages = this.props.firebase.database().ref("messages/" + this.props.activeRoom + "/" + messageKey);
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
    const messagesRef = this.props.firebase.database().ref("messages/" + this.props.activeRoom);
    const updates = {[this.state.newContent + "/content"]: this.input.value};
    messagesRef.update(updates);
    this.setState({ newContent: "" });
  }

  createMessage(e) {
    const messagesRef = this.props.firebase.database().ref("messages/" + this.props.activeRoom);
    e.preventDefault();
    if (this.props.user === "Guest") {
      messagesRef.push({
        username: this.props.user,
        content: this.state.content,
        sentAt: this.state.sentAt
      });
    } else {
      messagesRef.push({
        username: this.props.user.displayName,
        content: this.state.content,
        sentAt: this.state.sentAt
      })
    }
    this.setState({
      username: "",
      content: "",
      sentAt: "",
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
    const userRef = this.props.firebase.database().ref("presence/" + this.props.user.uid);
    userRef.update({ isTyping: true });
    setTimeout(() => {
      userRef.update({ isTyping: false });
    }, 2000);
  }

  componentDidMount() {
    this._ismounted = true;
    const messagesRef = this.props.firebase.database().ref("messages/" + this.props.activeRoom);
    messagesRef.on('value', snapshot => {
      const messageChanges = [];
      snapshot.forEach((message) => {
        messageChanges.push({
          username: message.val().username,
          content: message.val().content,
          sentAt: message.val().sentAt,
          key: message.key
        });
      });
      this.setState({ messages: messageChanges });
      this.newMessage.scrollIntoView();
    });
  }

  componentDidUpdate() {
    this.newMessage.scrollIntoView();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.activeRoom !== this.props.activeRoom) {
      const messagesRef = this.props.firebase.database().ref("messages/" + nextProps.activeRoom);
      messagesRef.on('value', snapshot => {
        let messageChanges = [];
        snapshot.forEach((message) => {
          messageChanges.push({
            username: message.val().username,
            content: message.val().content,
            sentAt: message.val().sentAt,
            key: message.key
          });
        });
        this.setState({ messages: messageChanges });
        this.newMessage.scrollIntoView();
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
          <p>({message.sentAt}) {message.username}</p>
          {(this.state.newContent === message.key) && (this.props.user.displayName === message.username) ?
            this.editMessage(message)
            :
            <div>
              <p>{message.content}</p>
            {this.props.user.displayName === message.username ?
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
        <ul className="messages">{messageList}</ul>
        <div className="enter-message">{messageBar}</div>
        <div ref={(newMessage) => this.newMessage = newMessage} />
      </div>
    );
  }
}

export default MessageList;
