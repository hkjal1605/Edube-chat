<template>
  <div class="bgColorGrey containerDiv">
    1235467890, 1235467891.... otp-123456
    <v-snackbar v-model="snackbar" :timeout="1200" :top="true">
      {{snackbarMsg}}
      <template v-slot:action="{ attrs }">
        <v-btn dark text v-bind="attrs" @click="snackbar = false">Close</v-btn>
      </template>
    </v-snackbar>
    <div id="level1Div">
      <div style="position: absolute; top: 16px; right: 16px; z-index: 100">
        <v-menu offset-y>
          <template v-slot:activator="{ on }">
            <v-icon color="blue darken-2" style="cursor: pointer" v-on="on">mdi-information-outline</v-icon>
          </template>

          <v-card style="padding: 4px 0" tile>
            <div class="menuItem" @click="onAboutUsClick()">About us</div>
          </v-card>
        </v-menu>
      </div>
      <v-card class="card" height="550px" width="90%" max-width="1000px" color="#eff3f2">
        <div style="display: flex; flex-direction: row; height: 100%; ">
          <div id="imgDiv">
            <v-img
              :contain="true"
              max-height="95%"
              width="100%"
              :src="require('../assets/imgs/login_bg.png')"
              @load="isBgImgLoaded=true"
            />
          </div>
          <div :class="[isBgImgLoaded ?  'bgLoadedDiv' : 'bgLoadingDiv' ]">
            <div style=" width: 50%; height: 50%; margin-left: auto; margin-right: auto;">
              <img
                style="height: 100%;width: 100%"
                :src="require('../assets/logos/edube_vert.png')"
              />
            </div>
            <div :style="{ display: showOtpInput ? 'inline' : 'none' }">
              <div style="text-align: left; margin-left: 20px">
                Verification Code has been sent to
                <a
                  @click="showOtpInput=false; msg=''"
                >{{getIntlNo}}</a>
              </div>
              <div class="mobileNoDiv">
                <input
                  v-on:keyup.enter="onOtpSubmitClicked()"
                  class="mobInput"
                  type="text"
                  placeholder="Verification Code"
                  v-model="otp"
                />
              </div>

              <div style="margin-top: 10px">
                <v-btn
                  :loading="isSubmitInProgress"
                  @click="onOtpSubmitClicked()"
                  id="loginBtn"
                  rounded
                  color="primary"
                  dark
                >Submit</v-btn>
              </div>
            </div>
            <div :style="{ display: showOtpInput ? 'none' : 'inline' }">
              <div class="mobileNoDiv">
                <div>+91</div>

                <input
                  v-on:keyup.enter="onLoginClick()"
                  class="mobInput"
                  type="text"
                  placeholder="Phone number"
                  v-model="mobTxtInput"
                />
              </div>

              <div style="text-align: left; margin-left: 20px">
                <b-form-checkbox v-model="rememberMe">Remember me</b-form-checkbox>
              </div>

              <div style="margin-top: 10px">
                <v-btn
                  :loading="isLoginInProgress"
                  @click="onLoginClick()"
                  id="loginBtn"
                  rounded
                  color="primary"
                  dark
                >Login</v-btn>
              </div>

              <div id="recaptcha" style="margin-top: 10px;  margin-left: 10px;"></div>
            </div>
            <div style="color: red">{{msg}}</div>
          </div>
        </div>
      </v-card>
    </div>
  </div>
</template>

<style scoped>
.menuItem {
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  height: 45px;
  padding: 0 16px 0 16px;
}

.menuItem:hover {
  background: #e3eeef;
}

.card {
  border-radius: 12px;
  margin: auto;
}
#level1Div {
  display: flex;
  overflow: auto;
  padding: 16px 0 16px 0;

  height: 100%;
  width: 100%;
}
.containerDiv {
  height: 100%;
  width: 100%;
  position: fixed;
}
.bgLoadingDiv {
  display: none;
}
.bgLoadedDiv {
  width: 40%;
  display: flex;
  flex-direction: column;
  padding-top: 3%;
}

#imgDiv {
  height: 100%;
  width: 60%;

  margin: 10px 0 20px 0;
}
#loginBtn {
  padding: 0 50px 0 50px;
}

.mobileNoDiv {
  margin: 1em;
  border-radius: 2em;
  background-color: #f9f9f9;
  border: 1px solid #b7b7b6;
  display: flex;
  padding: 8px;
}
</style>
<style >
.mobInput {
  padding-left: 10px;
  width: 90%;
  border-width: 0px;
  outline: 0;
  -webkit-appearance: none;
  box-shadow: none;
  -moz-box-shadow: none;
  -webkit-box-shadow: none;
}
</style>

<script>
import { BFormCheckbox } from "bootstrap-vue/src/components/form-checkbox";
export default {
  components: {
    BFormCheckbox,
  },
  data() {
    return {
      mobTxtInput: "",
      rememberMe: true,
      msg: "",
      otp: "",
      showOtpInput: false,
      snackbar: false,
      snackbarMsg: "",
      isBgImgLoaded: false,

      isSubmitInProgress: false,
      isLoginInProgress: false,

      authListenerUnsubscribe: null,
    };
  },
  mounted() {
    let _this = this;
    this.authListenerUnsubscribe = this.firebase
      .auth()
      .onAuthStateChanged(function (user) {
        if (user) {
          // User is signed in.
          _this.$router.replace({
            name: "HomePage",
          });
        }
      });
  },
  watch: {
    showOtpInput(currVal) {
      const myNode = document.getElementById("recaptcha");
      myNode.innerHTML = "";

      if (!currVal) {
        window.recaptchaVerifier = null;
        this.otp = "";
      }
    },
  },
  computed: {
    getIntlNo() {
      return "+91" + this.mobTxtInput;
    },
  },
  methods: {
    onAboutUsClick() {
      window.open("/about", "_blank");
    },
    sendOtp() {
      console.log("sendOtp");

      var phoneNumber = this.getIntlNo;
      var appVerifier = window.recaptchaVerifier;
      this.snackbar = false;
      let _this = this;

      var persistence = "";
      if (this.rememberMe) {
        persistence = this.firebase.auth.Auth.Persistence.LOCAL;
      } else {
        persistence = this.firebase.auth.Auth.Persistence.SESSION;
      }

      this.firebase
        .auth()
        .setPersistence(persistence)
        .then(function () {
          _this.firebase
            .auth()
            .signInWithPhoneNumber(phoneNumber, appVerifier)
            .then(function (confirmationResult) {
              // SMS sent. Prompt user to type the code from the message, then sign the
              // user in with confirmationResult.confirm(code).
              console.log("firebase");
              _this.snackbarMsg = "Verification code sent";

              _this.snackbar = true;
              window.confirmationResult = confirmationResult;
            })
            .catch(function (error) {
              // Error; SMS not sent
              _this.showOtpInput = false;
              if (error.code == "auth/invalid-phone-number") {
                _this.msg = "Invalid phone no!!!";
              }
              if (error.code == "auth/too-many-requests") {
                _this.msg =
                  "Too many request on this phone no. Please try after some time.";
              }
              if (error.code == "auth/internal-error") {
                _this.snackbarMsg = "Something went wrong";
                _this.snackbar = true;
              }
              _this.isLoginInProgress = false;

              console.error("mError=", error.code);
            });
        })
        .catch(function (error) {
          // Handle Errors here.
          _this.isLoginInProgress = false;

          var errorCode = error.code;
          var errorMessage = error.message;
          console.error("error ", errorCode, errorMessage);
        });
    },
    onLoginClick() {
      this.msg = "";

      this.isLoginInProgress = true;
      let _this = this;

      let firebase = this.firebase;

      if (window.recaptchaVerifier) return;
      window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier(
        "recaptcha",
        {
          callback: (/*response*/) => {
            // reCAPTCHA solved, allow signInWithPhoneNumber.

            console.log("callback");
            _this.isLoginInProgress = false;
            this.showOtpInput = true;
            this.onCaptchaVerified();
          },
          "expired-callback": () => {
            // Response expired. Ask user to solve reCAPTCHA again.
            _this.isLoginInProgress = false;
            console.error("expiredCallbck");
            this.msg = "Captcha Expired. Please try again.";
          },
        }
      );
      this.sendOtp();
    },
    onOtpSubmitClicked() {
      // When original phone no is used instead of sample phone no
      if (this.isSubmitInProgress) return;
      let _this = this;
      this.isSubmitInProgress = true;
      var code = this.otp;
      window.confirmationResult
        .confirm(code)
        .then(function (/*result*/) {
          // User signed in successfully.
          _this.isSubmitInProgress = false;

          //Auth listener automatically redirects to HomePage
        })
        .catch(function (error) {
          // User couldn't sign in (bad verification code?)
          if (error.code == "auth/invalid-verification-code") {
            _this.msg = "Invalid verification code";
          }
          _this.isSubmitInProgress = false;

          console.error("submit error=", error);
        });
    },
  },
  beforeDestroy() {
    window.recaptchaVerifier = null;

    if (this.authListenerUnsubscribe != null) {
      this.authListenerUnsubscribe();
    }
  },
};
</script>