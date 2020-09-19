<template>
  <div class="chat-window">
    {{ resetComponentArray() }}
    {{ checkUserChanges() }}
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
            <div
              class="user-list__search-box"
              @click="onFocus()"
              v-click-outside="hideSearchResults"
              style="width: 100%"
            >
              <h5 class="user-list__search-box--placeholder">To:</h5>
              <ais-input></ais-input>
            </div>
            <div class="user-list__results" v-if="userShown">
              <ais-results v-if="userShown">
                <template slot-scope="{ result }">
                  <div class="user-list__user" @click="setChatWith(result)">
                    <img
                      v-if="result.dp"
                      :src="result.dp"
                      class="user-list__user--dp"
                      alt="User-dp"
                    />
                    <img v-if="!result.dp" :src="errDp" class="user-list__user--dp" alt="User-dp" />
                    <h5 class="user-list__user--name">
                      {{result.name}}
                      <!-- <ais-highlight :result="result" attribute-name="name"></ais-highlight> -->
                    </h5>
                  </div>
                </template>
              </ais-results>
            </div>
          </ais-index>
        </div>

        <div class="chat-history">
          <h5 class="chat-history__title">Messages:</h5>
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
                :src="user.dp ? user.dp : errDp"
                :lazy-src="user.dp"
                alt="Dp"
                @error="onImgError(i)"
                class="chat-history__item--dp"
              >
                <template v-slot:placeholder>
                  <v-row class="fill-height ma-0" align="center" justify="center">
                    <v-progress-circular indeterminate color="grey lighten-5"></v-progress-circular>
                  </v-row>
                </template>
              </v-img>

              <div class="chat-history__item--text-part">
                <h4 class="chat-history__item--name">{{ user.name }}</h4>
                <div v-if="user.msg" class="chat-history__item--last-msg">{{ user.msg }}</div>
                <div v-if="!user.msg" class="chat-history__item--last-msg">Image</div>
              </div>
            </div>
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
import errDp from "../assets/logo.png";
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
      errDp: errDp,
    };
  },
  mounted() {
    this.getChatHistory();
    this.listenUserPresence();
    // this.checkUserChanges();
  },
  beforeDestroy() {
    this.firebase
      .database()
      .ref("Edubase/chatHistory/" + this.myId)
      .off();

    this.users.map((user) => {
      this.firebase
        .database()
        .ref(`Edubase/users/${user.objectID}/online`)
        .off();
    });
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
      this.userShown = false;

      if (
        this.chatWith.filter((e) => e.objectID === user.objectID).length === 0
      ) {
        if (this.chatWith.length === 2) {
          this.chatWith.shift();
          this.chatWith.push(user);
        } else {
          console.log(user);
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

    onImgError(i) {
      this.users[i].dp = this.errDp;
      console.log(this.users[i]);
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
  height: 310px;
  overflow: auto;
  margin-top: 50px;
  padding: 10px;
  border-top: 2px solid #d4d4d4;
  background-color: #eff3f2;

  &__title {
    font-size: 15px;
    font-weight: 600;
    color: #333;
    text-align: left;
    margin-bottom: 0;
  }

  &__item {
    width: 100%;
    padding: 8px 3px;
    border-bottom: 2px solid #d4d4d4;
    cursor: pointer;

    transition: all 0.6s;

    &:hover {
      background-color: #d4d4d4;
      border-radius: 3px;
    }

    &--user-details {
      display: flex;
      align-items: center;
    }

    &--dp {
      z-index: 0 !important;
      height: 40px !important;
      width: 40px !important;
      object-fit: cover !important;
      border-radius: 2000px !important;
      margin-right: 10px !important;
    }

    &--name {
      font-size: 18px;
      font-weight: 400;
      margin-bottom: 0;
    }

    &--last-msg {
      text-align: left;
      color: #666;
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
  z-index: 100;
  background-color: #eff3f2;

  &__search-box {
    display: flex;
    align-items: center;

    &--placeholder {
      font-size: 15px;
      font-weight: 600;
      color: #333;
      text-align: left;
      margin-bottom: 0;
    }
  }

  &__results {
    width: 101%;
    padding: 5px;
    border-radius: 5px;
    background-color: #e1e4e5;
    box-shadow: 0 3px 5px rgba(0, 0, 0, 0.3);
    margin-top: 11px;
  }

  &__heading {
    color: teal;
  }

  &__user {
    padding: 5px 10px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    cursor: pointer;

    transition: all 0.6s;

    &:hover {
      background-color: #d4d4d4;
      border-radius: 3px;
    }

    &--dp {
      width: 40px;
      height: 40px;
      object-fit: cover;
      border-radius: 50%;
      margin-right: 10px;
    }

    &--name {
      font-size: 20px;
      font-weight: 500;
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
}

.ais-input {
  width: 100%;
  padding: 5px 10px;
  outline: none;
  border: none;
}
</style>