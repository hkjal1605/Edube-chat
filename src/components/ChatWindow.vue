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
        <ChatRoom :chatRoomId="chatRoomId" />
        <MessageInput :chatRoomId="chatRoomId" />
      </div>
    </div>
  </div>
</template>

<script>
import MessageInput from "./MessageInput";
import ChatRoom from "./ChatRoom";
export default {
  name: "ChatWindow",
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
    });

    this.users = _this.users;
  },
  methods: {
    setChatWith(user) {
      this.chatWith = user;

      this.chatRoomId =
        this.myId > user.usrId
          ? this.myId + "-chat-" + user.usrId
          : user.usrId + "-chat-" + this.myId;
    },
  },
};
</script>

<style>
.chat-window {
  padding: 40px 20px;
  text-align: center;
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