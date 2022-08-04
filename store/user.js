import { http } from "../plugins/axios"


const state = ()=>({
  token:'',
  id:'',
  email:"",
  nickname:"",
  avatar:''
})


const mutations = {
  SET_TOKEN(state, token){
    state.token = token
  },
  SET_USER(state,user){
    state.id = user._id
    state.email = user.email
    state.nickname = user.nickname
    state.avatar = user.avatar
  },
  LOGOUT(state){
    state.id = ''
    state.email = ''
    state.nickname = ''
    state.avatar = ''
    state.token  = ''
  }
}

const actions = {
  login: async({state,commit}, data)=>{
    
  },
  detail: async({state,commit}, data)=>{
   
  }
}

export default {
  namespace:true,
  state,
  mutations,
  actions
}