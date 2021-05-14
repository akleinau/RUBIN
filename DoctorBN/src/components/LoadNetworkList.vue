<template>
  <div>
    <h4>Select a network</h4>
    <form action="/openNetwork" method="POST" id="selectNetForm">
      <select form = "selectNetForm">
      {% for network in netList %}
        <option value = {{network[0]}}>{{network[2]}}</option>
      {% endfor %}
    </select>
    </form>

  </div>
</template>

<script>
export default {
  name: "LoadNetworkList"
}
</script>

<style scoped>

</style>