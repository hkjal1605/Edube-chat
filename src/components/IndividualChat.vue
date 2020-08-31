<template>
  <div class="chat-window__container" v-if="chatRoomId">
    <div class="chat-window__container--top">{{ chatWith.usrDetails.name}}</div>
    <v-btn
      text
      small
      color="primary"
      class="chat-window__button"
      @click="loadPreviousMessages"
    >LOAD PREVIOUS CHAT</v-btn>
    <ChatRoom v-if="chats.length > 0" :chats="chats" :chatRoomId="chatRoomId" />
    <MessageInput class="message-input" :chatRoomId="chatRoomId" :chatWith="chatWith" />
  </div>
</template>

<script>
import MessageInput from "./MessageInput";
import checkUserIdMixin from "../mixins/checkUserIdMixin";
import ChatRoom from "./ChatRoom";
export default {
  name: "IndividualChat",
  props: {
    chatWith: Object,
    showContainer: Boolean,
  },
  mixins: [checkUserIdMixin],
  components: { MessageInput, ChatRoom },
  data() {
    return {
      chatRoomId: null,
      chats: [],
      arrayOfKeys: [],
    };
  },
  mounted() {
    console.log(this.chatWith);
    let currentChatRoomId = this.chatRoomId;

    this.chatRoomId =
      this.myId > this.chatWith.usrId
        ? this.myId + "-CHAT-" + this.chatWith.usrId
        : this.chatWith.usrId + "-CHAT-" + this.myId;

    this.arrayOfKeys = [];

    let updates = {};

    if (this.chatRoomId === currentChatRoomId && currentChatRoomId !== null) {
      if (this.checkUserId(this.myId, this.chatRoomId)) {
        updates[
          "Edubase/chat/" + this.chatRoomId + "/usr/0/ls"
        ] = this.firebase.database.ServerValue.TIMESTAMP;
      } else {
        updates[
          "Edubase/chat/" + this.chatRoomId + "/usr/1/ls"
        ] = this.firebase.database.ServerValue.TIMESTAMP;
      }
    }

    this.firebase.database().ref().update(updates);

    this.firebase
      .database()
      .ref("Edubase/chatHistory/" + this.myId + "/" + this.chatWith.usrId)
      .transaction(function (data) {
        if (data) {
          data.unseen = 0;
        }

        return data;
      });

    this.chats = [];

    let msgRef = this.firebase
      .database()
      .ref("Edubase/chat/" + this.chatRoomId + "/chats")
      .orderByKey()
      .limitToLast(4);

    let _this = this;

    msgRef.on("child_added", function (data) {
      _this.chats.push({
        key: data.key,
        val: data.val(),
      });

      _this.arrayOfKeys.push(data.key);

      if (_this.checkUserId(_this.myId, _this.chatRoomId)) {
        _this.firebase
          .database()
          .ref("Edubase/chat/" + _this.chatRoomId + "/usr/0/")
          .update({
            ls: data.val().tm,
          });
      } else {
        _this.firebase
          .database()
          .ref("Edubase/chat/" + _this.chatRoomId + "/usr/1/")
          .update({
            ls: data.val().tm,
          });
      }

      _this.firebase
        .database()
        .ref("Edubase/chatHistory/" + _this.myId + "/" + _this.chatWith.usrId)
        .transaction(function (data) {
          if (data) {
            data.unseen = 0;
          }

          return data;
        });
    });
  },
  destroyed() {
    console.log("unmounted");
    this.firebase
      .database()
      .ref("Edubase/chat/" + this.chatRoomId + "/chats")
      .orderByKey()
      .limitToLast(4)
      .off();
  },
  methods: {
    loadPreviousMessages() {
      let msgRef = this.firebase
        .database()
        .ref("Edubase/chat/" + this.chatRoomId + "/chats")
        .orderByKey()
        .endAt(this.arrayOfKeys[0])
        .limitToLast(5);

      this.arrayOfKeys = [];

      let _this = this;

      let tempArray = [];

      msgRef.once("value", function (data) {
        Object.keys(data.val()).map((key) => {
          _this.arrayOfKeys.push(key);
          tempArray.unshift({
            key: key,
            val: data.val()[key],
          });
        });

        console.log(tempArray.shift());
        tempArray.map((item) => _this.chats.unshift(item));
      });
    },
  },
};
</script>

