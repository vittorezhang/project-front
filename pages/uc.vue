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
		async blobToString(blob){
      return new Promise(resolve=>{
        const reader = new FileReader()
        reader.onload = function(){
          console.log(reader.result)
          const ret = reader.result.split('')
                        .map(v=>v.charCodeAt())
                        .map(v=>v.toString(16).toUpperCase())
                        // .map(v=>v.padStart(2,'0'))
                        .join('')
          resolve(ret)
          // const ret = reader.
        }
        reader.readAsBinaryString(blob)
      })
    },
		async isPng(file){
      const ret = await this.blobToString(file.slice(0,8))
      const ispng = (ret == "89 50 4E 47 0D 0A 1A 0A")
      return ispng
    },
		async isJpg(file){
      const len = file.size
      const start = await this.blobToString(file.slice(0,2))
      const tail = await this.blobToString(file.slice(-2,len))
      const isjpg = (start=='FF D8') && (tail=='FF D9')
      return isjpg
    },
		async isGif(file){
      // GIF89a 和GIF87a
      // 前面6个16进制，'47 49 46 38 39 61' '47 49 46 38 37 61'
      // 16进制的转换
      const ret = await this.blobToString(file.slice(0,6))
      const isGif = (ret=='47 49 46 38 39 61') || (ret=='47 49 46 38 37 61')
      return isGif
    },
		async isImage(file){
      // 通过文件流来判定
      // 先判定是不是gif
      return await this.isGif(file)
    },
		createFileChunk(file,size=CHUNK_SIZE){
      const chunks = [] 
      let cur = 0
      while(cur<this.file.size){
        chunks.push({index:cur, file:this.file.slice(cur,cur+size)})
        cur+=size
      }
      return chunks
    },
    handleFileChange(e){
      const [file] = e.target.files
      if(!file) return 
      this.file = file
    },
    async uploadFile(){
			// if(!await this.isImage(this.file)){
      //   console.log('文件格式不对')
      // }else{
      //   console.log('格式正确')
      // }
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