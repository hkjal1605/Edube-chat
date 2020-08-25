<template>
	<div id="app">
		<v-app>
			<router-view></router-view>
		</v-app>
	</div>
</template>

<script>
export default {
	name: 'App',
};
</script>

<style>
#app {
	font-family: Avenir, Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: center;
	color: #2c3e50;
	font-family: 'Montserrat', sans-serif;
	/* margin-top: 60px; */
}
/* width */
::-webkit-scrollbar {
	width: 10px;
}

/* Track */
::-webkit-scrollbar-track {
	box-shadow: inset 0 0 5px transparent;
	border-radius: 5px;
}

/* Handle */
::-webkit-scrollbar-thumb {
	background: #707070;
	border-radius: 5px;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
	background: #5a5a5a;
}
</style>
