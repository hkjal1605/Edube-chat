<template>
  <div v-bind:class="{'message-div': true, 'no-border': (imageData)}">
    <div class="image-preview" v-if="imageData">
      <v-btn class="image-preview__close-btn" color="error" fab small @click="closeImageInput()">
        <v-icon>mdi-close</v-icon>
      </v-btn>
      <v-img class="image-preview__image" max-width="250" max-height="250" :src="img1" />
      <h5 v-if="uploadStart">
        <v-progress-linear class="loader" indeterminate color="yellow"></v-progress-linear>
      </h5>
    </div>
    <div class="message-div__form-area">
      <v-btn class="message-div__image-btn" fab color="primary" small outlined @click="click1">
        <v-icon>mdi-image</v-icon>
      </v-btn>
      <input type="file" ref="input1" style="display: none" @change="previewImage" accept="image/*" />

      <input
        type="text"
        class="message-div__form--input"
        name="message"
        :placeholder="imageData ? 'Caption Image' : 'Type Text Here' "
        v-model="newMessage"
        v-on:keyup.enter="sendMessage()"
      />

      <v-btn fab small class="message-div__send-btn" @click="sendMessage">
        <v-icon>mdi-send</v-icon>
      </v-btn>
    </div>
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
        this.create(2, "both");
      } else if (this.imageData && !this.newMessage) {
        this.create(1, "image");
      } else {
        this.addMessage(1, null, this.newMessage);
      }
    },

    addMessage(unseenNumUpdate, imgPost, newMessage) {
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
          updates[
            "Edubase/chat/" + this.chatRoomId + "/chats/" + pushKey1
          ] = imgPost;

          updates[
            "Edubase/chatHistory/" + this.myId + "/" + this.chatWith.objectID
          ] = {
            userId: this.chatWith.objectID,
            name: this.chatWith.name,
            dp: this.chatWith.dp ? this.chatWith.dp : null,
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
            dp: this.chatWith.dp ? this.chatWith.dp : null,
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
        return;
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

<style lang="scss">
.message-div {
  padding-bottom: 10px;
  border-top: 2px solid #d4d4d4;
  text-align: left;
  background-color: #eff3f2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;

  &__form-area {
    width: 100%;
    display: flex;
    align-items: center;
    padding: 0 10px;
  }

  &__image-btn {
    margin-right: 10px;
  }

  &__form {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;

    &--input {
      height: 35px;
      padding: 5px 10px;
      border: none;
      outline: none;
      width: 88%;
      border-radius: 2000px;
      border: solid 2px #c8cdce;
      background-color: #f8f8f8;
      margin-right: 10px;
      color: #818181;
    }
  }

  &__send-btn {
    box-shadow: none !important;
    border: solid 2px #c8cdce !important;
    background-color: #f8f8f8 !important;
  }
}

.no-border {
  border: none;
}

.image-preview {
  padding: 15px 0;
  margin-bottom: 15px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  border-top: 2px solid #d4d4d4;
  background-color: #eff3f2;

  &__image {
    border-radius: 15px;
    margin-bottom: 10px;
  }

  &__close-btn {
    position: absolute;
    top: 5px;
    right: 5px;
  }
}

.loader {
  width: 350px;
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10000;
}
</style>