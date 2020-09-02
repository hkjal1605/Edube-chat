<template>
  <div class="message-div">
    <form class="message-div__form" @submit.prevent="addMessage">
      <input type="text" class="message-div__form--input" name="message" v-model="newMessage" />
      <button type="submit" class="message-div__button">
        <v-icon>mdi-send</v-icon>
      </button>
    </form>
    <span class="message-div__form--warning" v-if="warning">{{ warning }}</span>
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

        if (this.checkUserId(this.myId, this.chatRoomId)) {
          updates[
            "Edubase/chat/" + this.chatRoomId + "/usr/0/nm"
          ] = this.myName;
          updates[
            "Edubase/chat/" + this.chatRoomId + "/usr/1/nm"
          ] = this.chatWith.name;
        } else {
          updates[
            "Edubase/chat/" + this.chatRoomId + "/usr/0/nm"
          ] = this.chatWith.name;
          updates[
            "Edubase/chat/" + this.chatRoomId + "/usr/1/nm"
          ] = this.myName;
        }

        let pushKey = this.getPushKey();
        updates["Edubase/chat/" + this.chatRoomId + "/chats/" + pushKey] = {
          msg: this.newMessage,
          tm: this.firebase.database.ServerValue.TIMESTAMP,
          sender: this.myId,
        };

        updates[
          "Edubase/chatHistory/" + this.myId + "/" + this.chatWith.objectID
        ] = {
          end: this.firebase.database.ServerValue.TIMESTAMP,
          msg:
            this.newMessage.length > 45
              ? this.newMessage.substring(0, 45) + "..."
              : this.newMessage,
        };

        updates[
          "Edubase/chatHistory/" +
            this.chatWith.objectID +
            "/" +
            this.myId +
            "/end"
        ] = this.firebase.database.ServerValue.TIMESTAMP;

        updates[
          "Edubase/chatHistory/" +
            this.chatWith.objectID +
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
          .ref(
            "Edubase/chatHistory/" + this.chatWith.objectID + "/" + this.myId
          )
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
        this.warning = null;
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
  padding: 0 20px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.message-div__form--input {
  height: 30px;
  padding: 5px 10px;
  border: none;
  outline: none;
  width: 88%;
  border-radius: 2000px;
  border: solid 2px teal;
}
.message-div__form--warning {
  color: red;
}
</style>