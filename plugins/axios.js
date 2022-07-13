import Vue from 'vue'
import axios from 'axios'
let service = axios.create({
  timeout:5000,
  // 前缀
  baseURL:'/api'
})

const TOKEN_KEY = 'KKB_USER_TOKEN'
// 请求拦截
// 主要做token的管理
Vue.prototype.$http =service

// 请求拦截
service.interceptors.request.use(
	config=>{
		// 请求加token
		const token = window.localStorage.getItem(TOKEN_KEY)
		// 设置url白名单
		if(token){
			config.headers.common['Authorization'] = 'Bearer '+token
		}
		return config
	},
	err=>{
		return Promise.reject(err)
	}
)

// 响应拦截
service.interceptors.response.use(
	async response=>{
		let {data} = response
		return data
	}
)

export const http = service
