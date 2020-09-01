<template>
  <div class="chat-window">
    <div v-bind:class="{'chat-window__main': true, 'minimised': (minimised)}">
      <div class="chat-window__top">
        <h4 class="chat-window__top--heading">Messages({{lastMsg}})</h4>
        <v-btn
          class="chat-window__top--minimise-btn"
          color="error"
          fab
          small
          @click="minimiseChatWindow()"
        >
          <v-icon>mdi-minus</v-icon>
        </v-btn>
      </div>
      <div class="chat-window__user-list" v-if="!minimised">
        <div class="user-list">
          <div
            class="user-list__user"
            v-for="user in users"
            :key="user.usrId"
            @click="setChatWith(user)"
          >
            <img
              :src="user.usrDetails.dp"
              alt="User"
              class="user-list__user--img"
              v-if="user.usrId != myId"
            />
            <span class="user-list__user--name" v-if="user.usrId != myId">{{ user.usrDetails.name }}</span>
            <span
              class="user-list__last-msg"
              v-if="lastMsg && lastMsg[user.usrId]"
            >{{ lastMsg[user.usrId].msg }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="components">
      <div v-for="(comp, i) in component" :key="i">
        {{ resetComponentArray() }}
        <component
          :key="tempVar"
          v-if="chatWith[i] !== undefined"
          :is="comp"
          :chatWith="chatWith[i]"
        />
      </div>
    </div>
  </div>
</template>

<script>
import IndividualChat from "./IndividualChat";
import checkUserIdMixin from "../mixins/checkUserIdMixin";
export default {
  name: "ChatWindow",
  mixins: [checkUserIdMixin],
  components: { IndividualChat },
  props: {
    showContainer: Boolean,
  },
  data() {
    return {
      users: [],
      chatWith: [],
      lastMsg: undefined,
      component: [],
      minimised: false,
      tempVar: true,
    };
  },
  mounted() {
    let userRef = this.firebase.database().ref("Edubase/users/");

    let _this = this;
    userRef.on("value", function (data) {
      Object.keys(data.val()).map((key) => {
        _this.users.push({
          usrId: key,
          usrDetails: data.val()[key],
        });
      });
    });

    this.checkUnseenMessages();
  },
  methods: {
    setChatWith(user) {
      if (!this.chatWith.includes(user)) {
        this.chatWith.push(user);
        this.component.push(IndividualChat);
      }
    },

    resetComponentArray() {
      if (!this.showContainer) {
        this.component = [];
        this.chatWith = [];
      }
    },

    checkUnseenMessages() {
      let ref = this.firebase
        .database()
        .ref("Edubase/chatHistory/" + this.myId);

      let _this = this;

      ref.on("child_changed", function (data) {
        _this.lastMsg = data.val().msg;
      });
    },

    minimiseChatWindow() {
      this.minimised = !this.minimised;
    },
  },
};
</script>

<style>
.chat-window {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  flex-direction: row-reverse;
  /* border-radius: 40px;
  overflow: hidden; */
}

.chat-window__top {
  padding: 5px 10px;
  width: 100%;
  background-color: #1976d2;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.chat-window__top--heading {
  color: #eee;
  font-size: 20px;
  margin: 0;
  font-weight: 300;
}

.chat-window__top--minimise-btn {
  height: 28px !important;
  width: 28px !important;
}

.chat-window__heading {
  color: teal;
  font-size: 40px;
  font-weight: normal;
}

.chat-window__main {
  width: 250px;
  height: 300px;
  box-shadow: 2px 5px 12px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  border-radius: 5px;
  margin-left: 10px;
}

.minimised {
  height: 38px;
  overflow: hidden;
}

.chat-window__user-list {
  width: 100%;
}

.chat-window__container {
  box-shadow: 2px 5px 12px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  border-radius: 5px;
  height: 450px;
  width: 400px;
  text-align: center;
  margin-left: 10px;

  position: relative;
}

.minimisedChatRoom {
  height: 40px;
}

.chat-window__container--top {
  padding: 5px 10px;
  width: 100%;
  background-color: #1976d2;
  position: absolute;
  top: 0;
  color: #eee;
  font-size: 20px;
  font-weight: 300;
}

.chat-window__container--close-btn {
  height: 28px !important;
  width: 28px !important;
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
}

.chat-window__container--minimise-btn {
  height: 28px !important;
  width: 28px !important;
  position: absolute;
  right: 45px;
  top: 50%;
  transform: translateY(-50%);
}

.chat-window__button {
  display: inline-block;
  margin-top: 45px;
}

.user-list {
  margin-top: 30px;
  padding: 10px;
}
.user-list__heading {
  color: teal;
}
.user-list__user {
  cursor: pointer;
  padding: 4px 10px;
  display: flex;
  align-items: center;
  margin-bottom: 3px;
}
.user-list__user--img {
  height: 30px;
  width: 30px;
  object-fit: cover;
  border-radius: 50%;
  margin-right: 15px;
}
.user-list__user--name {
  font-size: 16px;
}

.message-input {
  width: 100%;
  position: absolute;
  bottom: 10px;
}

.components {
  display: flex;
}
</style>