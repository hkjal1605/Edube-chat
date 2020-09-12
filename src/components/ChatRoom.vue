<template>
  <div class="chat-room">
    <v-btn
      v-if="showLoadLastSeen"
      text
      small
      color="primary"
      class="chat-room__load-button"
      @click="loadPreviousMessages"
    >LOAD PREVIOUS CHAT</v-btn>
    <ul class="container__message-list" id="messages">
      <li
        v-bind:class="{'container__message': true, 'msg-sent':(chat.val.sender === myId), 'msg-recieved':(chat.val.sender !== myId)}"
        v-for="(chat, i) in chats"
        :key="i"
      >
        <span v-if="chat.val.msg" class="container__message--msg">{{ chat.val.msg }}</span>
        <FullScreenImg
          :key="chat.key"
          :imgUrl="chat.val.photo"
          class="container__message--image"
          v-if="chat.val.photo"
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
import chatMixin from "../mixins/chatMixin";
import FullScreenImg from "./FullScreenImg";
export default {
  name: "ChatRoom",
  mixins: [chatMixin],
  components: { FullScreenImg },
  props: {
    chats: Array,
    chatRoomId: String,
    showLoadLastSeen: Boolean,
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

    loadPreviousMessages() {
      this.$parent.loadPreviousMessages();
    },
  },
};
</script>

<style>
.chat-room {
  margin-top: 60px;
  height: 300px;
  overflow-y: auto;
}

.chat-room__load-btn {
  display: inline-block;
  margin-top: 45px;
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