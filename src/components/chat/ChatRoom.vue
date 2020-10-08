<template>
  <div
    class="chat-room"
    v-chat-scroll="{
      always: false,
      smooth: true,
      scrollonremoved: true,
      notSmoothOnInit: true,
    }"
    @v-chat-scroll-top-reached="loadPreviousMessages"
    @scroll="handleScroll"
  >
    <div style="height: 10px"></div>
    <ul class="container__message-list" id="messages">
      <li
        v-bind:class="{
          container__message: true,
          'photo-message': chat.val.photo,
          'msg-sent': chat.val.sender === myId,
          'msg-recieved': chat.val.sender !== myId,
          'last-sent':
            chat.val.sender === myId &&
            chats[i + 1] &&
            chats[i + 1].val.sender !== myId,
          'last-recieved':
            chat.val.sender !== myId &&
            chats[i + 1] &&
            chats[i + 1].val.sender === myId,
        }"
        v-for="(chat, i) in chats"
        :key="i"
      >
        <FullScreenImg
          :key="chat.key"
          :imgUrl="chat.val.photo"
          class="container__message--image"
          v-if="chat.val.photo"
          alt="sentImage"
        />
        <span v-if="chat.val.msg" class="container__message--msg">{{
          chat.val.msg
        }}</span>
        <div v-if="chat.val.post" class="container__message--post">
          <div class="container__message--post--content">
            <h4 class="container__message--post--text1">POST</h4>
            <h4 class="container__message--post--text2">Click here to view</h4>
          </div>
          <img
            :src="chat.val.post.crsDp"
            alt="Post Img"
            class="container__message--post--img"
          />
        </div>
      </li>
      <span
        v-if="
          chats[chats.length - 1].val.sender === myId &&
          lastSeen >= chats[chats.length - 1].val.tm
        "
        class="individual-chat__seen"
        >seen</span
      >
    </ul>
  </div>
</template>

<script>
import chatMixin from "../../mixins/chatMixin";
import FullScreenImg from "./FullScreenImg";
export default {
  name: "ChatRoom",
  mixins: [chatMixin],
  components: { FullScreenImg },
  props: {
    chats: Array,
    chatRoomId: String,
    showLoadLastSeen: Boolean,
  },
  data() {
    return {
      lastSeen: null,
      scrollEnabled: true,
    };
  },
  created() {
    console.log("yess");
  },
  mounted() {
    this.checkMessageSeen();
  },
  beforeDestroy() {
    this.firebase
      .database()
      .ref("Edubase/chat/" + this.chatRoomId + "/usr/1/ls")
      .off();

    this.firebase
      .database()
      .ref("Edubase/chat/" + this.chatRoomId + "/usr/0/ls")
      .off();
  },
  methods: {
    checkMessageSeen() {
      let _this = this;
      if (_this.checkUserId(_this.myId, _this.chatRoomId)) {
        _this.firebase
          .database()
          .ref("Edubase/chat/" + _this.chatRoomId + "/usr/1/ls")
          .on("value", function (data) {
            if (data.val()) {
              _this.lastSeen = data.val();
            }
          });
      } else {
        _this.firebase
          .database()
          .ref("Edubase/chat/" + _this.chatRoomId + "/usr/0/ls")
          .on("value", function (data) {
            if (data.val()) {
              _this.lastSeen = data.val();
            }
          });
      }
    },

    loadPreviousMessages(event) {
      event.preventDefault();
      this.$parent.loadPreviousMessages();
    },

    handleScroll(event) {
      console.log(event);
      event.preventDefault();
    },
  },
};
</script>

<style lang="scss">
.chat-room {
  height: 340px;
  overflow-y: auto;
  background-color: #eff3f2;

  &__load-btn {
    display: inline-block;
    margin-top: 45px;
  }
}

.container__message-list {
  padding-left: 0;
  padding: 0 10px;
  list-style: none;
  text-align: right;

  display: flex;
  flex-direction: column;
  justify-content: center;
}

.container__message {
  padding: 5px;
  margin-bottom: 3px;
  border-radius: 8px;
  max-width: 280px;
  word-wrap: break-word;

  &--photo-msg {
    padding: 0;
    margin-bottom: 5px;
  }

  &--image {
    width: 100%;
    object-fit: cover;
    cursor: pointer;
  }

  &--post {
    width: 200px;
    padding: 8px;
    display: flex;
    justify-content: center;
    align-items: center;

    &--content {
      flex: 1;
    }

    &--text1 {
      font-size: 15px;
      color: #555;
      margin: 0;
    }

    &--text2 {
      font-size: 12px;
      color: #333;
      margin: 0;
    }

    &--img {
      margin-left: 8px;
      float: 0.4;
      height: 36px;
      width: 36px;
      object-fit: cover;
      border-radius: 2000px;
    }
  }
}

.msg-sent {
  align-self: flex-end;
  text-align: right;
  background-color: #e1e4e5;
}

.msg-recieved {
  align-self: flex-start;
  text-align: left;
  background-color: #c8e9f7;
}

.last-sent,
.last-recieved {
  margin-bottom: 15px;
}

.photo-message {
  width: 280px !important;
  text-align: left !important;
}
</style>
