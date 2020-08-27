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
    async addMessage() {
      if (this.newMessage) {
        const userOneId = this.chatRoomId.split("-")[0];

        if (this.myId === userOneId) {
          this.firebase
            .database()
            .ref("Edubase/chat/" + this.chatRoomId + "/usr")
            .set([
              {
                nm: this.myName,
              },
              {
                nm: this.chatWith.usrDetails.name,
              },
            ]);
        } else {
          this.firebase
            .database()
            .ref("Edubase/chat/" + this.chatRoomId + "/usr")
            .set([
              {
                nm: this.chatWith.usrDetails.name,
              },
              {
                nm: this.myName,
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

        let historyRef = this.firebase
          .database()
          .ref("Edubase/chatHistory/" + this.myId + "/" + this.chatWith.usrId);

        historyRef.update({
          end: this.firebase.database.ServerValue.TIMESTAMP,
          msg:
            this.newMessage.length > 45
              ? this.newMessage.substring(0, 45) + "..."
              : this.newMessage,
        });

        await historyRef.transaction(function (data) {
          if (data) {
            if (data.unseen) {
              data.unseen++;
            } else {
              data.unseen = 1;
            }
          }

          return data;
        });

        let historyRef2 = this.firebase
          .database()
          .ref("Edubase/chatHistory/" + this.chatWith.usrId + "/" + this.myId);

        historyRef2.update({
          end: this.firebase.database.ServerValue.TIMESTAMP,
          msg:
            this.newMessage.length > 45
              ? this.newMessage.substring(0, 45) + "..."
              : this.newMessage,
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