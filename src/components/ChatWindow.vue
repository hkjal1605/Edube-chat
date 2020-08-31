<template>
  <div class="chat-window">
    <div>
      <div class="chat-window__top">
        <h4 class="chat-window__top--heading">Messages</h4>
      </div>
      {{ checkUnseenMessages() }}
      <div class="chat-window__main">
        <div class="chat-window__user-list">
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
              <span
                class="user-list__user--name"
                v-if="user.usrId != myId"
              >{{ user.usrDetails.name }}</span>
              <span
                class="user-list__last-msg"
                v-if="lastMsg && lastMsg[user.usrId]"
              >{{ lastMsg[user.usrId].msg }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="components">
      <div v-for="(comp, i) in component" :key="i">
        <component :is="comp" :chatWith="chatWith" />
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
      chats: [],
      users: [],
      chatWith: null,
      chatRoomId: null,
      lastMsg: undefined,
      arrayOfKeys: [],
      previousMessages: [],
      component: [],
    };
  },
  mounted() {
    this.component = [];

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
  },
  methods: {
    setChatWith(user) {
      this.chatWith = user;
      this.component.push(IndividualChat);
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
  },
};
</script>

<style>
.chat-window {
  width: 300px;
  height: 400px;
  text-align: left;
  /* border-radius: 40px;
  overflow: hidden; */
  box-shadow: 2px 5px 12px rgba(0, 0, 0, 0.5);

  position: relative;
}

.chat-window__top {
  padding: 5px 10px;
  width: 100%;
  background-color: #1976d2;
  position: absolute;
  top: 0;
}

.chat-window__top--heading {
  color: #eee;
  font-size: 20px;
  margin: 0;
  font-weight: 300;
}

.chat-window__heading {
  color: teal;
  font-size: 40px;
  font-weight: normal;
}

.chat-window__main {
  display: flex;
}

.chat-window__user-list {
  width: 100%;
}

.chat-window__container {
  box-shadow: 2px 5px 12px rgba(0, 0, 0, 0.5);
  height: 450px;
  width: 400px;
  text-align: center;
  position: absolute;
  top: -50px;
  left: -415px;
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