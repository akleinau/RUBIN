<template>
<Accordion>
    <AccordionTab header="Network description">
      Content I
    </AccordionTab>
    <AccordionTab header="PubMed">
      Content II
    </AccordionTab>
    <AccordionTab header="How can I change the result?">
      Content III
    </AccordionTab>
  <AccordionTab header="Compare">
      Content III
    </AccordionTab>
<AccordionTab header="Send Feedback">
      Content III
    </AccordionTab>
</Accordion>
</template>

<script>
export default {
  name: "additional",
  data() {
    return {
      active: 0
    }
  }
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

p-accordion-header {
 font-size: 10px;
}

</style>