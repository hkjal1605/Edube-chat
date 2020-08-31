<template>
  <div class="mega-chat-container">
    <v-btn class="purple" color="primary" @click="changeContainerClass()">
      <v-icon>mdi-message-text</v-icon>
    </v-btn>
    <ChatWindow
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

.v-menu__content {
  overflow-y: hidden !important;
}

.hidden {
  display: none;
}

.shown {
  display: block;
}
</style>

