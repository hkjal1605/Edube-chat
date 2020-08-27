<template>
  <div class="chat-room">
    <ul class="container__message-list">
      <li class="container__message" v-for="(chat, i) in chats" :key="i">
        <span class="individual-chat__message--name">{{ chat }}</span>
        <span
          class="individual-chat__message--name"
          v-if="seen[0] !== null && chat.details.tm <= seen[0]"
        >seen</span>
      </li>
    </ul>
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
    return {
      seen: [null],
    };
  },
  created() {
    let usrRef = this.firebase
      .database()
      .ref("Edubase/chat/" + this.chatRoomId + "/usr/");

    let _this = this;

    usrRef.on("child_changed", function (data) {
      _this.seen.pop();
      _this.seen.push(data.val().ls);
    });

    this.seen = _this.seen;
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