<template>
  {{$t("FeedbackInfo")}}
  <br>
  <form>
  <Textarea v-model="description" rows="5" style="width:100%"/>
  <div class="p-field-checkbox">
    <Checkbox id="checkConfig" v-model="sendConfig" :binary="true" value="true"></Checkbox>
    <label for="checkConfig">{{$t("IncludeConfig")}}</label>
  </div>
  <Button :label="$t('send')" @click="sendFeedback"></Button>
    </form>
</template>

<script>
export default {
  name: "Feedback",
  data() {
    return {
      sendConfig: false,
      description: ""
    }
  },
  methods: {
    async sendFeedback() {
      let csv = "NONE"
      if (this.sendConfig) {
        csv = this.Store.createCSVcontent();
      }

      const gResponse = await fetch("https://doctorbn-backend.herokuapp.com/sendFeedback", {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          description: this.description,
          csv: csv
        })
      });
      const response = await gResponse;
      console.log(response)
    }
  }
}
</script>

<style scoped>

</style>