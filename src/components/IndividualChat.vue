<template>
  <div v-bind:class="{'chat-window__container': true, 'minimisedChatRoom': (minimised)}">
    <div class="chat-window__container--top">
      <h3 class="chat-window__container--heading">
        {{ chatWith.name}}
        <div class="chat-window__container--unseen" v-if="numUnseen">{{ numUnseen }}</div>
        <div class="online-display" v-if="userOnline === 'true'" />
        <div class="offline-display" v-if="userOnline === 'false'" />
      </h3>

      <v-btn
        class="chat-window__container--close-btn"
        color="error"
        fab
        small
        @click="closeChatRoom()"
      >
        <v-icon>mdi-close</v-icon>
      </v-btn>
      <v-btn
        class="chat-window__container--minimise-btn"
        color="error"
        fab
        small
        @click="minimiseChatRoom()"
      >
        <v-icon>mdi-minus</v-icon>
      </v-btn>
    </div>
    <div v-if="!minimised">
      <!-- <v-btn
        text
        small
        color="primary"
        class="chat-window__button"
        @click="loadPreviousMessages"
      >LOAD PREVIOUS CHAT</v-btn>-->
      <ChatRoom
        v-if="chats.length > 0"
        :chats="chats"
        :chatRoomId="chatRoomId"
        :showLoadLastSeen="showLoadLastSeen"
      />
      <MessageInput class="message-input" :chatRoomId="chatRoomId" :chatWith="chatWith" />
    </div>
  </div>
</template>

<script>
import MessageInput from "./MessageInput";
import chatMixin from "../mixins/chatMixin";
import ChatRoom from "./ChatRoom";
export default {
  name: "IndividualChat",
  props: {
    chatWith: Object,
  },
  mixins: [chatMixin],
  components: { MessageInput, ChatRoom },
  data() {
    return {
      chatRoomId: null,
      chats: [],
      arrayOfKeys: [],
      minimised: false,
      numUnseen: 0,
      showLoadLastSeen: false,
      userOnline: false,
      chatLimit: 4,
    };
  },
  mounted() {
    console.log(this.chatWith);

    let _this = this;

    this.firebase
      .database()
      .ref("Edubase/users/" + this.chatWith.objectID + "/online")
      .on("value", function (data) {
        console.log(data.val());
        _this.userOnline = data.val();
      });

    let currentChatRoomId = this.chatRoomId;

    this.chatRoomId =
      this.myId < this.chatWith.objectID
        ? this.myId + "-CHAT-" + this.chatWith.objectID
        : this.chatWith.objectID + "-CHAT-" + this.myId;

    this.arrayOfKeys = [];

    let updates = {};

    if (!this.minimised) {
      if (this.chatRoomId === currentChatRoomId && currentChatRoomId !== null) {
        if (this.checkUserId(this.myId, this.chatRoomId)) {
          this.setLastSeen(
            this.firebase.database.ServerValue.TIMESTAMP,
            this.chatRoomId,
            "0"
          );
        } else {
          this.setLastSeen(
            this.firebase.database.ServerValue.TIMESTAMP,
            this.chatRoomId,
            "1"
          );
        }
      }
    }

    this.firebase.database().ref().update(updates);

    if (!this.minimised) {
      this.resetUnseenNumber(this.chatWith);
    }

    this.chats = [];

    let msgRef = this.firebase
      .database()
      .ref("Edubase/chat/" + this.chatRoomId + "/chats")
      .orderByKey()
      .limitToLast(this.chatLimit);

    msgRef.on("child_added", function (data) {
      _this.chats.push({
        key: data.key,
        val: data.val(),
      });

      _this.arrayOfKeys.push(data.key);

      if (!_this.minimised) {
        if (_this.checkUserId(_this.myId, _this.chatRoomId)) {
          _this.setLastSeen(data.val().tm, _this.chatRoomId, "0");
        } else {
          _this.setLastSeen(data.val().tm, _this.chatRoomId, "1");
        }

        _this.resetUnseenNumber(_this.chatWith);
      }
    });

    this.firebase
      .database()
      .ref("Edubase/chat/" + this.chatRoomId + "/chats")
      .once("value", function (data) {
        if (
          data.val() &&
          Object.keys(data.val()).length !== _this.chats.length
        ) {
          _this.showLoadLastSeen = true;
        }
      });
  },
  destroyed() {
    this.firebase
      .database()
      .ref("Edubase/chat/" + this.chatRoomId + "/chats")
      .orderByKey()
      .limitToLast(this.chatLimit)
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

        tempArray.shift();
        console.log(tempArray);
        tempArray.map((item) => _this.chats.unshift(item));

        _this.firebase
          .database()
          .ref("Edubase/chat/" + _this.chatRoomId + "/chats")
          .once("value", function (data) {
            if (Object.keys(data.val()).length !== _this.chats.length) {
              _this.showLoadLastSeen = true;
            } else if (
              data.val() &&
              Object.keys(data.val()).length === _this.chats.length
            ) {
              _this.showLoadLastSeen = false;
            }
          });
      });
    },

    minimiseChatRoom() {
      this.minimised = !this.minimised;

      let _this = this;

      if (this.minimised) {
        this.firebase
          .database()
          .ref(
            "Edubase/chatHistory/" +
              this.myId +
              "/" +
              this.chatWith.objectID +
              "/unseen"
          )
          .on("value", function (data) {
            if (data.val()) {
              _this.numUnseen = data.val();
            }
          });
      }

      if (!this.minimised) {
        this.numUnseen = 0;
        this.resetUnseenNumber(this.chatWith);

        this.firebase
          .database()
          .ref(
            "Edubase/chatHistory/" +
              this.myId +
              "/" +
              this.chatWith.objectID +
              "/unseen"
          )
          .off();

        if (this.checkUserId(this.myId, this.chatRoomId)) {
          this.setLastSeen(
            this.firebase.database.ServerValue.TIMESTAMP,
            this.chatRoomId,
            "0"
          );
        } else {
          this.setLastSeen(
            this.firebase.database.ServerValue.TIMESTAMP,
            this.chatRoomId,
            "1"
          );
        }
      }
    },

    closeChatRoom() {
      let tempArray = this.$parent.chatWith;
      const index = tempArray.indexOf(this.chatWith);
      if (index > -1) {
        this.$parent.chatWith.splice(index, 1);
      }
      console.log(this.$parent.chatWith);
    },
  },
};
</script>

<style scoped>
.online-display {
  margin-left: 8px;
  height: 16px;
  width: 16px;
  border-radius: 50%;
  background-color: #55efc4;
}

.offline-display {
  margin-left: 8px;
  height: 16px;
  width: 16px;
  background-color: #ff7675;
  border-radius: 50%;
}
</style>

