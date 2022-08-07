<template>
  <div>
    <h1>用户中心</h1>
    <div ref='drag' id="drag">
      <input type="file" name="file" @change="handleFileChange">
    </div>
    <div>
      <el-button @click="uploadFile">上传</el-button>
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
	async mounted(){
    // const res = await this.$http.get('/user/info')
  },
  methods:{
    handleFileChange(e){
      const [file] = e.target.files
      if(!file) return 
      this.file = file
    },
    async uploadFile(){
			const form = new FormData()
      form.append('name','file')
      form.append('file',this.file)
      const res = await this.$http.post('/uploadfile',form,{
        onUploadProgress:progress=>{
          this.uploadProgress = Number(((progress.loaded/progress.total)*100).toFixed(2))
        }
      })
      console.log(res)
		}
  }
}
</script>
<style lang="stylus">
#drag
  height 100px
  line-height 100px
  border 2px dashed #eee
  text-align center 
</style>