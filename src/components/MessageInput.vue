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
import checkUserIdMixin from "../mixins/checkUserIdMixin";
export default {
  name: "MessageInput",
  mixins: [checkUserIdMixin],
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
        var updates = {};

        // /nm
        if (this.checkUserId(this.myId, this.chatRoomId)) {
          updates["Edubase/chat/" + this.chatRoomId + "/usr"] = [
            {
              nm: this.myName,
            },
            {
              nm: this.chatWith.usrDetails.name,
            },
          ];
        } else {
          updates["Edubase/chat/" + this.chatRoomId + "/usr"] = [
            {
              nm: this.chatWith.usrDetails.name,
            },
            {
              nm: this.myName,
            },
          ];
        }

        let pushKey = this.getPushKey();
        updates["Edubase/chat/" + this.chatRoomId + "/chats/" + pushKey] = {
          msg: this.newMessage,
          tm: this.firebase.database.ServerValue.TIMESTAMP,
        };

        updates[
          "Edubase/chatHistory/" + this.myId + "/" + this.chatWith.usrId
        ] = {
          end: this.firebase.database.ServerValue.TIMESTAMP,
          msg:
            this.newMessage.length > 45
              ? this.newMessage.substring(0, 45) + "..."
              : this.newMessage,
        };

        updates[
          "Edubase/chatHistory/" +
            this.chatWith.usrId +
            "/" +
            this.myId +
            "/end"
        ] = this.firebase.database.ServerValue.TIMESTAMP;

        updates[
          "Edubase/chatHistory/" +
            this.chatWith.usrId +
            "/" +
            this.myId +
            "/msg"
        ] =
          this.newMessage.length > 45
            ? this.newMessage.substring(0, 45) + "..."
            : this.newMessage;

        this.firebase.database().ref().update(updates);

        this.firebase
          .database()
          .ref("Edubase/chatHistory/" + this.chatWith.usrId + "/" + this.myId)
          .transaction(function (data) {
            if (data) {
              if (data.unseen) {
                data.unseen++;
              } else {
                data.unseen = 1;
              }
            }

            return data;
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