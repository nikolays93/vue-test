import Vue from "vue"
import element from "./components/element.vue"

window.element = new Vue({
	el: '#app',
	data: {
		test: 1,
	},
	render: h => h(element)
});