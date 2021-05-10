<template>
  <h2> additional information</h2>
<el-tabs tab-position="right">
  <el-tab-pane label="Network description">
    <div>Hi</div>
  </el-tab-pane>
  <el-tab-pane label="pubmed">
    <div>Hi</div>
  </el-tab-pane>
   <el-tab-pane label="How can I change the outcome?">
    <div>Hi</div>
  </el-tab-pane>
   <el-tab-pane label="Compare">
    <div>Hi</div>
  </el-tab-pane>
   <el-tab-pane label="Send feedback">
    <div>Hi</div>
  </el-tab-pane>
</el-tabs>
</template>

<script>
export default {
name: "additional"
}
</script>

<style scoped>
#additional {
  background-color: white;
   height: 90%;
  width: 100%
}

div {
  height: 90%;
  background-color: white
}

el-tab-pane {
  width: 10px
}
</style>