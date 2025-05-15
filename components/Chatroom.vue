<script setup lang="ts">
import { useWebSocket } from '@vueuse/core'
const urlCookie = useCookie("ws-url")
console.log(process.browser)
if(process.browser) {
const evtSource = new window.EventSource(urlCookie.value, {
  withCredentials: true,
});
evtSource.onmessage = (event) => {
console.log(event, event.data)
}
// debugger;
}
</script>
<template>
<div class="bg-[#313244] rounded h-screen w-1/5 p-5">
<h1>Chats </h1>

</div>
<div class="justify-between w-3/4 top-5 absolute right-10">
<Chats />
</div>
</template>
