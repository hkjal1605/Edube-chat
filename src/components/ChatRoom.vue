<template>
  <div class="chat-room">
    <ul class="container__message-list">
      <li
        v-bind:class="{'container__message': true, 'msg-sent':(chat.val.sender === myId), 'msg-recieved':(chat.val.sender !== myId)}"
        v-for="(chat, i) in chats"
        :key="i"
      >
        <span class="individual-chat__message--name">{{ chat.val.msg }}</span>
      </li>
    </ul>
    <!-- <h1 v-if="checkSeen()">seen</h1> -->
  </div>
</template>

<script>
export default {
  name: "ChatRoom",
  props: {
    chats: Array,
    chatRoomId: String,
  },
  data() {
    return {};
  },
};
</script>

<style>
.chat-room {
  overflow-y: auto;
}
.container__message-list {
  padding-left: 0;
  padding: 0 10px;
  list-style: none;
  text-align: left;
  overflow: scroll;
}

.container__message {
  padding: 5px;

  margin-bottom: 3px;
  border-radius: 5px;
}

.msg-sent {
  text-align: left;
  background-color: #ff7675;
}

.msg-recieved {
  text-align: right;
  background-color: #55efc4;
}
</style>