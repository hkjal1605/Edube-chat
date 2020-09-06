import Compressor from "compressorjs";

export default {
  methods: {
    checkUserId(userId, chatRoomId) {
      return userId === chatRoomId.split("-CHAT-")[0];
    },

    setLastSeen(time, chatRoomId, userNum) {
      this.firebase
        .database()
        .ref("Edubase/chat/" + chatRoomId + "/usr/" + userNum)
        .update({ ls: time });
    },

    resetUnseenNumber(chatWith) {
      this.firebase
        .database()
        .ref("Edubase/chatHistory/" + this.myId + "/" + chatWith.objectID)
        .transaction(function(data) {
          if (data) {
            data.unseen = 0;
          }
          return data;
        });
    },

    compressImg(origFile, imgObj) {
      new Compressor(origFile, {
        quality: 0.8,
        maxWidth: 1000,
        maxHeight: 1000,
        convertSize: 200000, //convert png to jpg if size > 0.2Mb(200kb)

        success(result) {
          console.log("rzzlt=", result);
          imgObj.localUrl = URL.createObjectURL(result); //localUrl can be displayed in <img />
          imgObj.flObj = result;
        },
        error(err) {
          imgObj.localUrl = URL.createObjectURL(origFile);
          imgObj.flObj = origFile;

          console.error("img compression error=", err.message);
        },
      });
    },
  },
};
