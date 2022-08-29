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