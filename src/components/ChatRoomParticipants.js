import React, { Component } from 'react';
import ".././styles/ChatRoomParticipants.css";

export class ChatRoomParticipants extends Component {
  constructor(props) {
    super(props);
    this.state = {
      members: []
    }
  }

  componentDidMount() {
    this._ismounted = true;
    const userRef = this.props.firebase.database().ref("presence/");
    userRef.orderByChild("currentRoom").equalTo(this.props.activeRoom).on('value', snapshot => {
      const memberChanges = [];
      if (snapshot.val()) {
        snapshot.forEach((member) => {
          memberChanges.push({
            key: member.key,
            username: member.val().username,
            isTyping: member.val().isTyping,
            isOnline: member.val().isOnline
          });
        });
      }
      this.setState({ members: memberChanges });
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.activeRoom !== this.props.activeRoom) {
      const userRef = this.props.firebase.database().ref("presence/");
      userRef.orderByChild("currentRoom").equalTo(nextProps.activeRoom).on('value', snapshot => {
        const memberChanges = [];
        if (snapshot.val()) {
          snapshot.forEach((member) => {
            memberChanges.push({
              key: member.key,
              username: member.val().username,
              isTyping: member.val().isTyping,
              isOnline: member.val().isOnline
            });
          });
        }
        this.setState({ members: memberChanges });
      });
    }
  }

  render() {
    const chatRoomMembers = (
      this.state.members.map((member) =>
        <div key={member.key}>
          <h4 className="participant-name">
            {member.username}
            <span><small>{member.isTyping ? " is typing..." : null}</small></span>
          </h4>
        </div>
      )
    );
    return (
      <div>
        <h3 className="participants-heading"> Online Now </h3>
        {chatRoomMembers}
      </div>
    );
  }
}

export default ChatRoomParticipants;
