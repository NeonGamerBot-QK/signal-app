<script setup lang="ts">
// import Err from "./Error.vue"
let url = "ws://localhost:8000";
const curl = useCookie("ws-url")
let error: string | null = null;
function testUrl() {
const ws = new WebSocket(url)
ws.onerror = () => {
error = "Failed to connect (check console for more)"
}
ws.onconnect = () => {
ws.disconnect()
}
}
function saveURLAndSet() {
console.log(url)
curl.value = url;
location.reload()
}
</script>
<template>
<div class="hero">
  <div class="hero-content text-center">
    <div class="max-w-md">
      <h1 class="text-5xl font-bold">Login</h1>
      <p class="py-6">
       Hey.. can you give me a websocket url you want to use?
      </p>
      <Error v-if="error" :message="error" />
<div class="flex flex-1">
      <input type="text"  class="input mr-5 p-1" v-model="url" />
      <button class="btn btn-primary" v-on:click="testUrl" >Test URL</button>
</div>
<br />
      <button class="btn btn-primary" v-on:click="saveURLAndSet" >Save</button>

    </div>
  </div>
</div>
</template>
