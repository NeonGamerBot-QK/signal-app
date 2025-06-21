<script setup lang="ts">
useHead({
  link: [
    // maybe this helps with speeding things up
    { rel: "preconnect", href: "https://gravatar.com" },
    { rel: "preconnect", href: "https://cdn.signal.org" },
  ],
});
</script>
<template>
  <div class="min-h-screen bg-[#24273a] text-white p-2 overflow-hidden">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
