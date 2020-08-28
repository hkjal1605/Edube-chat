export default {
  methods: {
    checkUserId(userId, chatRoomId) {
      return userId === chatRoomId.split("-CHAT-")[0];
    },
  },
};
