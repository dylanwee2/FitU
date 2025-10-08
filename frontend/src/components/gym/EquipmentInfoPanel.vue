<template>
  <div class="u-card p-3" style="min-height: 200px;">
    <h5 class="mb-2">Equipment</h5>
    <div v-if="!selection">
      <p class="u-muted m-0">Walk up to a machine and click it.</p>
    </div>
    <div v-else>
      <h6 class="mb-1">{{ selection.name }}</h6>
      <small class="d-block u-muted mb-2">{{ selection.info?.purpose || 'Training equipment' }}</small>
      <div class="mb-2">
        <strong>Muscles:</strong>
        <span class="badge bg-light text-dark ms-1" v-for="m in selection.info?.muscles || []" :key="m">{{ m }}</span>
      </div>
      <div v-if="selection.info?.steps?.length" class="mb-2">
        <strong>Steps:</strong>
        <ol class="mt-1 mb-2">
          <li v-for="(s,i) in selection.info.steps" :key="i">{{ s }}</li>
        </ol>
      </div>
      <div v-if="selection.info?.safety?.length" class="mb-2">
        <strong>Safety:</strong>
        <ul class="mt-1">
          <li v-for="(s,i) in selection.info.safety" :key="i">{{ s }}</li>
        </ul>
      </div>
      <div v-if="selection.info?.videoUrl" class="ratio ratio-16x9">
        <iframe :src="selection.info.videoUrl" title="Demo" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EquipmentInfoPanel',
  props: {
    selection: Object,
    visited: Object
  }
}
</script>


