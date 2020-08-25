<template>
  <div>
    <v-btn @click="onLogoutClick()">Logout</v-btn>
    <div v-if="isNewUser">New User</div>
  </div>
</template>


<script>
export default {
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
