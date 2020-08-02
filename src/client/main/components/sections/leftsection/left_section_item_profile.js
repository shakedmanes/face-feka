import React from 'react';

const LeftSectionItemProfile = ( { loggedInUserName, loggedInUserPic, loggedInUserGameWins, loggedInUserFriends } ) => {
  return(
    <div className = "profile">
      <div className = "profile-picture circle">
        <img src = { loggedInUserPic } alt = "user-profile-picture" className = "cover" />
      </div>

      <div className = "profile-name">
        <span>{ loggedInUserName.first } { loggedInUserName.last }</span>
      </div>

      <div className = "profile-game-wins">
        <span>Game Wins: { loggedInUserGameWins } </span>
      </div>

      <div className = "profile-friends-list">
        { (function() {
          if (loggedInUserFriends.length === 0) {
            return <span> Friends: 0 </span>
          }
          let spansFriends = [<br></br>];

          for (let friend of loggedInUserFriends) {
            spansFriends.push(<span>{ friend.name.first + ' ' + friend.name.last }<br></br></span>);
          }

        return (<span> Friends: {spansFriends} </span>);
        })() }
      </div>
    </div>
  );
};

export default LeftSectionItemProfile;