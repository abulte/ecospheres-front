import { createRouter, createWebHistory } from "vue-router"
import HomeView from "../views/HomeView.vue"
import OrganizationsListView from "../views/organizations/OrganizationsListView.vue"
import OrganizationDetailView from "../views/organizations/OrganizationDetailView.vue"

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/organizations",
      name: "organizations",
      component: OrganizationsListView,
    },
    {
      path: "/organizations/:oid",
      name: "organization_detail",
      component: OrganizationDetailView,
    },
    {
      path: "/about",
      name: "about",
      component: () => import("../views/AboutView.vue"),
    },
  ],
})

export default router;