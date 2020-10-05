<template>
  <div
    v-bind:class="{
      'chat-window__container': true,
      minimisedChatRoom: minimised,
    }"
  >
    <div
      :key="chatWith.name"
      class="chat-window__container--top"
      @click="minimiseChatRoom()"
    >
      <div class="online-display" v-if="userOnline" />
      <div class="offline-display" v-if="!userOnline" />
      <h3 :key="chatWith.name" class="chat-window__container--heading">
        {{ chatWith.name }}
        <div class="chat-window__container--unseen" v-if="numUnseen">
          {{ numUnseen }}
        </div>
      </h3>

      <v-btn
        class="chat-window__container--close-btn"
        fab
        small
        color="transparent"
        @click="closeChatRoom()"
      >
        <v-icon color="#dee2e1">mdi-close</v-icon>
      </v-btn>
    </div>
    <div v-if="!minimised">
      <ChatRoom
        v-if="chats.length > 0"
        :chats="chats"
        :chatRoomId="chatRoomId"
        :showLoadLastSeen="showLoadLastSeen"
      />
      <MessageInput
        class="message-input"
        :chatRoomId="chatRoomId"
        :chatWith="chatWith"
      />
    </div>
  </div>
</template>

<script>
import MessageInput from "./MessageInput";
import chatMixin from "../../mixins/chatMixin";
import ChatRoom from "./ChatRoom";
export default {
  name: "IndividualChat",
  props: {
    chatWith: Object,
    chatPosition: Number,
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
    if (this.chatPosition === 1) {
      this.$parent.chatComponentMinimised = false;
    }
    if (this.$parent.chatComponentTwoMinimised && this.chatPosition === 2) {
      this.$parent.chatComponentMinimised = true;
      this.$parent.chatComponentTwoMinimised = false;
    }

    let _this = this;

    this.firebase
      .database()
      .ref("Edubase/users/" + this.chatWith.objectID)
      .on("value", function (data) {
        _this.userOnline = data.val().online;

        let historyRef = _this.firebase
          .database()
          .ref(`Edubase/chatHistory/${_this.myId}/${_this.chatWith.objectID}`);

        historyRef.once("value", function (data2) {
          if (data2.val()) {
            if (_this.chatWith.name !== data.val().name) {
              _this.chatWith.name = data.val().name;

              _this.firebase
                .database()
                .ref(
                  `Edubase/chatHistory/${_this.myId}/${_this.chatWith.objectID}`
                )
                .update({
                  name: data.val().name,
                });
            }

            if (_this.chatWith.dp !== data.val().dp) {
              _this.chatWith.dp = data.val().dp;

              _this.firebase
                .database()
                .ref(
                  `Edubase/chatHistory/${_this.myId}/${_this.chatWith.objectID}`
                )
                .update({
                  dp: data.val().dp ? data.val().dp : null,
                });
            }
          }
        });
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
  beforeDestroy() {
    if (this.chatPosition === 1 && this.$parent.chatComponentMinimised) {
      this.$parent.chatComponentMinimised = false;
    }

    this.firebase
      .database()
      .ref("Edubase/chat/" + this.chatRoomId + "/chats")
      .orderByKey()
      .limitToLast(this.chatLimit)
      .off();

    this.firebase
      .database()
      .ref("Edubase/users/" + this.chatWith.objectID)
      .off();

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

      if (this.chatPosition === 1) {
        let tempVar = this.$parent.chatComponentMinimised;
        this.$parent.chatComponentMinimised = !tempVar;
      }

      if (this.chatPosition === 2) {
        let tempVar = this.$parent.chatComponentTwoMinimised;
        this.$parent.chatComponentTwoMinimised = !tempVar;
      }

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
    },
  },
};
</script>

<style scoped lang='scss'>
.chat-window__container {
  background-color: #eff3f2;
  overflow: hidden;
  border-radius: 15px 15px 2px 2px;
  height: 450px;
  width: 380px;
  text-align: center;
  margin-left: 15px;

  transition: all 0.3s;

  &--top {
    padding: 8px 10px;
    margin-bottom: 5px;
    width: 100%;
    background-color: #1976d2;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: flex-start;
  }

  &--heading {
    position: relative;
    font-size: 20px;
    font-weight: 500;
    color: #eee;
    display: flex;
    align-items: center;
    margin-bottom: 0;
  }

  &--unseen {
    position: absolute;
    top: 50%;
    right: -20px;
    transform: translateY(-50%);
    background-color: #f1c40f;
    color: #c0392b;
    height: 18px;
    width: 18px;
    border-radius: 2000px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 400;
  }

  &--close-btn {
    height: 28px !important;
    width: 28px !important;
    box-shadow: none !important;
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
  }

  &--minimise-btn {
    height: 28px !important;
    width: 28px !important;
    box-shadow: none !important;
    position: absolute;
    right: 45px;
    top: 50%;
    transform: translateY(-50%);
  }
}

.minimisedChatRoom {
  height: 38px;
  width: 280px;
  align-self: flex-end;
}

.message-input {
  width: 100%;
  position: absolute;
  bottom: 0;
  height: 67px;
}

.online-display {
  margin-right: 8px;
  height: 12px;
  width: 12px;
  border-radius: 50%;
  background-color: #55efc4;
}

.offline-display {
  margin-right: 8px;
  height: 12px;
  width: 12px;
  background-color: #ff7675;
  border-radius: 50%;
}
</style>

