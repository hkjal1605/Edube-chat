<template>
  <div class="home-page">
    <v-btn @click="onLogoutClick()">Logout</v-btn>
    <div v-if="isNewUser">New User</div>
    <div style="height: 100%; width: 100%; overflow-y: auto">
      <div style="height: 1000px; width: 100%; background: grey">Scrolable</div>
    </div>
    <div class="toggle-button">
      <ChatWindow v-if="myId" />
    </div>
  </div>
</template>


<script>
import ChatWindow from "./chat/ChatWindow";
export default {
  name: "HomePage",
  components: { ChatWindow },
  data() {
    return {
      authListenerUnsubscribe: null,
      isNewUser: false,
    };
  },
  mounted() {
    let _this = this;

    _this.$store.commit("updateUsrLoadingStatus", true);

    //listens to userAuthState
    this.authListenerUnsubscribe = this.firebase
      .auth()
      .onAuthStateChanged(function (user) {
        if (user) {
          // User is signed in.

          let myId = user.uid;
          _this.$store.commit("updateMyId", myId);

          _this.firebase
            .database()
            .ref("/Edubase/users/" + myId)
            .on("value", function (userSnap) {
              _this.$store.commit("cleanUserDetailsExceptId");

              if (!userSnap.val()) {
                //new user

                _this.isNewUser = true;

                _this.$store.commit("updateUsrLoadingStatus", false);

                return;
              } else {
                _this.isNewUser = false;
              }

              _this.$store.commit("updateMyUserDetails", userSnap);
            });
        } else {
          // No user is signed in.
          _this.$store.commit("updateMyId", null);

          _this.$router.replace({
            name: "Login",
          });
          return;
        }
      });
  },

  computed: {
    getMemberStatus() {
      return this.$store.getters.getMemberStatus;
    },
  },
  methods: {
    onLogoutClick() {
      this.firebase
        .auth()
        .signOut()
        .then(function () {
          // Sign-out successful.
          //no need to redirect here as auth listener already attached in homePage
        })
        .catch(function (error) {
          // An error happened.

          console.error("signoutError=", error);
        });
    },
  },
  beforeDestroy() {
    this.firebase
      .database()
      .ref("/Edubase/users/" + this.myId)
      .off();

    this.firebase
      .database()
      .ref("/Edubase/usrDetails/" + this.myId + "/revokeTime")
      .off();

    this.firebase
      .database()
      .ref("/Edubase/usrCourses/" + this.myId)
      .off();

    if (this.authListenerUnsubscribe != null) {
      this.authListenerUnsubscribe();
    }
  },
};
</script>

<style>
.home-page {
  height: 100vh;
  position: relative;
}

.toggle-button {
  position: absolute;
  bottom: -4px;
  right: 20px;
}
</style>
