import Vue from 'vue';
import App from './App.vue';
import Vuetify from 'vuetify/lib';
import 'vuetify/dist/vuetify.min.css';

import router from './routes';
import { store } from './store';

import './assets/css/globalStyle.css';

import 'bootstrap/dist/css/bootstrap.min.css';

import '@mdi/font/css/materialdesignicons.css';

import 'vue-material/dist/vue-material.min.css';

import linkify from 'vue-linkify';

Vue.directive('linkified', linkify);

import VueTextareaAutosize from 'vue-textarea-autosize';
Vue.use(VueTextareaAutosize);

import 'viewerjs/dist/viewer.min.css';
import Viewer from 'v-viewer';

Vue.use(Viewer);

Vue.use(Vuetify);

var firebase = require('firebase/app');
require('firebase/auth');
require('firebase/functions');
require('firebase/database');
require('firebase/storage');

Vue.config.productionTip = false;

let CONFIG = require('./config')


var firebaseConfig = CONFIG.firebaseConfig

firebase.initializeApp(firebaseConfig);

//for file upload drag and drop
Vue.filter('kb', val => {
	return Math.floor(val / 1024);
});

Vue.mixin({
	data: function () {
		return {
			firebase: firebase,
			CONFIG: CONFIG
		};
	},

	computed: {
		myId() {
			return this.$store.state.myId;
		},
		myName() {
			return this.$store.state.myName;
		},
		myDp() {
			if (this.$store.state.myDp) {
				return this.$store.state.myDp;
			} else {
				return null;
			}
		},
		myClgId() {
			return this.$store.state.myClgId;
		}
	},
	methods: {
		getPushKey() {
			let reservedWords = [
				'-USSR-',
				'LIKE-',
				'docs',
				'tuts',
				'-POST-',
				'-SOL-',
				'-QRRY-'
			];
			let pushKey = this.firebase
				.database()
				.ref()
				.push().key;

			for (let i = 0; i < reservedWords.length; i++) {
				let word = reservedWords[i];
				if (pushKey.indexOf(word) >= 0) {
					return this.getPushKey();
				}
			}
			return pushKey;
		}
	}
});

new Vue({
	render: h => h(App),
	router: router,
	store: store,
	vuetify: new Vuetify({
		icons: {
			iconfont: 'mdi'
		}
	})
}).$mount('#app');
