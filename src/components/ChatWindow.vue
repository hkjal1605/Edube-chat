<template>
  <div class="chat-window">
    <h2 class="chat-window__heading">EDUBASE CHAT</h2>
    <div class="chat-window__main">
      <div class="chat-window__user-list">
        <div class="user-list">
          <h4 class="user-list__heading">Users</h4>
          <div
            class="user-list__user"
            v-for="user in users"
            :key="user.usrId"
            @click="setChatWith(user)"
          >
            <img
              :src="user.usrDetails.dp"
              alt="User"
              class="user-list__user--img"
              v-if="user.usrId != myId"
            />
            <span class="user-list__user--name" v-if="user.usrId != myId">{{ user.usrDetails.name }}</span>
          </div>
        </div>
      </div>
      <div class="chat-window__container" v-if="chatWith">
        <div class="chat-window__chat-with">{{ chatWith.usrDetails.name }}</div>
        <ChatRoom :chats="chats" :chatRoomId="chatRoomId" />
        <MessageInput :chatRoomId="chatRoomId" :chatWith="chatWith" />
      </div>
    </div>
  </div>
</template>

<script>
import MessageInput from "./MessageInput";
import ChatRoom from "./ChatRoom";
import checkUserIdMixin from "../mixins/checkUserIdMixin";
export default {
  name: "ChatWindow",
  mixins: [checkUserIdMixin],
  components: { MessageInput, ChatRoom },
  data() {
    return {
      chats: [],
      users: [],
      chatWith: null,
      chatRoomId: null,
    };
  },
  created() {
    let userRef = this.firebase.database().ref("Edubase/users/");

    let _this = this;
    userRef.on("value", function (data) {
      Object.keys(data.val()).map((key) => {
        _this.users.push({
          usrId: key,
          usrDetails: data.val()[key],
        });
      });
      5;
    });

    this.users = _this.users;
  },
  methods: {
    setChatWith(user) {
      this.chatWith = user;

      let currentChatRoomId = this.chatRoomId;

      this.chatRoomId =
        this.myId > user.usrId
          ? this.myId + "-CHAT-" + user.usrId
          : user.usrId + "-CHAT-" + this.myId;

      let updates = {};

      if (this.chatRoomId === currentChatRoomId && currentChatRoomId !== null) {
        if (this.checkUserId(this.myId, this.chatRoomId)) {
          updates[
            "Edubase/chat/" + this.chatRoomId + "/usr/0/ls"
          ] = this.firebase.database.ServerValue.TIMESTAMP;
        } else {
          updates[
            "Edubase/chat/" + this.chatRoomId + "/usr/1/ls"
          ] = this.firebase.database.ServerValue.TIMESTAMP;
        }
      }

      this.firebase.database().ref().update(updates);

      this.firebase
        .database()
        .ref("Edubase/chatHistory/" + this.myId + "/" + this.chatWith.usrId)
        .transaction(function (data) {
          if (data) {
            data.unseen = 0;
          }

          return data;
        });

      this.chats = [];

      if (currentChatRoomId) {
        this.firebase
          .database()
          .ref("Edubase/chat/" + currentChatRoomId + "/chats")
          .off();
      }

      let msgRef = this.firebase
        .database()
        .ref("Edubase/chat/" + this.chatRoomId + "/chats");

      let _this = this;

      msgRef.on("child_added", function (data) {
        //use key, val
        _this.chats.push({
          key: data.key,
          val: data.val(),
        });

        if (_this.checkUserId(_this.myId, _this.chatRoomId)) {
          _this.firebase
            .database()
            .ref("Edubase/chat/" + _this.chatRoomId + "/usr/0/")
            .update({
              ls: data.val().tm,
            });
        } else {
          _this.firebase
            .database()
            .ref("Edubase/chat/" + _this.chatRoomId + "/usr/1/")
            .update({
              ls: data.val().tm,
            });
        }

        let historyRef = _this.firebase
          .database()
          .ref(
            "Edubase/chatHistory/" + _this.myId + "/" + _this.chatWith.usrId
          );

        historyRef.once("value").then((data) => {
          if (data.val()) {
            historyRef.update({ unseen: 0 });
          }
        });
      });
    },
  },
};
</script>

<style>
.chat-window {
  padding: 40px 20px;
  text-align: center;
  overflow: scroll;
}

.chat-window__heading {
  color: teal;
  font-size: 40px;
  font-weight: normal;
}

.chat-window__main {
  display: flex;
}

.chat-window__container {
  display: inline-block;
  padding: 30px;
  height: 70vh;
  width: 80vw;
  border: 1px solid teal;
}

.user-list {
  padding: 10px;
}
.user-list__heading {
  color: teal;
}
.user-list__user {
  cursor: pointer;
  padding: 10px 0;
  display: flex;
  align-items: center;
}
.user-list__user--img {
  height: 30px;
  width: 30px;
  object-fit: cover;
  border-radius: 50%;
}
.user-list__user--name {
  font-size: 20px;
}
</style>