<template>
  <MegaMenu :model="items"/>
</template>

<script>
export default {
  name: "Header",
  data() {
    return {
      items: [
        {
          label: 'Reset'
        },
        {
          label: 'Load Patient'
        },
        {
          label: 'Save Patient'
        },
        {
          label: 'Settings',
          items: [{label: 'change theme'}, {label: 'change language'}]
        },
        {
          label: 'back'
        }
      ]
    }
  }
}
</script>

<style scoped>

</style>