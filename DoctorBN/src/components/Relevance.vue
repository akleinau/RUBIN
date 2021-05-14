<template>

    <div v-if="onlyGlobal">
      <img src="../assets/globalRelevance.png">
      <Button label="show more" @click="onlyGlobal=false"></Button>
    </div>
    <div v-if="!onlyGlobal">
      <img src="../assets/localRelevance.png">
      <Button label="show less" @click="onlyGlobal=true"></Button>
    </div>

</template>

<script>
export default {
  name: "Relevance",
  data() {
    return {
      onlyGlobal: true
    }
  }
}
</script>

<style scoped>
#relevance {
  background-color: white;

}

img {
  width: 100%;
}


</style>