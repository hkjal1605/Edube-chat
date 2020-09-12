<template>
  <div class="message-div">
    <div class="image-preview" v-if="imageData">
      <v-btn class="image-preview__close-btn" color="error" fab small @click="closeImageInput()">
        <v-icon>mdi-close</v-icon>
      </v-btn>
      <v-img class="image-preview__image" max-width="250" max-height="250" :src="img1" />
      <h5 v-if="uploadStart">
        <v-progress-linear class="loader" indeterminate color="yellow"></v-progress-linear>
      </h5>
      <!-- <v-btn v-if="!uploadStart" color="pink" @click="create">upload</v-btn> -->
    </div>
    <div class="message-div__form-area">
      <v-btn class="message-div__image-btn" fab color="primary" small @click="click1">
        <v-icon>mdi-image</v-icon>
      </v-btn>
      <input type="file" ref="input1" style="display: none" @change="previewImage" accept="image/*" />

      <input
        type="text"
        class="message-div__form--input"
        name="message"
        v-model="newMessage"
        v-on:keyup.enter="sendMessage()"
      />

      <button @click="sendMessage" class="message-div__button">
        <v-icon>mdi-send</v-icon>
      </button>
    </div>
    <span class="message-div__form--warning" v-if="warning">{{ warning }}</span>
  </div>
</template>

<script>
import chatMixin from "../mixins/chatMixin";
export default {
  name: "MessageInput",
  mixins: [chatMixin],
  props: {
    chatRoomId: String,
    chatWith: Object,
  },
  data() {
    return {
      newMessage: null,
      messages: [],
      warning: null,
      img1: null,
      imageData: null,
      uploadStart: false,
      uploadValue: null,
      imgObj: {},
    };
  },
  methods: {
    sendMessage() {
      if (this.imageData && this.newMessage) {
        console.log("both");
        this.create(2, "both");
      } else if (this.imageData && !this.newMessage) {
        console.log("image");
        this.create(1, "image");
      } else {
        console.log("message");
        this.addMessage(1, null, this.newMessage);
      }
    },

    addMessage(unseenNumUpdate, imgPost, newMessage) {
      console.log(this.chatWith);
      if (newMessage || imgPost) {
        var updates = {};

        if (this.checkUserId(this.myId, this.chatRoomId)) {
          updates[
            "Edubase/chat/" + this.chatRoomId + "/usr/0/nm"
          ] = this.myName;
          updates[
            "Edubase/chat/" + this.chatRoomId + "/usr/1/nm"
          ] = this.chatWith.name;
        } else {
          updates[
            "Edubase/chat/" + this.chatRoomId + "/usr/0/nm"
          ] = this.chatWith.name;
          updates[
            "Edubase/chat/" + this.chatRoomId + "/usr/1/nm"
          ] = this.myName;
        }

        let pushKey1 = this.getPushKey();
        let pushKey2 = this.getPushKey();

        if (imgPost) {
          console.log(this.chatWith);
          updates[
            "Edubase/chat/" + this.chatRoomId + "/chats/" + pushKey1
          ] = imgPost;

          updates[
            "Edubase/chatHistory/" + this.myId + "/" + this.chatWith.objectID
          ] = {
            userId: this.chatWith.objectID,
            name: this.chatWith.name,
            dp: this.chatWith.dp,
            online: this.chatWith.online,
            end: this.firebase.database.ServerValue.TIMESTAMP,
            msg: null,
            img: imgPost.photo,
          };

          updates[
            "Edubase/chatHistory/" +
              this.chatWith.objectID +
              "/" +
              this.myId +
              "/img"
          ] = imgPost.photo;

          updates[
            "Edubase/chatHistory/" +
              this.chatWith.objectID +
              "/" +
              this.myId +
              "/msg"
          ] = null;
        }

        if (newMessage) {
          updates["Edubase/chat/" + this.chatRoomId + "/chats/" + pushKey2] = {
            msg: newMessage,
            tm: this.firebase.database.ServerValue.TIMESTAMP,
            sender: this.myId,
          };

          updates[
            "Edubase/chatHistory/" + this.myId + "/" + this.chatWith.objectID
          ] = {
            userId: this.chatWith.objectID,
            name: this.chatWith.name,
            dp: this.chatWith.dp,
            end: this.firebase.database.ServerValue.TIMESTAMP,
            msg:
              newMessage.length > 45
                ? newMessage.substring(0, 45) + "..."
                : newMessage,
            img: null,
          };

          updates[
            "Edubase/chatHistory/" +
              this.chatWith.objectID +
              "/" +
              this.myId +
              "/img"
          ] = null;

          updates[
            "Edubase/chatHistory/" +
              this.chatWith.objectID +
              "/" +
              this.myId +
              "/msg"
          ] =
            newMessage.length > 45
              ? newMessage.substring(0, 45) + "..."
              : newMessage;
        }

        updates[
          "Edubase/chatHistory/" +
            this.chatWith.objectID +
            "/" +
            this.myId +
            "/userId"
        ] = this.chatWith.objectID;

        updates[
          "Edubase/chatHistory/" +
            this.chatWith.objectID +
            "/" +
            this.myId +
            "/name"
        ] = this.myName;

        updates[
          "Edubase/chatHistory/" +
            this.chatWith.objectID +
            "/" +
            this.myId +
            "/dp"
        ] = this.myDp;

        updates[
          "Edubase/chatHistory/" +
            this.chatWith.objectID +
            "/" +
            this.myId +
            "/end"
        ] = this.firebase.database.ServerValue.TIMESTAMP;

        this.firebase.database().ref().update(updates);

        this.firebase
          .database()
          .ref(
            "Edubase/chatHistory/" + this.chatWith.objectID + "/" + this.myId
          )
          .transaction(function (data) {
            if (data) {
              if (data.unseen) {
                data.unseen += unseenNumUpdate;
              } else {
                data.unseen = unseenNumUpdate;
              }
            }

            return data;
          });

        if (newMessage) {
          this.newMessage = null;
        }

        this.warning = null;

        let _this = this;

        this.firebase
          .database()
          .ref("Edubase/chat/" + this.chatRoomId + "/chats")
          .once("value", function (data) {
            if (
              data.val() &&
              Object.keys(data.val()).length !== _this.$parent.chats.length
            ) {
              _this.$parent.showLoadLastSeen = true;
            } else if (
              data.val() &&
              Object.keys(data.val()).length === _this.$parent.chats.length
            ) {
              _this.$parent.showLoadLastSeen = false;
            }
          });
      } else {
        this.warning = "Please enter a message to send!";
      }
    },

    create(unseenNumUpdate, dataType) {
      this.uploadStart = true;

      let pushKey = this.getPushKey();

      if (this.imgObj.flObj !== undefined) {
        const storageRef = this.firebase
          .storage()
          .ref("Edubase/chatImg/" + pushKey)
          .put(this.imgObj.flObj);

        storageRef.on(
          "state_changed",
          (snapshot) => {
            this.uploadValue =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          },
          (error) => {
            console.log(error.message);
          },
          () => {
            this.uploadValue = 100;
            storageRef.snapshot.ref.getDownloadURL().then((url) => {
              this.img1 = url;

              this.imageData = null;
              const post = {
                photo: this.img1,
                tm: this.firebase.database.ServerValue.TIMESTAMP,
                sender: this.myId,
              };

              if (dataType === "both") {
                this.addMessage(unseenNumUpdate, post, this.newMessage);
              } else {
                this.addMessage(unseenNumUpdate, post);
              }

              this.img1 = null;
              this.imageData = null;
            });
          }
        );
      }
    },

    click1() {
      this.$refs.input1.click();
    },

    previewImage(event) {
      this.imgObj = {};
      this.compressImg(event.target.files[0], this.imgObj);
      this.uploadStart = false;
      this.uploadValue = 0;
      this.img1 = URL.createObjectURL(event.target.files[0]);
      this.imageData = event.target.files[0];
    },

    closeImageInput() {
      this.imgObj = {};
      this.uploadStart = false;
      this.uploadValue = 0;
      this.img1 = null;
      this.imageData = null;
    },
  },
};
</script>

<style>
.message-div {
  text-align: left;
  position: relative;
}

.message-div__form-area {
  display: flex;
  align-items: center;
  padding: 0 10px;
}

.message-div__image-btn {
  margin-right: 10px;
}

.message-div__form {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.message-div__form--input {
  height: 30px;
  padding: 5px 10px;
  border: none;
  outline: none;
  width: 88%;
  border-radius: 2000px;
  border: solid 2px teal;
}

.message-div__form--warning {
  color: red;
}

.image-preview {
  padding: 15px 0;
  width: 94%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: absolute;
  bottom: 45px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #ff7675;
}

.loader {
  width: 350px;
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10000;
}

.image-preview__image {
  border-radius: 5px;
  margin-bottom: 10px;
}

.image-preview__close-btn {
  position: absolute;
  top: 5px;
  right: 5px;
}
</style>