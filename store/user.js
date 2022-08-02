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

  },
  SET_USER(state,user){
    
  },
  LOGOUT(state){
   
  }
}

const actions = {
 
}

export default {
  namespace:true,
  state,
  mutations,
  actions
}