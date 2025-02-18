import { defineStore } from 'pinia'

import config from '@/config'

import TopicsAPI from '../services/api/resources/TopicsAPI'

const topicsAPI = new TopicsAPI()
const topicsAPIv2 = new TopicsAPI({ version: 2 })

export const useTopicStore = defineStore('topic', {
  state: () => ({
    data: []
  }),
  actions: {
    /**
     * Load topics to store from a list of ids and API
     *
     * @param {*} topics
     */
    async loadTopicsFromList(topics) {
      this.data = []
      for (const topic of topics) {
        const res = await topicsAPI.get(topic.id)
        this.data.push(res)
      }
    },
    /**
     * Filter a list of topics related to the current universe
     *
     * @param {Array} topics
     * @returns {Array}
     */
    filter(topics) {
      return topics.filter((topic) => topic.id !== config.universe.topic_id)
    },
    /**
     * Load universe related topics from API
     *
     * @returns {Promise<object[]>}
     */
    async loadTopicsForUniverse() {
      if (this.data.length > 0) return this.data
      let response = await topicsAPIv2._list({
        page_size: config.website.pagination_sizes.topics_list,
        tag: config.universe.name
      })
      this.data = this.filter(response.data)
      while (response.next_page) {
        response = await topicsAPIv2.request(response.next_page)
        this.data = [...this.data, ...this.filter(response.data)]
      }
      return this.data
    },
    /**
     * Get a topic from store
     *
     * @param {string} slugOrId
     * @returns {object}
     */
    get(slugOrId) {
      return this.data.find((b) => b.slug === slugOrId || b.id === slugOrId)
    },
    /**
     * Get a single topic from store or API
     *
     * @param {string} slugOrId
     * @returns {object}
     */
    async load(slugOrId) {
      const existing = this.get(slugOrId)
      if (existing) return existing
      return await topicsAPIv2._get(slugOrId)
    },
    /**
     * Create a topic
     *
     * @param {object} topic
     * @returns {object}
     */
    async create(topic) {
      const res = await topicsAPI.create(topic)
      this.data.push(res)
      return res
    },
    /**
     * Update a topic
     *
     * @param {string} topicId
     * @param {object} data
     * @returns {object}
     */
    async update(topicId, data) {
      const res = await topicsAPI.update(topicId, data)
      const idx = this.data.findIndex((b) => b.id === topicId)
      this.data[idx] = res
      return res
    },
    /**
     * Delete an entity (DELETE)
     *
     * @param {string} entityId
     * @returns {Promise}
     */
    async delete(entityId) {
      return await this.makeRequestAndHandleResponse(
        `${this.url()}/${entityId}/`,
        'delete'
      )
    }
  }
})
