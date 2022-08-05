<template>
  <div>
    <h1>用户中心</h1>
    <div ref='drag' id="drag">
      <input type="file" name="file" @change="handleFileChange">
    </div>
  </div>
</template>

<script>
export default {
  data(){
    return {
      file:null
    }
  },
  computed:{

  },
  methods:{
    handleFileChange(e){
      const [file] = e.target.files
      if(!file) return 
      this.file = file
    }
  }
}
</script>