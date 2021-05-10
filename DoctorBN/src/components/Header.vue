<template>
  <w-toolbar shadow>
    <w-button class="mr12" text>
      Reset
    </w-button>
    <w-button class="mr12" text>
      Load patient
    </w-button>
    <w-button class="mr12" text>
      Save patient
    </w-button>
    <w-menu>
      <template #activator="{ on }">
        <w-button class="mr12" v-on="on" text>
          Settings
        </w-button>
      </template>
      change color theme
    </w-menu>

    <w-button class="mr12" text>
      back to network selection
    </w-button>
  </w-toolbar>


</template>

<script>
export default {
  name: "Header",
}
</script>

<style scoped>

</style>