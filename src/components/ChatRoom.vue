<template>
  <div class="chat-room">
    <ul class="container__message-list">
      <li
        v-bind:class="{'container__message': true, 'msg-sent':(chat.val.sender === myId), 'msg-recieved':(chat.val.sender !== myId)}"
        v-for="(chat, i) in chats"
        :key="i"
      >
        <span v-if="chat.val.msg" class="container__message--msg">{{ chat.val.msg }}</span>
        <img
          class="container__message--image"
          v-if="chat.val.photo"
          :src="chat.val.photo"
          alt="sentImage"
        />
      </li>
      <span
        class="individual-chat__seen"
        v-if="lastSeen !== null && lastSeen >= chats[chats.length - 1].val.tm && chats[chats.length - 1].val.sender === myId"
      >seen</span>
    </ul>
    {{ checkMessageSeen() }}
  </div>
</template>

<script>
import checkUserIdMixin from "../mixins/checkUserIdMixin";
export default {
  name: "ChatRoom",
  mixins: [checkUserIdMixin],
  props: {
    chats: Array,
    chatRoomId: String,
  },
  data() {
    return {
      lastSeen: null,
    };
  },
  methods: {
    checkMessageSeen() {
      let _this = this;
      if (_this.checkUserId(_this.myId, _this.chatRoomId)) {
        _this.firebase
          .database()
          .ref("Edubase/chat/" + _this.chatRoomId + "/usr/1/ls")
          .on("value", function (data) {
            if (data.val()) {
              _this.lastSeen = data.val();
            }
          });
      } else {
        _this.firebase
          .database()
          .ref("Edubase/chat/" + _this.chatRoomId + "/usr/0/ls")
          .on("value", function (data) {
            if (data.val()) {
              _this.lastSeen = data.val();
            }
          });
      }
    },
  },
};
</script>

<style>
.chat-room {
  height: 300px;
  overflow-y: auto;
}

.container__message-list {
  padding-left: 0;
  padding: 0 10px;
  list-style: none;
  text-align: right;
}

.container__message {
  padding: 5px;

  margin-bottom: 3px;
  border-radius: 5px;
}

.container__message--image {
  width: 100%;
  object-fit: cover;
  border-radius: 3px;
}

.msg-sent {
  text-align: right;
  margin-left: 45px;
  background-color: #ff7675;
}

.msg-recieved {
  text-align: left;
  margin-right: 30px;
  background-color: #55efc4;
}
</style>