<template>
  <div class="chat-window">
    <div v-bind:class="{'chat-window__main': true, 'minimised': (minimised)}">
      <div class="chat-window__top">
        <h4 class="chat-window__top--heading">Messages</h4>
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
          <ais-index
            app-id="OU413LC7SR"
            api-key="11ed9b1e149370761f2ca223ef2b615a"
            index-name="test"
          >
            <div @click="onFocus()" v-click-outside="hideSearchResults" style="width: 80%">
              <ais-input placeholder="Search Users..."></ais-input>
            </div>
            <ais-results v-if="userShown">
              <template slot-scope="{ result }">
                <h5 class="algolia__result" @click="setChatWith(result)">
                  <ais-highlight :result="result" attribute-name="name"></ais-highlight>
                </h5>
              </template>
            </ais-results>
          </ais-index>
        </div>

        <div class="chat-history">
          <div
            class="chat-history__item"
            v-for="(user, i) in users"
            :key="i"
            @click="setChatWith(user)"
          >
            <div class="chat-history__item--user-details">
              <img :src="user.dp" alt="Dp" class="chat-history__item--dp" />
              <h4 class="chat-history__item--name">{{ user.name }}</h4>
              <span v-if="user.online === 'true'">ONLINE</span>
            </div>
            <div v-if="user.msg" class="chat-history__item--last-msg">{{ user.msg }}</div>
            <div v-if="!user.msg" class="chat-history__item--last-msg">Image</div>
          </div>
        </div>
      </div>
    </div>
    <div class="components">
      <IndividualChat v-if="chatWith[0]" :key="chatWith[0].objectID" :chatWith="chatWith[0]" />
      <IndividualChat v-if="chatWith[1]" :key="chatWith[1].objectID" :chatWith="chatWith[1]" />
    </div>
  </div>
</template>

<script>
import IndividualChat from "./IndividualChat";
import chatMixin from "../mixins/chatMixin";
export default {
  name: "ChatWindow",
  mixins: [chatMixin],
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
      userShown: false,
    };
  },
  mounted() {
    this.getChatHistory();
    this.listenUserPresence();
  },

  methods: {
    listenUserPresence() {
      this.chatWith.map((user) => {
        this.firebase
          .database()
          .ref(`Edubase/users/${user.objectID}/online`)
          .on("value", function (data) {
            if (user.online !== data.val()) {
              user.online = data.val();
            }
          });
      });
    },

    getChatHistory() {
      let userRef = this.firebase
        .database()
        .ref("Edubase/chatHistory/" + this.myId);

      let _this = this;

      this.firebase
        .database()
        .ref(".info/connected")
        .on("value", function (data) {
          if (data.val()) {
            _this.firebase
              .database()
              .ref(`Edubase/users/${_this.myId}/online`)
              .onDisconnect()
              .set("false");

            _this.firebase
              .database()
              .ref(`Edubase/users/${_this.myId}/online`)
              .set("true");
          }
        });

      userRef.on("value", function (data) {
        if (data.val()) {
          _this.users = [];

          let userObj = {};

          Object.keys(data.val()).map((key) => {
            userObj = {
              objectID: key,
              name: data.val()[key].name,
              dp: data.val()[key].dp,
              online: data.val()[key].online,
              msg: data.val()[key].msg,
              unseen: data.val()[key].unseen,
              end: data.val()[key].end,
            };

            _this.firebase
              .database()
              .ref("Edubase/users/" + key)
              .once("value", function (data2) {
                if (userObj.name !== data2.val().name) {
                  userObj.name = data2.val().name;
                }
              });
            _this.users.push(userObj);
          });

          _this.users.sort((a, b) => (a.end > b.end ? -1 : 1));
        }
      });
    },

    setChatWith(user) {
      this.userShown = false;
      if (
        this.chatWith.filter((e) => e.objectID === user.objectID).length === 0
      ) {
        if (this.chatWith.length === 2) {
          this.chatWith.shift();
          this.chatWith.push(user);
        } else {
          this.chatWith.push(user);
        }
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

    onFocus() {
      this.userShown = true;
    },

    hideSearchResults() {
      this.userShown = false;
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
  width: 300px;
  height: 400px;
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
  position: relative;
}

.chat-history {
  height: 300px;
  overflow: auto;
  margin-top: 50px;
}

.chat-history__item {
  width: 100%;
  padding: 3px;
  background-color: lightskyblue;
  margin-bottom: 3px;
}

.chat-history__item--user-details {
  display: flex;
  align-items: center;
}

.chat-history__item--dp {
  height: 40px;
  width: 40px;
  object-fit: cover;
  border-radius: 2000px;
  margin-right: 10px;
}

.chat-history__item--name {
  color: #444;
  font-size: 25px;
  font-weight: 400;
}

.chat-history__item--last-msg {
  text-align: left;
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
  height: 38px;
  align-self: flex-end;
}

.chat-window__container--top {
  padding: 5px 10px;
  width: 100%;
  background-color: #1976d2;
  position: absolute;
  top: 0;

  display: flex;
  align-items: center;
  justify-content: space-between;
}

.chat-window__container--heading {
  position: relative;
  font-size: 20px;
  font-weight: 300;
  color: #eee;
  display: flex;
  align-items: center;
}

.chat-window__container--unseen {
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

.user-list {
  width: 100%;
  padding: 10px;
  position: absolute;
  top: -50px;
  left: 50%;
  transform: translateX(-50%);
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
  font-size: 16px !important;
}

.message-input {
  width: 100%;
  position: absolute;
  bottom: 10px;
}

.components {
  display: flex;
  flex-direction: row-reverse;
  align-items: flex-end;
}

.ais-index {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: greenyellow;
}

.algolia__result {
  cursor: pointer;
}

.ais-input {
  width: 100%;
  background-color: #81ecec;
  padding: 5px 10px;
  border-radius: 2000px;
  outline: none;
  border: none;
}
</style>