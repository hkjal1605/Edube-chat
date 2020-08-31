<template>
  <v-menu
    transition="slide-x-transition"
    :top="true"
    :offset-x="true"
    :left="true"
    :close-on-content-click="false"
  >
    <template v-slot:activator="{ on, attrs }">
      <v-btn class="purple" color="primary" dark v-bind="attrs" v-on="on">
        <v-icon>mdi-message-text</v-icon>
      </v-btn>
    </template>
    <ChatWindow />
  </v-menu>
</template>

<script>
import ChatWindow from "./ChatWindow";
export default {
  name: "ToggleChatButton",
  components: { ChatWindow },
  data() {
    return {};
  },
};
</script>

<style>
.v-menu__content {
  overflow-y: hidden !important;
}
</style>

