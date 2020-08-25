import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export const store = new Vuex.Store({
	state: {
		memberStatus: null,
		myId: null,
		myName: null,
		myDp: null,
		myFullImg: null,
		myQuote: null,
		myClgId: null,
		usrLoading: true
	},
	getters: {
		getMemberStatus: state => {
			return state.memberStatus;
		}
	},
	mutations: {
		updateMemberStatus: (state, newStatus) => {
			state.memberStatus = newStatus;
		},
		updateUsrLoadingStatus: (state, bool) => {
			state.usrLoading = bool;
		},
		updateMyId: (state, usrId) => {
			state.myId = usrId;
		},
		cleanUserDetailsExceptId: state => {
			state.myName = null;
			state.myDp = null;
			state.myFullImg = null;
			state.myQuote = null;
			state.myClgId = null;
		},
		updateMyUserDetails: (state, userSnap) => {
			state.myName = userSnap.val().name;
			state.myDp = userSnap.val().dp;
			state.myFullImg = userSnap.val().fullImg;
			state.myQuote = userSnap.val().quote;
			state.myClgId = userSnap.val().clg;

			state.usrLoading = false;
		}
	}
});
