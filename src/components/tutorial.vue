<template>
  <Dialog v-if="i === 0" v-model:visible="display" position="bottom" :header="$t('DesiredOutcomes')" :closable="false">
    {{ $t("Tutorial1a")}}
    <br>
    {{ $t("Tutorial1b")}}
    <template #footer>
      <Button class="p-mx-2 p-button-secondary" icon="pi pi-times" :label="$t('close')" @click="close"></Button>
      <Button class="p-mx-2" :label="$t('next')" @click="next"></Button>
    </template>
  </Dialog>
  <Dialog v-if="i === 1" v-model:visible="display" position="bottom" :header="$t('Evidence')" :closable="false">
    {{ $t("Tutorial2")}}
    <template #footer>
      <Button class="p-mx-2 p-button-secondary" icon="pi pi-times" :label="$t('close')" @click="close"></Button>
      <Button class="p-mx-2" :label="$t('prev')" @click="prev"></Button>
      <Button class="p-mx-2" :label="$t('next')" @click="next"></Button>
    </template>
  </Dialog>
  <Dialog v-if="i === 2" v-model:visible="display" position="bottom" :header="$t('Treatment')" :closable="false">
    {{ $t("Tutorial3a")}}
     <br> <br>
    {{ $t("Tutorial3b")}}
    <template #footer>
      <Button class="p-mx-2 p-button-secondary" icon="pi pi-times" :label="$t('close')" @click="close"></Button>
      <Button class="p-mx-2" :label="$t('prev')" @click="prev"></Button>
      <Button class="p-mx-2" :label="$t('next')" @click="next"></Button>
    </template>
  </Dialog>
  <Dialog v-if="i === 3" v-model:visible="display" position="bottom" :header="$t('Explanation')" :closable="false">
    {{ $t("Tutorial4")}}
    <template #footer>
      <Button class="p-mx-2" :label="$t('prev')" @click="prev"></Button>
      <Button class="p-mx-2" :label="$t('finish')" @click="next"></Button>
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