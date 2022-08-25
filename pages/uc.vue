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
		 <div>
      <p>计算hash的进度</p>
      <el-progress :stroke-width='20' :text-inside="true" :percentage="hashProgress" ></el-progress>
    </div>

		<div>
      <!-- chunk.progress 
      progress<0 报错 显示红色
      == 100 成功
      别的数字 方块高度显示 -->
      <!-- 尽可能让方块看起来仕真方形
      比如10各方块 4*4
      9 3*3
      100 10*10 -->

      <div class="cube-container" :style="{width:cubeWidth+'px'}">
        <div class="cube" v-for="chunk in chunks" :key="chunk.name">
          <div
            :class="{
              'uploading':chunk.progress>0&&chunk.progress<100,
              'success':chunk.progress==100,
              'error':chunk.progress<0
            }"
            :style="{height:chunk.progress+'%'}"
          >
            <i class="el-icon-loading" style="color:#f56c6c" v-if="chunk.progress<100 && chunk.progress>0"></i>
          </div>
        </div>
      </div>
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
			hashProgress:0,
			chunks:[]
    }
  },
  computed:{
		cubeWidth(){
      return  Math.ceil(Math.sqrt(this.chunks.length))*16
    },
    uploadProgress(){
      if(!this.file || this.chunks.length){
        return 0
      }
      const loaded = this.chunks.map(item=>item.chunk.size*item.progress)
                        .reduce((acc,cur)=>acc+cur,0)
      return parseInt(((loaded*100)/this.file.size).toFixed(2))
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
		async sendRequest(chunks,limit=4){

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
		async mergeRequest(){
      const ret = await this.$http.post('/mergefile',{
        ext:this.file.name.split('.').pop(),
        size:CHUNK_SIZE,
        hash:this.hash
      })
      const url = ret.data.url
      // await this.$http.put('/user/info',{url:"/api"+url})
    },
    handleFileChange(e){
      const [file] = e.target.files
      if(!file) return 
      this.file = file
    },
     async uploadFile(){

      if(!this.file){
        return 
      }



      // console.log(this.file)
      // if(!await this.isImage(this.file)){
      //   console.log('文件格式不对')
      // }else{
      //   console.log('格式正确')
      // }
      const chunks = this.createFileChunk(this.file)
      // const hash = await this.calculateHashWorker()
      // const hash1 = await this.calculateHashIdle()
      // console.log('文件hash',hash)
      // console.log('文件hash1',hash1)
      const hash = await this.calculateHashSample()
      this.hash = hash

      // 问一下后端，文件是否上传过，如果没有，是否有存在的切片
      const {data:{uploaded, uploadedList}} = await this.$http.post('/checkfile',{
        hash:this.hash,
        ext:this.file.name.split('.').pop()
      })
      if(uploaded){
        // 秒传
        return this.$message.success('秒传成功')
      }
      // console.log('文件hash2',hash2)
      // 两个hash配合
      // 抽样hash 不算全量
      // 布隆过滤器 损失一小部分的精度，换取效率
      
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
      // await this.uploadChunks(uploadedList)

    },
		async uploadChunks(uploadedList=[]){
			const requests = this.chunks
        .filter(chunk=>uploadedList.indexOf(chunk.name)==-1)
        .map((chunk,index)=>{
          // 转成promise
          const form = new FormData()
          form.append('chunk',chunk.chunk)
          form.append('hash',chunk.hash)
          form.append('name',chunk.name)
          form.append('index',chunk.index)
          return {form, index:chunk.index,error:0}
        })
        .map(({form,index})=> this.$http.post('/uploadfile',form,{
          onUploadProgress:progress=>{
            // 不是整体的进度条了，而是每个区块有自己的进度条，整体的进度条需要计算
            this.chunks[index].progress = Number(((progress.loaded/progress.total)*100).toFixed(2))
          }
        }))
      // @todo 并发量控制 
      // 尝试申请tcp链接过多，也会造成卡顿
      // 异步的并阿叔控制，
      // await Promise.all(requests)

      await this.sendRequest(requests)
      await Promise.all(requests)
			await this.mergeRequest()
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
.cube-container
  .cube
    width 14px
    height 14px
    line-height 12px
    border  1px black solid
    background #eee
    float  left
    >.success
      background green
    >.uploading
      background blue
    >.error
      background red
</style>