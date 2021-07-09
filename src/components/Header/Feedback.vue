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
  emits: ["sendFeedback"],
  data() {
    return {
      sendConfig: false,
      description: ""
    }
  },
  methods: {
    sendFeedback() {

      this.$emit("sendFeedback", this.description, this.sendConfig)

    }
  }
}
</script>

<style scoped>

</style>