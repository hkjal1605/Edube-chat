<template>
  <div class="chat-window">
    {{ resetComponentArray() }}
    {{ checkUserChanges() }}
    <div v-bind:class="{ 'chat-window__main': true, minimised: minimised }">
      <div class="chat-window__top">
        <h4 class="chat-window__top--heading">
          Messages
          <div
            class="chat-window__top--unseen-notif"
            v-if="minimised && showUnseen"
          ></div>
        </h4>

        <v-btn
          class="chat-window__top--minimise-btn"
          color="transparent"
          fab
          small
          @click="minimiseChatWindow()"
        >
          <v-icon color="#dee2e1" v-if="!minimised">mdi-chevron-down</v-icon>
          <v-icon color="#dee2e1" v-if="minimised">mdi-chevron-up</v-icon>
        </v-btn>
      </div>
      <div class="chat-window__user-list">
        <div class="user-list">
          <div
            class="user-list__search-box"
            @click="onFocus()"
            v-click-outside="hideSearchResults"
            style="width: 100%"
          >
            <h5 class="user-list__search-box--placeholder">To:</h5>
            <input
              class="user-list__search-box--input"
              v-model="queryString"
              v-on:input="searchUsers"
            />
          </div>
          <div
            class="user-list__results"
            v-show="queryString.length > 0 && userShown"
          >
            <div
              class="user-list__user"
              v-for="(user, i) in searchResults"
              :key="user.objectID"
              @click="setChatWith(user)"
            >
              <v-img
                max-width="40"
                max-height="40"
                :src="user.dp"
                :lazy-src="user.dp"
                :alt="user.name"
                class="user-list__user--dp"
                @error="onAlgoliaImgError(i)"
              />
              <h3 class="user-list__user--name">{{ user.name }}</h3>
            </div>
          </div>
        </div>

        <div class="chat-history">
          <h5 class="chat-history__title">Messages:</h5>
          <div
            class="chat-history__item"
            v-for="(user, i) in users"
            :key="i"
            @click="setChatWith(user)"
          >
            {{ user }}
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
                  <v-row
                    class="fill-height ma-0"
                    align="center"
                    justify="center"
                  >
                    <v-progress-circular
                      indeterminate
                      color="grey lighten-5"
                    ></v-progress-circular>
                  </v-row>
                </template>
              </v-img>

              <div class="chat-history__item--text-part">
                <h4 class="chat-history__item--name">{{ user.name }}</h4>
                <div
                  v-if="user.msg && user.sender === myId"
                  class="chat-history__item--last-msg"
                >
                  You: {{ user.msg }}
                </div>
                <div
                  v-if="user.msg && user.sender !== myId"
                  class="chat-history__item--last-msg"
                >
                  {{ user.name.split(" ")[0] }}: {{ user.msg }}
                </div>
                <div
                  v-if="!user.msg && user.sender === myId"
                  class="chat-history__item--last-msg"
                >
                  You: Image
                </div>
                <div
                  v-if="!user.msg && user.sender !== myId"
                  class="chat-history__item--last-msg"
                >
                  {{ user.name.split(" ")[0] }}: Image
                </div>
              </div>
              <div class="chat-history__item--unseen-num" v-if="user.unseen">
                {{ user.unseen }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    {{ chatWith }}
    <IndividualChat
      class="individual-chat-1"
      v-if="chatWith[0]"
      :key="chatWith[0].objectID"
      :chatWith="chatWith[0]"
      :chat-position="1"
    />
    <IndividualChat
      :class="{
        'individual-chat-2': true,
        'chat-1-minimised': chatComponentMinimised,
      }"
      v-if="chatWith[1]"
      :key="chatWith[1].objectID"
      :chatWith="chatWith[1]"
      :chat-position="2"
    />
  </div>
</template>

<script>
import IndividualChat from "./IndividualChat";
import chatMixin from "../../mixins/chatMixin";
import errDp from "../../assets/logo.png";

import algoliasearch from "algoliasearch";

const client = algoliasearch("OU413LC7SR", "11ed9b1e149370761f2ca223ef2b615a");
const index = client.initIndex("test");

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
      showUnseen: false,
      minimised: false,
      userShown: false,
      errDp: errDp,
      index,
      queryString: "",
      searchResults: [],
      chatComponentMinimised: false,
      chatComponentTwoMinimised: false,
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

    this.users.map((user) => {
      this.firebase
        .database()
        .ref(`Edubase/users/${user.objectID}/online`)
        .off();
    });
  },

  methods: {
    searchUsers() {
      this.index
        .search(this.queryString, {
          facetFilters: [`clg: ${this.myClgId}`],
        })
        .then(({ hits }) => {
          this.searchResults = hits;
        });
    },

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

          let totalUnseen = 0;

          Object.keys(data.val()).map((key) => {
            userObj = {
              objectID: key,
              name: data.val()[key].name,
              dp: data.val()[key].dp,
              online: data.val()[key].online,
              msg: data.val()[key].msg,
              unseen: data.val()[key].unseen,
              end: data.val()[key].end,
              sender: data.val()[key].sender,
            };

            totalUnseen += data.val()[key].unseen;
            if (totalUnseen) {
              _this.showUnseen = true;
            } else {
              _this.showUnseen = false;
            }
            _this.users.push(userObj);
          });

          _this.users.sort((a, b) => (a.end > b.end ? -1 : 1));
        }
      });
    },

    setChatWith(user) {
      console.log("yes4");
      this.userShown = false;

      if (
        this.chatWith.filter((e) => e.objectID === user.objectID).length === 0
      ) {
        console.log("if1", user);
        if (this.chatWith.length === 2) {
          console.log("if2");
          this.chatWith.shift();
          this.chatWith.push(user);
        } else {
          console.log("if3");
          this.chatWith.push(user);
        }

        console.log("chat", this.chatWith);
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

    onAlgoliaImgError(i) {
      this.searchResults[i].dp = this.errDp;
    },
  },
};
</script>

<style lang="scss">
.chat-window {
  position: relative;

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
      display: flex;
      align-items: center;
    }

    &--unseen-notif {
      margin-left: 3px;
      height: 12px;
      width: 12px;
      border-radius: 200px;
      background-color: #55efc4;
    }

    &--minimise-btn {
      height: 28px !important;
      width: 28px !important;
      box-shadow: none !important;
    }
  }

  &__main {
    width: 300px;
    height: 400px;
    overflow: hidden;
    border-radius: 15px 15px 2px 2px;
    margin-left: 15px;

    transition: all 0.3s;
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

    &--text-part {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: center;
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

    &--unseen-num {
      margin-left: auto;
      height: 20px;
      width: 20px;
      background-color: #b53471;
      border-radius: 200px;
      color: #eee;
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

    &--input {
      width: 100%;
      padding: 5px 10px;
      outline: none;
      border: none;
    }
  }

  &__results {
    max-height: 200px;
    overflow-y: auto;
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

.individual-chat-1 {
  position: absolute;
  bottom: 0;
  right: 310px;
}

.individual-chat-2 {
  position: absolute;
  bottom: 0;
  right: 702px;
}

.chat-1-minimised {
  right: 600px;
}
</style>