<template>
  <div class="chat-window">
    {{ resetComponentArray() }}
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
              <v-img
                max-width="40"
                max-height="40"
                :src="user.dp"
                :lazy-src="user.dp"
                alt="Dp"
                class="chat-history__item--dp"
              />
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
      minimised: false,
      userShown: false,
    };
  },
  mounted() {
    this.getChatHistory();
    this.listenUserPresence();
  },
  beforeDestroy() {
    this.firebase
      .database()
      .ref("Edubase/chatHistory/" + this.myId)
      .off();
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

            _this.users.push(userObj);
          });

          _this.users.sort((a, b) => (a.end > b.end ? -1 : 1));
        }
      });
    },

    setChatWith(user) {
      this.checkUserChanges();
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
      if (!this.showContainer && this.chatWith.length) {
        this.chatWith = [];
      }
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

    checkUserChanges() {
      let _this = this;

      if (this.users.length) {
        this.users.map((userObj) => {
          this.firebase
            .database()
            .ref(`Edubase/users/${userObj.objectID}`)
            .once("value", function (data) {
              if (userObj.name !== data.val().name) {
                userObj.name = data.val().name;

                _this.firebase
                  .database()
                  .ref(`Edubase/chatHistory/${_this.myId}/${userObj.objectID}`)
                  .update({ name: data.val().name });
              }
            });
        });
      }
    },
  },
};
</script>

<style lang="scss">
.chat-window {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  flex-direction: row-reverse;

  &__top {
    padding: 5px 10px;
    width: 100%;
    background-color: #1976d2;
    display: flex;
    align-items: center;
    justify-content: space-between;

    &--heading {
      color: #eee;
      font-size: 20px;
      margin: 0;
      font-weight: 300;
    }

    &--minimise-btn {
      height: 28px !important;
      width: 28px !important;
    }
  }

  &__heading {
    color: teal;
    font-size: 40px;
    font-weight: normal;
  }

  &__main {
    width: 300px;
    height: 400px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
    overflow: hidden;
    border-radius: 15px 15px 2px 2px;
    margin-left: 15px;
  }

  &__user-list {
    width: 100%;
    position: relative;
  }
}

.minimised {
  height: 38px;
  overflow: hidden;
}

.chat-history {
  height: 300px;
  overflow: auto;
  margin-top: 50px;

  &__item {
    width: 100%;
    padding: 3px;
    background-color: lightskyblue;
    margin-bottom: 3px;

    &--user-details {
      display: flex;
      align-items: center;
    }

    &--dp {
      height: 40px !important;
      width: 40px !important;
      object-fit: cover !important;
      border-radius: 2000px !important;
      margin-right: 10px !important;
    }

    &--name {
      color: #444;
      font-size: 25px;
      font-weight: 400;
    }

    &--last-msg {
      text-align: left;
    }
  }
}

.user-list {
  width: 100%;
  padding: 10px;
  position: absolute;
  top: -50px;
  left: 50%;
  transform: translateX(-50%);

  &__heading {
    color: teal;
  }
  &__user {
    cursor: pointer;
    padding: 4px 10px;
    display: flex;
    align-items: center;
    margin-bottom: 3px;

    &--img {
      height: 30px;
      width: 30px;
      object-fit: cover;
      border-radius: 50%;
      margin-right: 15px;
    }
    &--name {
      font-size: 16px !important;
    }
  }
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