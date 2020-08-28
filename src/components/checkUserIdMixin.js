export default {
  methods: {
    checkUserId(userId, chatRoomId) {
      return userId === chatRoomId.split("-chat-")[0];
    },
  },
};
