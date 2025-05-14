<script setup lang="ts">
import { useWebSocket } from '@vueuse/core'
const urlCookie = useCookie("ws-url")
const { status, data, send, open, close, state } = useWebSocket(urlCookie, {
 autoReconnect: {
    retries: 3,
    delay: 1000,
    onFailed() {
      alert('Failed to connect WebSocket after 3 retries')
    },
  }
  })
//console.log(status., data)
console.log(status, open, close, state, data)
  watch(
      data,
      val => {
     console.log(val, 'm')
      },
      { lazy: true }
    );
</script>
<template>
<div class="bg-[#313244] rounded h-screen w-1/5 p-5">
<h1>Chats </h1>

</div>
<div class="justify-between w-3/4 top-5 absolute right-10">
<Chats />
</div>
</template>
