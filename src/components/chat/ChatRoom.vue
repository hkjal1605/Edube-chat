<template>
  <div
    class="chat-room"
    v-chat-scroll="{
      always: false,
      smooth: true,
      scrollonremoved: true,
      notSmoothOnInit: true,
    }"
  >
    <v-btn
      v-if="showLoadLastSeen"
      text
      small
      color="primary"
      class="chat-room__load-button"
      @click.prevent="loadPreviousMessages"
      >LOAD PREVIOUS CHAT</v-btn
    >
    <div style="height: 10px"></div>
    <ul class="container__message-list" id="messages">
      <li
        v-bind:class="{
          container__message: true,
          'photo-message': chat.val.photo,
          'post-message': chat.val.post,
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
          'time-shown': showTime && showTimeNum === i,
        }"
        v-for="(chat, i) in chats"
        :key="i"
        @click="toggleShowTime(i)"
      >
        <FullScreenImg
          :key="chat.key"
          :imgUrl="chat.val.photo"
          class="container__message--image"
          v-if="chat.val.photo"
          alt="sentImage"
        />
        <span v-if="chat.val.msg" class="container__message--msg" v-linkified>{{
          chat.val.msg
        }}</span>
        <div v-if="chat.val.post" class="container__message--post">
          <div class="container__message--post--content">
            <h4 class="container__message--post--text1">POST</h4>
            <h4 class="container__message--post--text2">Click Here To View</h4>
          </div>
          <v-img
            max-width="40"
            :src="chat.val.post.crsDp"
            alt="Post Img"
            class="container__message--post--img"
            @error="onPostImgError(i)"
          />
        </div>
        <div
          v-if="showTime && showTimeNum === i"
          v-bind:class="{
            'container__message--time': true,
            'msg-time': chat.val.msg,
            'photo-time': chat.val.photo,
            'post-time': chat.val.post,
            'time-sent': chat.val.sender === myId,
            'time-recieved': chat.val.sender !== myId,
          }"
        >
          &#x25CF; {{ getTimeStr(chats[i].val.tm) }}
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
import errDp from "../../assets/logo.png";
export default {
  name: "ChatRoom",
  mixins: [chatMixin],
  components: { FullScreenImg },
  props: {
    toName: String,
    chats: Array,
    chatRoomId: String,
    showLoadLastSeen: Boolean,
  },
  data() {
    return {
      lastSeen: null,
      scrollEnabled: true,
      errDp,
      showTime: false,
      showTimeNum: undefined,
    };
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
    getTimeStr(timestamp) {
      const timeDifSec = (Date.now() - timestamp) / 1000;
      var date = new Date(timestamp);

      let timeStr = "";

      if (timeDifSec < 0) {
        timeStr = "0s";
      } else if (timeDifSec < 24 * 60 * 60) {
        const dateTimeFormat = new Intl.DateTimeFormat("en", {
          hour: "numeric",
          minute: "numeric",
          hour12: true,
        });
        const [
          { value: hour },
          ,
          { value: minute },
          ,
          { value: dayPeriod },
        ] = dateTimeFormat.formatToParts(date);

        timeStr = `${hour}:${minute} ${dayPeriod}`;
      } else {
        const dateTimeFormat = new Intl.DateTimeFormat("en", {
          year: "2-digit",
          month: "short",
          day: "2-digit",
          hour: "numeric",
          minute: "numeric",
          hour12: true,
        });
        const [
          { value: month },
          ,
          { value: day },
          ,
          { value: year },
          ,
          { value: hour },
          ,
          { value: minute },
          ,
          { value: dayPeriod },
        ] = dateTimeFormat.formatToParts(date);

        timeStr = `${day} ${month} ${year}, ${hour}:${minute} ${dayPeriod}`;
      }
      console.log("tmmm=" + timeStr);
      return timeStr;
    },
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

    loadPreviousMessages() {
      this.$parent.loadPreviousMessages();
      this.toggleShowTime();
    },

    onPostImgError(i) {
      this.chats[i].post.crsDp = this.errDp;
    },

    toggleShowTime(i) {
      if (this.showTime === true && i !== this.showTimeNum) {
        this.showTimeNum = i;
      } else {
        this.showTimeNum = i;
        this.showTime = !this.showTime;
      }
    },
  },
};
</script>

<style lang="scss">
.chat-room {
  height: 360px;
  overflow-y: auto;
  background-color: #eff3f2;

  &__load-btn {
    display: inline-block;
    margin-top: 45px;
  }
}

.container__message-list {
  margin-bottom: 0;
  padding: 0 10px;
  padding-left: 10px !important;
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
  position: relative;

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
      text-align: left;
      cursor: pointer;
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
      height: 40px;
      width: 40px;
      object-fit: cover;
      border-radius: 50%;
    }
  }

  &--time {
    position: absolute;
    font-size: 12px;
    animation: fadeIn ease 0.6s;
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

.time-shown {
  margin-bottom: 20px !important;
  transition: all 0.4s;
}

.msg-time {
  top: 30px;
}

.post-time {
  top: 66px;
}

.photo-time {
  top: 208px;
}

.time-sent {
  right: 5px;
}

.time-recieved {
  left: 5px;
}

@keyframes fadeIn {
  0% {
    opacity: 0;
    transform: translateY(-5px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
