<template>
  <h2> additional information</h2>
  <w-flex fill-height>
    <div class="xs8"> content</div>
    <div class="xs4">
      <w-button width="100%">Network description</w-button>
      <w-button width="100%" >pubmed</w-button>
       <w-button id="hi" width="100% shrink">How can I change the outcome?</w-button>
       <w-button width="100%">Compare</w-button>
       <w-button width="100%">send feedback</w-button>
    </div>
  </w-flex>
</template>

<script>
export default {
name: "additional",
}
</script>

<style scoped>
#additional {
  background-color: white;
}

div {
  background-color: white;
  width: 100%
}

.w-button {
  word-wrap: break-word;
  white-space: normal;
  height: 200%
}

</style>