<template>
  -- feedback form not working yet -- <br>
  If the network classified a case incorrectly, please send it as feedback. <br>
  <form>
    <Textarea v-model="value" rows="5" style="width:100%"/>
    <div class="p-field-checkbox">
      <Checkbox id="checkConfig" v-model="sendConfig" :binary="true" value="true"></Checkbox>
      <label for="checkConfig">Include network configuration</label>
    </div>
    <Button label="Send" @click="test()"></Button>
  </form>
</template>

<script>
export default {
  name: "Feedback",
  data() {
    return {
      sendConfig: false
    }
  },
  methods: {
    async test() {
      const gResponse = await fetch(process.env.TRUSTIFI_URL + '/api/i/v1/email', {
        method: 'POST',
        headers: {
          'x-trustifi-key': process.env.TRUSTIFI_KEY,
          'x-trustifi-secret': process.env.TRUSTIFI_SECRET
        },
        json: {"recipients": [{"email": process.env.MAIL}], "title": "Test", "html": "Hello Anna"}
      });
      let nodeDict = await gResponse.json();
      console.log(nodeDict)

    }
  }
}
</script>

<style scoped>

</style>