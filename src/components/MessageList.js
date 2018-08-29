import React, { Component } from 'react';
import { Col, FormGroup, InputGroup, FormControl, Button } from 'react-bootstrap';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import ".././styles/MessageList.css";

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
        <FormGroup>
          <InputGroup>
            <FormControl type="text" defaultValue={message.content} inputRef={(input) => this.input = input} />
              <InputGroup.Button>
                <Button type="submit" alt="update">Update</Button>
                <Button type="button" alt="cancel" onClick={() => this.setState({ newContent: "" })}>Cancel</Button>
              </InputGroup.Button>
          </InputGroup>
        </FormGroup>
      </form>
    );
    return edit;
  }

  updateMessage(e) {
    e.preventDefault();
    const messagesRef = this.props.firebase.database().ref("messages/" + this.props.activeRoom + "/" + this.state.newContent);
    const updates = {["/content"]: this.input.value};
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
        <FormGroup>
          <InputGroup>
            <FormControl type="text" value={this.state.content} placeholder="Enter your message" onChange={this.handleChange} onKeyDown={this.handleKeyDown}/>
            <InputGroup.Button>
              <Button type="submit">Send</Button>
            </InputGroup.Button>
          </InputGroup>
        </FormGroup>
      </form>
    );
    const messageList = this.state.messages.map((message) =>
        <CSSTransition key={message.key} classNames="message-transition" timeout={200}>
          <li className="message-item">
            <h4 className="msg-sent-at">({message.sentAt})</h4>
            <h4 className="msg-username">{message.username}</h4>
            {(this.state.newContent === message.key) && (this.props.user.displayName === message.username) ?
            this.editMessage(message)
            :
            <div>
              <p className="msg-content">{message.content}</p>
            {this.props.user.displayName === message.username ?
              <div>
                <button onClick={() => this.setState({newContent: message.key})}>Edit</button>
                <button onClick={(e) => this.deleteMessage(message.key)}>Delete</button>
              </div>
              : <div className="no-edit-msg" />
            }
            </div>
            }
          </li>
        </CSSTransition>
      );

    return (
      <Col sm={9} xs={12} className="message-section">
        <Col xs={12} className="message-list">
          <TransitionGroup component="ul">{messageList}</TransitionGroup>
          <div ref={(newMessage) => this.newMessage = newMessage} />
        </Col>
        <Col xs={12} className="message-bar">
          {messageBar}
        </Col>
      </Col>
    );
  }
}

export default MessageList;
