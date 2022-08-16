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
import sparkMD5 from 'spark-md5'
const CHUNK_SIZE = 10*1024*1024
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
		async calculateHashWorker(){
      return new Promise(resolve=>{
        this.worker = new Worker('/hash.js')
        this.worker.postMessage({chunks:this.chunks})
        this.worker.onmessage = e=>{
          const {progress,hash} = e.data
          this.hashProgress = Number(progress.toFixed(2))
          if(hash){
            resolve(hash)
          }
        }
      })
    },
		async calculateHashSample(){
			// 布隆过滤器  判断一个数据存在与否
			return new Promise(resolve=>{
				const spark = new sparkMD5.ArrayBuffer()
        const reader = new FileReader()

        const file = this.file
        const size = file.size
        const offset = 2*1024*1024
        // 第一个2M，最后一个区块数据全要
				let chunks = [file.slice(0,offset)]

        let cur = offset
        while(cur<size){
          if(cur+offset>=size){
            // 最后一个区快
            chunks.push(file.slice(cur, cur+offset))

          }else{
            // 中间的区块
            const mid = cur+offset/2
            const end = cur+offset
            chunks.push(file.slice(cur, cur+2))
            chunks.push(file.slice(mid, mid+2))
            chunks.push(file.slice(end-2, end))
          }
          cur+=offset
        }
				// 中间的，取前中后各2个字节
				reader.readAsArrayBuffer(new Blob(chunks))
        reader.onload = e=>{
          spark.append(e.target.result)
          this.hashProgress = 100
          resolve(spark.end())
        }
			})
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
			this.chunks = this.createFileChunk(this.file)
      const hash = await this.calculateHashWorker()
			const hash1 = await this.calculateHashSample()
      console.log('文件hash',hash)
      console.log('文件hash1',hash1)
			// 问一下后端，文件是否上传过，如果没有，是否有存在的切片
      const {data:{uploaded, uploadedList}} = await this.$http.post('/checkfile',{
        hash:this.hash,
        ext:this.file.name.split('.').pop()
      })
      if(uploaded){
        // 秒传
        return this.$message.success('秒传成功')
      }
			this.chunks = chunks.map((chunk,index)=>{
        // 切片的名字 hash+index
        const name = hash +'-'+ index
        return {
          hash,
          name,
          index,
          chunk:chunk.file,
          // 设置进度条，已经上传的，设为100
          progress:uploadedList.indexOf(name)>-1 ?100:0
        }
      })
      await this.uploadChunks(uploadedList)
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
		async uploadChunks(uploadedList=[]){

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