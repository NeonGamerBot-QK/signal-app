<script setup lang="ts">
// import Err from "./Error.vue"
const url = "http://localhost:8080";
const curl = useCookie("ws-url");
let error: string | null = null;
async function testUrl() {
  try {
    const d = await fetch(url + "/api/v1/check").then((r) => r.status == 200);
    if (!d) {
      error = "Bad url (no 200)";
    } else {
      // somehow popup it works but uh how? idk
    }
  } catch (e) {
    error = "Failed to fetch: " + e.message;
  }
}
function saveURLAndSet() {
  console.log(url);
  curl.value = url;
  location.reload();
}
</script>
<template>
  <div class="hero">
    <div class="hero-content text-center">
      <div class="max-w-md">
        <h1 class="text-5xl font-bold">Login</h1>
        <p class="py-6">
          Hey.. can you give me a http url you want to use (aka the signal
          backend)?
        </p>
        <Error v-if="error" :message="error" />
        <div class="flex flex-1">
          <input v-model="url" type="text" class="input mr-5 p-1" />
          <button class="btn btn-primary" @click="testUrl">Test URL</button>
        </div>
        <br />
        <button class="btn btn-primary" @click="saveURLAndSet">Save</button>
      </div>
    </div>
  </div>
</template>
