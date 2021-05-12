<template>
  <TabView>
    <TabPanel header="Causal explanation">
      <img v-if="target !== null" src="../assets/Argumentation.png">
      <div v-else>Please specify a target.</div>
    </TabPanel>
    <TabPanel header="compact network">
      <img v-if="target !== null" src="../assets/compactNet.png">
      <div v-else>Please specify a target.</div>
    </TabPanel>
    <TabPanel header="full network">
      <img src="../assets/fullNet.png">
    </TabPanel>
  </TabView>

</template>

<script>
export default {
  name: "Network",
  props: ['target']
}
</script>

<style scoped>
img {
  height: 100%;
}
</style>