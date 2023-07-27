<template>
  {{ $t("FeedbackInfo") }}
  <br> <br>
  <form>
     {{ $t("FeedbackProblemDescription") }}:
    <Textarea v-model="description" rows="5" class="w-full mt-2 mb-2"/>
    {{ $t("FeedbackMail") }}:
    <InputText v-model="mail" class="w-full mt-2 mb-2"/>
    <div class="p-field-checkbox">
      <Checkbox id="checkConfig" v-model="sendConfig" :binary="true" value="true"></Checkbox>
      <label class="ml-2" for="checkConfig">{{ $t("IncludeConfig") }}</label>
    </div>
    <Button class="mt-2" :label="$t('send')" @click="sendFeedback" data-umami-event="button-send-feedback"></Button>
  </form>
</template>

<script>
import {useStore} from '@/store'

export default {
  name: "send-feedback",
  emits: ["sendFeedback"],
  setup() {
    const Store = useStore()
    return {Store}
  },
  data() {
    return {
      sendConfig: true,
      description: "",
      mail: ""
    }
  },
  methods: {
    /**
     * sends feedback to backend to be saved in database
     *
     * @returns {Promise<void>}
     */
    async sendFeedback() {
      const address = "https://doctorbn-backend.herokuapp.com/"
      //const address = "http://127.0.0.1:5000/"
      let csv = "NONE"
      if (this.sendConfig) {
        csv = this.Store.createCSVcontent();
      }

      const gResponse = await fetch(address + "sendFeedback", {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          description: this.description,
          csv: csv,
          mail: this.mail
        })
      });
      const response = await gResponse;
      console.log(response)
      this.$emit("sendFeedback")
    }
  }
}
</script>

<style scoped>

</style>