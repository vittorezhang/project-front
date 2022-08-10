<template>
  <div>
    <h1>用户中心</h1>
    <div ref='drag' id="drag">
      <input type="file" name="file" @change="handleFileChange">
    </div>
		<div>
      <el-progress :stroke-width='20' :text-inside="true" :percentage="uploadProgress" ></el-progress>
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
      file:null,
			// uploadProgress:0,
			chunks:[]
    }
  },
  computed:{
		uploadProgress(){
      
    }
  },
	async mounted(){
    // const res = await this.$http.get('/user/info')
		this.bindEvents()
  },
  methods:{
		async isGif(file){
      
    },
		async isImage(file){
      // 通过文件流来判定
      // 先判定是不是gif
      return await this.isGif(file)
    },
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
		},
		bindEvents(){
      const drag = this.$refs.drag
      drag.addEventListener('dragover',e=>{
        drag.style.borderColor = 'red'
        e.preventDefault()
      })
      drag.addEventListener('dragleave',e=>{
        drag.style.borderColor = '#eee'
        e.preventDefault()
      })
      drag.addEventListener('drop',e=>{
        const fileList = e.dataTransfer.files
        drag.style.borderColor = '#eee'
        this.file = fileList[0]


        e.preventDefault()

        // const e.dataTrans
      })
    },
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