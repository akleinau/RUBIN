<template>
  <Dialog v-if="i === 0" v-model:visible="display" position="bottom" header="Desired Outcomes" :closable="false">
    A bayesian network consists of different nodes. Choose here which nodes you want to have a specific value.
    <br>
    Eg: set 'survival' to yes, 'therapy' to no, ...
    <template #footer>
      <Button class="p-mx-2 p-button-secondary" icon="pi pi-times" label="close tutorial" @click="close"></Button>
      <Button class="p-mx-2" label="prev" @click="prev"></Button>
      <Button class="p-mx-2" label="next" @click="next"></Button>
    </template>
  </Dialog>
  <Dialog v-if="i === 1" v-model:visible="display" position="bottom" header="Evidence" :closable="false">
    Choose which variables are already set to a value. This will typically be your evidence and what you already
    know about the patient.
    <template #footer>
      <Button class="p-mx-2 p-button-secondary" icon="pi pi-times" label="close tutorial" @click="close"></Button>
      <Button class="p-mx-2" label="prev" @click="prev"></Button>
      <Button class="p-mx-2" label="next" @click="next"></Button>
    </template>
  </Dialog>
  <Dialog v-if="i === 2" v-model:visible="display" position="bottom" header="options" :closable="false">
    Choose which variables you can change. <br>
    Eg: Therapy, medication, smoking, ... <br> <br>
    The network will then calculate the best combination of these interventions to achieve your desired outcomes.
    Select one to get additional information.
    <template #footer>
      <Button class="p-mx-2 p-button-secondary" icon="pi pi-times" label="close tutorial" @click="close"></Button>
      <Button class="p-mx-2" label="prev" @click="prev"></Button>
      <Button class="p-mx-2" label="next" @click="next"></Button>
    </template>
  </Dialog>
  <Dialog v-if="i === 3" v-model:visible="display" position="bottom" header="explanation" :closable="false">
    Here different types of explanation and additional information for your chosen option are displayed.
    <template #footer>
      <Button class="p-mx-2 p-button-secondary" icon="pi pi-times" label="close tutorial" @click="close"></Button>
      <Button class="p-mx-2" label="prev" @click="prev"></Button>
      <Button class="p-mx-2" label="finish" @click="next"></Button>
    </template>
  </Dialog>

</template>

<script>
export default {
  name: "tutorial",
  data() {
    return {
      display: false,
      i: 0,
    }
  },
  mounted() {
    this.display = true
  },
  methods: {
    close() {
      this.i = 4;
      this.sendBlock()
    },

    prev() {
      this.i === 0 ? this.i = 3 : this.i--;
      this.sendBlock()

    },
    next() {
      this.i++;
      this.sendBlock()

    },
    async sendBlock() {
      let newBlock = {
        "goals": this.i !== 0 && this.i !== 4,
        "evidence": this.i !== 1 && this.i !== 4,
        "options": this.i !== 2 && this.i !== 4,
        "explain": this.i !== 3 && this.i !== 4
      }
      this.$emit("setBlock", newBlock)

    }
  }
}
</script>

<style scoped>

</style>