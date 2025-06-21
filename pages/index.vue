<script setup lang="ts">
import Login from "../components/Login.vue";
import Chatroom from "../components/Chatroom.vue";
const urlCookie = useCookie("ws-url");
const config = useRuntimeConfig();
const isLoggedIn = urlCookie.value !== undefined;
const isInDemoMode = config.public.demoMode;
console.log(urlCookie.value, isInDemoMode, "meow");
if (isInDemoMode) {
  console.log("Running in demo mode");
} else {
  console.log("Not in demo mode");
}
</script>
<template>
  <div v-if="isInDemoMode">
    <DemoChatroom />
  </div>
  <div v-else-if="!isInDemoMode">
    <Login v-if="!isLoggedIn" />
    <div v-else>
      <h1><Chatroom /></h1>
    </div>
  </div>
</template>
