<script setup lang="ts">
import { useWebSocket } from '@vueuse/core'
import JSONRPCHandler from '../util/jsonrpc'
const urlCookie = useCookie("ws-url")
console.log(process.browser)
let chats = []

if(process.browser) {
const evtSource = new window.EventSource(`/api/events`, {
  withCredentials: true,
});
evtSource.onmessage = (event) => {
console.log(event, event.data)
}
evtSource.addEventListener("notice", (e) => {
  console.log(e.data);
});
evtSource.addEventListener("receive", (e) => {
  console.log(e.data);
});
if(!localStorage.getItem("groupchatlist")) {
  console.log('gc list')
  const gcList = await fetch("/api/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(new JSONRPCHandler()
      .setMethod("listGroups")
      .setPayload({})
      .build()),
  }).then(rr=>rr.json()).then(async d=> {
    console.log(d.result)
  const nr = []
  for(const item of d.result) {
    nr.push(item)
  }
    localStorage.setItem("groupchatlist", JSON.stringify(nr))
  });
  }



  // end of rescans
  // load vars
  for(const item of JSON.parse(localStorage.getItem("groupchatlist"))) {
    const avatar = await fetch(`/api/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(new JSONRPCHandler()
        .setMethod("getAvatar")
        .setPayload({groupId: item.id})
        .build()),
    }).then(r=>r.json()).then(d=>{
      console.log(d)
    return d.error ? "https://gravatar.com/avatar/27205e5c51cb03f862138b22bcb5dc20f94a342e744ff6df1b8dc8af3c865109?f=y" : `data:image/png;base64,${d.result.data}`
  })
    item.avatar = avatar
    chats.push(item)
  }
}
// debugger;

</script>
<template>
<div class="bg-[#313244] rounded h-screen w-1/5 p-5">
<h1 class="font-bold text-2xl">Chats</h1>
<hr />
<div>
<!-- make a list of chats -->
<!-- {{ chat.id }} -->
<!-- </div> --> 
<ul class="list bg-base-100 rounded-box shadow-md">
  
  <!-- <li class="p-4 pb-2 text-xs opacity-60 tracking-wide">Most played songs this week</li> -->
  
  <li v-for="chat in chats"class="list-row">
    <div><img class="size-10 rounded-box" :src="chat.avatar"/></div>
    <div>
      <div>{{ chat.name}}</div>
      <div class="text-xs font-semibold opacity-60">ig the last msg is here??</div>
    </div>
  </li>
<!--   
  <li class="list-row">
    <div><img class="size-10 rounded-box" src="https://img.daisyui.com/images/profile/demo/4@94.webp"/></div>
    <div>
      <div>Ellie Beilish</div>
      <div class="text-xs uppercase font-semibold opacity-60">Bears of a fever</div>
    </div>
  </li>
  
  <li class="list-row">
    <div><img class="size-10 rounded-box" src="https://img.daisyui.com/images/profile/demo/3@94.webp"/></div>
    <div>
      <div>Sabrino Gardener</div>
      <div class="text-xs uppercase font-semibold opacity-60">Cappuccino</div>
    </div>
    <p class="list-col-wrap text-xs">
      "Cappuccino" quickly gained attention for its smooth melody and relatable themes. The song’s success propelled Sabrino into the spotlight, solidifying their status as a rising star.
    </p>
    <button class="btn btn-square btn-ghost">
      <svg class="size-[1.2em]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g stroke-linejoin="round" stroke-linecap="round" stroke-width="2" fill="none" stroke="currentColor"><path d="M6 3L20 12 6 21 6 3z"></path></g></svg>
    </button>
    <button class="btn btn-square btn-ghost">
      <svg class="size-[1.2em]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g stroke-linejoin="round" stroke-linecap="round" stroke-width="2" fill="none" stroke="currentColor"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></g></svg>
    </button>
  </li> -->
  
</ul>
</div>
</div>
<div class="justify-between w-3/4 top-5 absolute right-10">
<Chats />
</div>
</template>
