<template>
  <div class="kkb-container">
    <VirtualList :listData="articles" :estimatedItemSize="300" v-slot="slotProps">
  	</VirtualList>
  </div>
</template>

<script>
import VirtualList from '~/components/VirtualList.vue'

export default {
  components:{
    VirtualList
  },
  data(){
    return {

    }
  },
  async mounted(){
    
  }
}
</script>

<style>

</style>
