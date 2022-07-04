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

export const http = service
