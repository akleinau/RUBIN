<template>
  If the network classified a case incorrectly, please send it as feedback. <br>
  <form>
  <Textarea v-model="value" rows="5" style="width:100%"/>
  <div class="p-field-checkbox">
    <Checkbox id="checkConfig" v-model="sendConfig" :binary="true" value="true"></Checkbox>
    <label for="checkConfig">Include network configuration</label>
  </div>
  <Button label="Send"></Button>
    </form>
</template>

<script>
export default {
  name: "Feedback",
  data() {
    return {
      sendConfig: false
    }
  }
}
</script>

<style scoped>

</style>