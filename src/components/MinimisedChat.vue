<template>
  <div class="chat-window__container minimisedChatRoom">
    <div class="chat-window__container--top">
      {{ chatWith.usrDetails.name}}
      <v-btn
        class="chat-window__container--close-btn"
        color="error"
        fab
        small
        @click="closeChatRoom()"
      >
        <v-icon>mdi-close</v-icon>
      </v-btn>
      <v-btn
        class="chat-window__container--minimise-btn"
        color="error"
        fab
        small
        @click="minimiseChatRoom()"
      >
        <v-icon>mdi-minus</v-icon>
      </v-btn>
    </div>
  </div>
</template>

<script>
export default {
  name: "MinimisedChat",
  props: {
    chatWith: Object,
  },
  data() {
    return {};
  },
  methods: {
    closeChatRoom() {
      let tempArray = this.$parent.chatWith;
      const index = tempArray.indexOf(this.chatWith);
      if (index > -1) {
        this.$parent.chatWith.splice(index, 1);
      }
      console.log(this.$parent.chatWith);
    },

    minimiseChatRoom() {
      this.$parent.resetTempVar(this.chatWith.usrId);
    },
  },
};
</script>