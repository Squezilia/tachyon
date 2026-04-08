export default defineNuxtPlugin({
  name: 'api',
  setup(nuxtApp) {
    const api = $fetch.create({
      baseURL: 'http://localhost:3000',
      credentials: 'include',
      responseType: 'json',

      async onResponseError({ response }) {
        if (response.status === 401) {
          await nuxtApp.runWithContext(() => navigateTo('/login'));
        }
      },
    });

    // Expose to useNuxtApp().$api
    return {
      provide: {
        api,
      },
    };
  },
});
