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
        v-bind:class="{'container__message': true, 'container__message--photo-msg': (chat.val.photo), 'msg-sent':(chat.val.sender === myId), 'msg-recieved':(chat.val.sender !== myId), 'last-sent': (chat.val.sender === myId && chats[i+1] && chats[i+1].val.sender !== myId), 'last-recieved': (chat.val.sender !== myId && chats[i+1] && chats[i+1].val.sender === myId)}"
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

<style lang="scss">
.chat-room {
  height: 340px;
  overflow-y: auto;
  background-color: #eff3f2;

  &__load-btn {
    display: inline-block;
    margin-top: 45px;
  }
}

.container__message-list {
  padding-left: 0;
  padding: 0 10px;
  list-style: none;
  text-align: right;
}

.container__message {
  padding: 5px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
  margin-bottom: 3px;
  border-radius: 8px;

  &--photo-msg {
    padding: 0;
    margin-bottom: 5px;
  }
}

.container__message--image {
  width: 100%;
  object-fit: cover;
  cursor: pointer;
}

.msg-sent {
  text-align: right;
  margin-left: 45px;
  background-color: #e1e4e5;
}

.msg-recieved {
  text-align: left;
  margin-right: 30px;
  background-color: #c8e9f7;
}

.last-sent,
.last-recieved {
  margin-bottom: 15px;
}
</style>