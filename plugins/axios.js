import Vue from 'vue'
import axios from 'axios'
let service = axios.create({
  timeout:5000,
  // 前缀
  baseURL:'/api'
})

// 请求拦截
// 主要做token的管理
Vue.prototype.$http =service

// 响应拦截
service.interceptors.response.use(
	async response=>{
		let {data} = response
		return data
	}
)

export const http = service
