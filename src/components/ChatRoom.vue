<template>
  <div class="chat-room">
    <ul class="container__message-list">
      <li class="container__message" v-for="(chat, i) in chats" :key="i">
        <span class="individual-chat__message--name">{{ chat }}</span>
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
  overflow: scroll;
}
.container__message-list {
  list-style: none;
  text-align: left;
  background-color: #eee;
}
</style>