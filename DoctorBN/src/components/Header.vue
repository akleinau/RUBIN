<template>
  <el-menu mode="horizontal">
    <el-menu-item> Reset</el-menu-item>
    <el-menu-item> Load Patient</el-menu-item>
    <el-menu-item> Save Patient</el-menu-item>
    <el-submenu>
      <template #title>Settings</template>
      <el-menu-item>change color theme</el-menu-item>
      <el-menu-item>change font size</el-menu-item>
      <el-menu-item>change language</el-menu-item>
    </el-submenu>
    <el-menu-item> back to network selection</el-menu-item>
  </el-menu>

</template>

<script>
export default {
  name: "Header"
}
</script>

<style scoped>

</style>