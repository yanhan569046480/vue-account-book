import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const router = new Router({
    base: process.env.VUE_APP_BASE_URL,
    routes: [
        {path: '/', redirect: '/account-book/list'},

        {path: '/account-book/list', name: 'account-book-list', component: () => import('@/views/account-book/list')},
    ]
})

export default router