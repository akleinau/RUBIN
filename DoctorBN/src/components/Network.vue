<template>
  <TabView>
    <TabPanel header="Causal explanation">
      <img src="../assets/Argumentation.png">
    </TabPanel>
    <TabPanel header="compact network">
      <img src="../assets/compactNet.png">
    </TabPanel>
    <TabPanel header="full network">
      <img src="../assets/fullNet.png">
    </TabPanel>
  </TabView>
</template>

<script>
export default {
  name: "Network"
}
</script>

<style scoped>
img {
  height: 100%;
}
</style>