<template>
  <div class="message-div">
    <form class="message-div__form" @submit.prevent="addMessage">
      <label class="message-div__form--label" for="message">Write Message Here</label>
      <input type="text" class="message-div__form--input" name="message" v-model="newMessage" />
      <span class="message-div__form--warning" v-if="warning">{{ warning }}</span>
    </form>
  </div>
</template>

<script>
export default {
  name: "MessageInput",
  props: {
    chatRoomId: String,
    chatWith: Object,
  },
  data() {
    return {
      newMessage: null,
      messages: [],
      warning: null,
    };
  },
  methods: {
    addMessage() {
      if (this.newMessage) {
        const userOneId = this.chatRoomId.split("-")[0];

        if (this.myId === userOneId) {
          this.firebase
            .database()
            .ref("Edubase/chat/" + this.chatRoomId + "/usr")
            .set([
              {
                nm: this.myName,
                rl: "snd",
              },
              {
                nm: this.chatWith.usrDetails.name,
                rl: "rcv",
              },
            ]);
        } else {
          this.firebase
            .database()
            .ref("Edubase/chat/" + this.chatRoomId + "/usr")
            .set([
              {
                nm: this.chatWith.usrDetails.name,
                rl: "rcv",
              },
              {
                nm: this.myName,
                rl: "snd",
              },
            ]);
        }

        this.firebase
          .database()
          .ref("Edubase/chat/" + this.chatRoomId + "/chats")
          .push({
            msg: this.newMessage,
            tm: this.firebase.database.ServerValue.TIMESTAMP,
          })
          .catch((err) => {
            console.log(err);
          });

        this.newMessage = null;
      } else {
        this.warning = "Please enter a message to send!";
      }
    },
  },
};
</script>

<style>
.message-div {
  text-align: left;
}

.message-div__form {
  width: 100%;
  display: flex;
  flex-direction: column;
}
.message-div__form--label {
  color: #444;
}
.message-div__form--input {
  height: 25px;
  border: none;
  outline: none;
  width: 100%;
  opacity: 0.2;
  border-bottom: solid 2px teal;
}
.message-div__form--warning {
  color: red;
}
</style>