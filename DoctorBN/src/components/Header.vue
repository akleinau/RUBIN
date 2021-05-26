<template>
  <Menubar :model="items"/>
  <div id="logo">DoctorBN</div>
</template>

<script>
export default {
  name: "Header",
  data() {
    return {
      items: [
        {
          label: 'Reset',
          command: () => {
            this.reset()
          }
        },
        {
          label: 'Load Patient'
        },
        {
          label: 'Save Patient',
          command: () => {
            this.exportCSV()
          }
        },
        {
          label: 'Settings',
          items: [{label: 'change theme'}, {label: 'change language'}]
        },
        {
          label: 'back to network selection',
          command: () => {
            this.changePage()
          }
        }
      ]
    }
  },
  methods: {
    changePage() {
      this.$emit('changePage')
    },
    reset() {
      this.$emit('reset')
    },
    exportCSV() {
      this.$emit('exportCSV')
    }
  }
}
</script>

<style scoped>

#logo {
  position: absolute;
  top: 1%;
  left: 90%;
  font-size: 2em;
  color: teal
}

</style>