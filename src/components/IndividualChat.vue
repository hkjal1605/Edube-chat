<template>
  <div class="chat-window__container" v-if="chatRoomId">
    <div class="chat-window__container--top">{{ chatWith.usrDetails.name}}</div>
    <v-btn
      text
      small
      color="primary"
      class="chat-window__button"
      @click="loadPreviousMessages"
    >LOAD PREVIOUS CHAT</v-btn>
    <ChatRoom v-if="chats.length > 0" :chats="chats" :chatRoomId="chatRoomId" />
    <MessageInput class="message-input" :chatRoomId="chatRoomId" :chatWith="chatWith" />
  </div>
</template>

