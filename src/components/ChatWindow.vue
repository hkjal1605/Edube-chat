<template>
  <div class="chat-window">
    <div class="chat-window__top">
      <h4 class="chat-window__top--heading" v-if="!chatWith">New Chat</h4>
      <h4 class="chat-window__top--heading" v-if="chatWith">{{chatWith.usrDetails.name}}</h4>
    </div>

    <v-menu
      transition="slide-x-transition"
      :offset-x="true"
      :left="true"
      :close-on-content-click="false"
    >
      <template v-slot:activator="{ on, attrs }">
        <div class="chat-window__main">
          <div class="chat-window__user-list">
            <div class="user-list">
              <div
                v-bind="attrs"
                v-on="on"
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
                <span
                  class="user-list__user--name"
                  v-if="user.usrId != myId"
                >{{ user.usrDetails.name }}</span>
                <span
                  class="user-list__last-msg"
                  v-if="lastMsg && lastMsg[user.usrId]"
                >{{ lastMsg[user.usrId].msg }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>
      <div class="chat-window__container" v-if="chatWith">
        <v-btn
          color="primary"
          class="chat-window__button"
          @click="loadPreviousMessages"
        >LOAD PREVIOUS CHAT</v-btn>
        <ChatRoom v-if="chats.length > 0" :chats="chats" :chatRoomId="chatRoomId" />
        <MessageInput class="message-input" :chatRoomId="chatRoomId" :chatWith="chatWith" />
      </div>
    </v-menu>
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
      lastMsg: undefined,
      arrayOfKeys: [],
      previousMessages: [],
    };
  },
  mounted() {
    let userRef = this.firebase.database().ref("Edubase/users/");

    let _this = this;
    userRef.on("value", function (data) {
      Object.keys(data.val()).map((key) => {
        _this.users.push({
          usrId: key,
          usrDetails: data.val()[key],
        });
      });
    });

    this.checkUnseenMessages();
  },
  methods: {
    setChatWith(user) {
      this.chatWith = user;

      let currentChatRoomId = this.chatRoomId;

      this.chatRoomId =
        this.myId > user.usrId
          ? this.myId + "-CHAT-" + user.usrId
          : user.usrId + "-CHAT-" + this.myId;

      this.arrayOfKeys = [];

      console.log(this.chatRoomId);

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
        .ref("Edubase/chat/" + this.chatRoomId + "/chats")
        .orderByKey()
        .limitToLast(4);

      let _this = this;

      msgRef.on("child_added", function (data) {
        _this.chats.push({
          key: data.key,
          val: data.val(),
        });

        _this.arrayOfKeys.push(data.key);

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

        _this.firebase
          .database()
          .ref("Edubase/chatHistory/" + _this.myId + "/" + _this.chatWith.usrId)
          .transaction(function (data) {
            if (data) {
              data.unseen = 0;
            }

            return data;
          });
      });

      this.chats = [];
    },

    checkUnseenMessages() {
      let ref = this.firebase
        .database()
        .ref("Edubase/chatHistory/" + this.myId);

      let _this = this;

      ref.on("value", function (data) {
        _this.lastMsg = data.val();
      });

      console.log(_this.lastMsg);
    },

    loadPreviousMessages() {
      let msgRef = this.firebase
        .database()
        .ref("Edubase/chat/" + this.chatRoomId + "/chats")
        .orderByKey()
        .endAt(this.arrayOfKeys[0])
        .limitToLast(5);

      this.arrayOfKeys = [];

      let _this = this;

      let tempArray = [];

      msgRef.once("value", function (data) {
        Object.keys(data.val()).map((key) => {
          _this.arrayOfKeys.push(key);
          tempArray.unshift({
            key: key,
            val: data.val()[key],
          });
        });

        console.log(tempArray.shift());
        tempArray.map((item) => _this.chats.unshift(item));
      });
    },
  },
};
</script>

<style>
.chat-window {
  width: 300px;
  height: 400px;
  text-align: left;
  /* border-radius: 40px;
  overflow: hidden; */

  position: relative;
}

.chat-window__top {
  padding: 5px 10px;
  width: 100%;
  background-color: #1976d2;
  position: absolute;
  top: 0;
}

.chat-window__top--heading {
  color: #eee;
  font-size: 20px;
  margin: 0;
}

.chat-window__heading {
  color: teal;
  font-size: 40px;
  font-weight: normal;
}

.chat-window__main {
  display: flex;
}

.chat-window__user-list {
  width: 100%;
}

.chat-window__container {
  height: 450px;
  width: 400px;
  text-align: center;
}

.chat-window__button {
  display: inline-block;
  margin-top: 40px;
  margin-bottom: 10px;
  padding: 6px 12px;
  border-radius: 2000px;
  background-color: teal;
  color: #fff;
}

.user-list {
  margin-top: 30px;
  padding: 10px;
}
.user-list__heading {
  color: teal;
}
.user-list__user {
  cursor: pointer;
  padding: 4px 10px;
  display: flex;
  align-items: center;
  margin-bottom: 3px;
}
.user-list__user--img {
  height: 30px;
  width: 30px;
  object-fit: cover;
  border-radius: 50%;
  margin-right: 15px;
}
.user-list__user--name {
  font-size: 16px;
}

.message-input {
  width: 100%;
  position: absolute;
  bottom: 10px;
}
</style>