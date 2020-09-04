<template>
  <div class="chat-window">
    {{ getChatHistory() }}
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
            <div @click="onFocus()">
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
      </div>
    </div>
    <div class="components">
      <div v-for="(comp, i) in component" :key="i">
        {{ resetComponentArray() }}
        <component v-if="chatWith[i] !== undefined" :is="comp" :chatWith="chatWith[i]" />
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
      userShown: false,
    };
  },

  methods: {
    getChatHistory() {
      let userRef = this.firebase
        .database()
        .ref("Edubase/chatHistory/" + this.myId);

      // let _this = this;
      userRef.on("child_changed", function (data) {
        if (data.val()) {
          console.log(data.val());
        }
      });
    },

    setChatWith(user) {
      this.userShown = false;
      if (!this.chatWith.includes(user)) {
        console.log(user);
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

    onFocus() {
      this.userShown = true;
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

.chat-window__button {
  display: inline-block;
  margin-top: 45px;
}

.user-list {
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
  font-size: 16px !important;
}

.message-input {
  width: 100%;
  position: absolute;
  bottom: 10px;
}

.components {
  display: flex;
  align-items: flex-end;
}

.algolia__result {
  cursor: pointer;
}

.ais-input {
  background-color: #81ecec;
  padding: 5px 10px;
  border-radius: 2000px;
  outline: none;
  border: none;
}
</style>