export default {
  methods: {
    setLastSeen(time, chatRoomId, userNum) {
      this.firebase
        .database()
        .ref("Edubase/chat/" + chatRoomId + "/usr/" + userNum)
        .update({ ls: time });
    },

    resetUnseenNumber(chatWith) {
      this.firebase
        .database()
        .ref("Edubase/chatHistory/" + this.myId + "/" + chatWith.usrId)
        .transaction(function(data) {
          if (data) {
            data.unseen = 0;
          }

          return data;
        });
    },
  },
};
