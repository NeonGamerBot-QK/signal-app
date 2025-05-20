<script setup lang="ts">
import Login from "../components/Login.vue";
import Chatroom from "../components/Chatroom.vue";
const urlCookie = useCookie("ws-url");
const isLoggedIn = urlCookie.value !== undefined;
console.log(urlCookie.value, isLoggedIn);
</script>
<template>
  <Login v-if="!isLoggedIn" />
  <div v-else>
    <h1><Chatroom /></h1>
  </div>
</template>
