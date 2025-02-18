<script setup>
import { computed, onMounted, ref, watchEffect } from 'vue'
import { useRoute, onBeforeRouteUpdate } from 'vue-router'

import config from '@/config'

import Tile from '../../components/Tile.vue'
import { useSearchStore } from '../../store/SearchStore'
import { useTopicStore } from '../../store/TopicStore'

const route = useRoute()
const store = useSearchStore()
const query = computed(() => route.query.q)
const currentPage = ref(1)

const topicStore = useTopicStore()
const topic = computed(() => route.query.topic)
const selectedTopicId = ref(null)

const datasets = computed(() => store.datasets)
const pages = computed(() => store.pagination)

const title = config.website.title
const topicsConf = config.website.list_highlighted_topics
const topicOptions = computed(() => {
  if (!topicsConf?.length) return
  const topics = topicStore.$state.data
    .filter((t) => {
      return topicsConf.map((st) => st.id).includes(t.id)
    })
    .map((t) => {
      return { value: t.id, text: t.name }
    })
  return [{ value: '', text: 'Toutes les données' }, ...topics]
})

const onSelectTopic = (topicId) => {
  selectedTopicId.value = topicId
  currentPage.value = 1
}

// reset currentPage when query changes
onBeforeRouteUpdate((to, from) => {
  currentPage.value = 1
})

onMounted(() => {
  if (topicsConf?.length) {
    topicStore.loadTopicsFromList(topicsConf)
  }
})

// fill topic name when arriving on the page with a topic ID
// TODO: topicId is not updated when selecting a topic
watchEffect(() => {
  if (!topic.value || !topicsConf) return
  selectedTopicId.value = topic.value
})

watchEffect(() => {
  store.search(query.value, selectedTopicId.value, currentPage.value)
})
</script>

<template>
  <div class="fr-container fr-mt-4w fr-mb-4w">
    <h1>Jeux de données</h1>
    <p v-if="query">Résultats de recherche pour "{{ query }}".</p>
    <p v-else>Parcourir tous les jeux de données présents sur {{ title }}.</p>
    <div v-if="query && datasets?.length === 0" class="fr-mb-4w">
      Aucun résultat pour cette recherche.
    </div>
    <div class="fr-grid-row">
      <div v-if="topicsConf" class="fr-col-md-3 fr-pr-md-2w fr-mb-2w">
        <DsfrSelect
          :model-value="selectedTopicId"
          :options="topicOptions"
          default-unselected-text="Toutes les données"
          @update:modelValue="onSelectTopic"
        >
          <template #label>Thématiques</template>
        </DsfrSelect>
      </div>
      <div :class="[topicsConf ? 'fr-col-md-9' : 'fr-col-md-12']">
        <ul class="fr-grid-row fr-grid-row--gutters es__tiles__list">
          <li v-for="d in datasets" class="fr-col-12 fr-col-lg-4">
            <Tile
              :link="`/datasets/${d.slug}`"
              :title="d.title"
              :description="d.description"
              :img="d.organization?.logo"
              :is-markdown="true"
            />
          </li>
        </ul>
      </div>
    </div>
  </div>
  <DsfrPagination
    class="fr-container"
    v-if="pages.length"
    :current-page="currentPage - 1"
    :pages="pages"
    @update:current-page="(p) => (currentPage = p + 1)"
  />
</template>
