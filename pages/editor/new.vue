<template>
  <div>
    <div class="write-btn">
      <el-button @click="submit" type='primary'>提交</el-button>
    </div>
    <el-row>
      <el-col :span='12'>
        <!-- markdown编辑器的基本操作 -->
        <textarea ref="editor" class="md-editor" :value="content" @input="update" ></textarea>
      </el-col>
      <el-col :span='12'>
        <div class="markdown-body" v-html="compiledContent"></div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import marked from 'marked'

export default {
  data(){
    return {
      // timer:
      content:`# 开课吧${String(Math.random()).slice(2,6)}
* 上课
* 吃饭
* 写代码

\`\`\`javascript

  let a =1;
  console.log(a)
\`\`\`
      `
      
    }
  },
  mounted(){
    this.timer = null
    this.bindEvents()
    marked.setOptions({
      rendered: new marked.Renderer()
    })
  },
  computed:{
    compiledContent(){
      return marked(this.content, {})
    }
  },
  methods:{
		bindEvents(){
      this.$refs.editor.addEventListener('paste',async e=>{
        const files = e.clipboardData.files
        console.log(files)
        // 直接上传
      })
      this.$refs.editor.addEventListener('drop', async e=>{
        const files = e.dataTransfer.files
        console.log(files)
        // @todo 文件上传
        e.preventDefault()
      })
    },
    update(e){
      clearTimeout(this.timer)
      this.timer = setTimeout(()=>{
        this.content = e.target.value
      },350)
    },
		async submit(){
      // 文章列表，点赞，关注，草稿
      // user =》 aticle  一对多
      let ret = await this.$http.post('/article/create', {
        content:this.content, //  selected:false
        compiledContent:this.compiledContent // 显示只读取这个
      })
      if(ret.code==0){
        this.$notify({
          title:'创建成功',
          type:'success',
          message:`文章《${ret.data.title}》创建成功`
        })
        setTimeout(()=>{
          this.$router.push({ path:'/article/'+ret.data.id})
        })
      }
    }
  }
}
</script>

<style>
.md-editor{
  width:100%;
  height:100vh;
  outline: none;
}
.write-btn{
  position: fixed;
  z-index:100;
  right:30px;
  top:10px;
}
</style>