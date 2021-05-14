<template>
  <div>
    <h4>Select a network</h4>
    <select>
      {% for network in netList %}
        <option value = {{network[0]}}>{{network[2]}}</option>
      {% endfor %}
    </select>
  </div>
</template>

<script>
export default {
  name: "LoadNetworkList"
}
</script>

<style scoped>

</style>