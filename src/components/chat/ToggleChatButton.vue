<template>
  <div class="mega-chat-container">
    <v-btn fab large class="toggle-chat-button" @click="changeContainerClass()">
      <v-icon>mdi-message-text</v-icon>
    </v-btn>
    <ChatWindow
      v-if="myId"
      v-bind:class="{'shown': (showContainer), 'hidden': (!showContainer)}"
      :showContainer="showContainer"
    />
  </div>
</template>

<script>
import ChatWindow from "./ChatWindow";
export default {
  name: "ToggleChatButton",
  components: { ChatWindow },
  data() {
    return {
      showContainer: false,
    };
  },
  methods: {
    changeContainerClass() {
      this.showContainer = !this.showContainer;
    },
  },
};
</script>

<style>
.mega-chat-container {
  display: flex;
  align-items: flex-end;
  flex-direction: row-reverse;
  position: relative;
}

.toggle-chat-button {
  margin-bottom: 25px;
  margin-left: 10px;
}

.v-menu__content {
  overflow-y: hidden !important;
}

.hidden {
  visibility: hidden;
  opacity: 0;
}

.shown {
  visibility: visible;
  opacity: 1;
}
</style>

