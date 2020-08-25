<template>
  <div class="chat-room">
    <ul class="container__message-list">
      <li class="container__message" v-for="message in messages" :key="message.tm">
        <span class="container__message--name">{{ message.usrNm }}</span>
        <span class="container__message--content">{{ message.msg }}</span>
        <span class="container__message--time">{{ message.tm }}</span>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: "ChatRoom",
  props: ["chatRoomId"],
  data() {
    return {
      messages: [],
    };
  },
  created() {
    let msgRef = this.firebase
      .database()
      .ref("Edubase/chat/" + this.chatRoomId);

    let _this = this;
    msgRef.on("child_added", function (data) {
      console.log(data.val());
      _this.messages.push(data.val());
    });

    this.messages = _this.messages;
  },
};
</script>

<style>
.container__message-list {
  list-style: none;
  text-align: left;
  background-color: #eee;
  border: 2px solid black;
}

.container__message {
  display: flex;
  flex-direction: column;
}

.container__message--name {
  color: teal;
  font-size: 20px;
}
</style>