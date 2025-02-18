<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterView, useRouter } from 'vue-router'

import config from '@/config'

import Navigation from './components/Navigation.vue'
import Header from './components/header/Header.vue'
import UserAPI from './services/api/resources/UserAPI'
import { useUserStore } from './store/UserStore'

const router = useRouter()
const query = ref('')
const api = new UserAPI()
const store = useUserStore()

const isLoggedIn = computed(() => store.$state.isLoggedIn)

const quickLinks = computed(() => {
  if (!config.website.oauth_option) return
  return [
    {
      label: isLoggedIn.value
        ? `${store.$state.data.first_name} ${store.$state.data.last_name}`
        : 'Se connecter',
      icon: isLoggedIn.value
        ? 'ri-logout-box-r-line'
        : 'ri-account-circle-line',
      to: isLoggedIn.value ? '/logout' : '/login',
      iconRight: isLoggedIn.value
    }
  ]
})

const updateQuery = (q) => {
  query.value = q
}

const doSearch = () => {
  router.push({ path: '/datasets', query: { q: query.value } })
}

// protect authenticated routes
router.beforeEach((to) => {
  if (to.meta.requiresAuth && !store.$state.isLoggedIn) {
    localStorage.setItem('lastPath', to.path)
    router.push({ name: 'login' })
  }
})

onMounted(() => {
  store.init()
  if (isLoggedIn.value) {
    api
      ._list()
      .then((data) => {
        store.storeInfo(data)
      })
      .catch((err) => {
        // profile info fetching has failed, we're probably using a bad token
        // keep the current route and redirect to the login flow
        if (err.response?.status === 401) {
          store.logout()
          localStorage.setItem('lastPath', router.currentRoute.value.path)
          return router.push({ name: 'login' })
        }
        throw err
      })
  }
})

const logotext = ref(config.website.rf_title)
const servicetitle = ref(config.website.title)
const logoOperator = ref(config.website.logo_operator)
const logoService = ref(config.website.service_logo)
const showBadge = ref(config.website.badge.display)
const badgeText = ref(config.website.badge.text)
const badgeStyle = ref(config.website.badge.style)
</script>

<template>
  <Header
    :service-title="servicetitle"
    service-description=""
    home-to="/"
    :quick-links="quickLinks"
    :show-search="true"
    :logo-text="logotext"
    :operator-img-src="logoOperator"
    :operator-img-style="{ height: '60px' }"
    :service-logo-src="logoService"
    :show-badge="showBadge"
    :badge-text="badgeText"
    :badge-style="badgeStyle"
    @search="doSearch"
    @update:modelValue="updateQuery"
  >
    <template #mainnav>
      <Navigation />
    </template>
  </Header>

  <RouterView />

  <DsfrFooter class="fr-mt-8w" :mandatory-links="[]"></DsfrFooter>
</template>

<!-- global styles -->
<style lang="scss">
.es__tiles__list {
  list-style-type: none;
}
.justify-end {
  justify-content: flex-end;
}
</style>
