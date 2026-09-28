import App from './App'
import MallPrice from './components/MallPrice.vue'

// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'
Vue.config.productionTip = false
Vue.component('MallPrice', MallPrice)
App.mpType = 'app'
const app = new Vue({
	...App
})
app.$mount()
// #endif

// #ifdef VUE3
import {
	createSSRApp
} from 'vue'
export function createApp() {
	const app = createSSRApp(App)
	app.component('MallPrice', MallPrice)
	return {
		app
	}
}
// #endif
