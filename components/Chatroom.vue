<script setup lang="ts">
import { useWebSocket } from "@vueuse/core";
import JSONRPCHandler from "../util/jsonrpc";

const urlCookie = useCookie("ws-url");

console.log(process.browser);
let chats = [];
const chatMessages = useState("chatMessages", () => {
  return [];
});
// sob 
// WHY DOES IT HAVE TO BE STRINGS
let showChats0 = useState("showChats0", "n");
let ShowChats1 = useState("ShowChats1", "n");
if (process.client) {
  const { KeyValueIndexedDB } = await import("../util/indexdb");
  const messagesDb = new KeyValueIndexedDB("signal", "messages", 1);
  await messagesDb.init();
  window.JSONRPCHandler = JSONRPCHandler;
  const evtSource = new window.EventSource(`/api/events`, {
    withCredentials: true,
  });
  evtSource.addEventListener("receive", async (e) => {
    const payload = JSON.parse(e.data);
    console.log(payload);
    if (payload.envelope) {
      if (payload.envelope.syncMessage) {
        let currentMsgs = null;
        try {
          currentMsgs =
            JSON.parse(
              await messagesDb.getItem(
                payload.envelope.syncMessage.sentMessage.destinationUuid,
              ),
            ) || [];
        } catch (e) {
          currentMsgs = [];
        }
        const newMsgs = [...currentMsgs, payload.envelope];
        console.log(payload.envelope.sourceUuid, newMsgs);
        await messagesDb.setItem(
          payload.envelope.syncMessage.sentMessage.destinationUuid || "1",
          JSON.stringify(newMsgs),
        );
        console.log("INSERT MY MESSAGE");
      }
      if (payload.envelope.dataMessage) {
        let currentMsgs = null;
        try {
          currentMsgs =
            JSON.parse(await messagesDb.getItem(payload.envelope.sourceUuid)) ||
            [];
        } catch (e) {
          currentMsgs = [];
        }
        const newMsgs = [...currentMsgs, payload.envelope];
        console.log(payload.envelope.sourceUuid, newMsgs);
        await messagesDb.setItem(
          payload.envelope.sourceUuid || "1",
          JSON.stringify(newMsgs),
        );
        console.log("INSERT MESSAGE");
      }
      // update lastMessage
      const groupChatList = JSON.parse(localStorage.getItem("groupchatlist"));
      for (const item of groupChatList) {
        if ((item.id || item.uuid) == payload.envelope.sourceUuid) {
if(payload.envelope.dataMessage) {
          item.lastMessage = payload.envelope.dataMessage.message;
} else if (payload.envelope.syncMessage) {
  item.lastMessage =
    payload.envelope.syncMessage.sentMessage.message;
}

          console.log("found it");
        }
      }
      localStorage.setItem("groupchatlist", JSON.stringify(groupChatList));
    }
  });
  
  if (!localStorage.getItem("myinfo")) {
    // takes first device because we cant be multi device atm :3\
    await fetch("/api/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        new JSONRPCHandler().setMethod("listAccounts").setPayload({}).build(),
      ),
    })
      .then((r) => r.json())
      .then((d) => {
        console.log(d);
        localStorage.setItem("myinfo", JSON.stringify(d.result[0]));
      });
  }
  if (!localStorage.getItem("groupchatlist")) {
    const nr = [];
    console.log("gc list");
    const gcList = await fetch("/api/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        new JSONRPCHandler().setMethod("listGroups").setPayload({}).build(),
      ),
    })
      .then((rr) => rr.json())
      .then(async (d) => {
        console.log(d.result);
        for (const item of d.result) {
          item._type = "group";
          nr.push(item);
        }
      });
    await fetch("/api/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        new JSONRPCHandler().setMethod("listContacts").build(),
      ),
    })
      .then((d) => d.json())
      .then((d) => {
        console.log(d);
        for (const item of d.result) {
          item._type = "user";
          nr.push(item);
        }
      });
    localStorage.setItem("groupchatlist", JSON.stringify(nr));
  }

  // end of rescans
  // load vars
  for (const item of JSON.parse(localStorage.getItem("groupchatlist"))) {
    const avatar = await fetch(`/api/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        new JSONRPCHandler()
          .setMethod("getAvatar")
          .setPayload(item.id ? { groupId: item.id } : { profile: item.uuid })
          .build(),
      ),
    })
      .then((r) => r.json())
      .then((d) => {
        console.log(d);
        return d.error
          ? "https://gravatar.com/avatar/27205e5c51cb03f862138b22bcb5dc20f94a342e744ff6df1b8dc8af3c865109?f=y"
          : `data:image/png;base64,${d.result.data}`;
      });
    item.avatar = avatar;
    item.handleClick = async () => {
      alert("cha");
      // pull from indexdb to extract
      const chatsDbMessageS = await messagesDb.getItem(item.id || item.uuid);
      let dbmessages = JSON.parse(chatsDbMessageS || '[]');
      console.log(dbmessages);
      const oldLength = parseInt(dbmessages.length.toString());
      // before we pass dbmessages please format it to unload expired messages
      dbmessages = dbmessages.filter(
        (msg) => {
         if(msg.dataMessage) return Date.now() > (msg.dataMessage.timestamp + msg.dataMessage.expiresInSeconds * 1000);
         if(msg.syncMessage){
          console.log(msg.syncMessage.sentMessage, msg.syncMessage.sentMessage.timestamp, msg.syncMessage.sentMessage.expiresInSeconds*1000, `${Date.now()} > ${msg.syncMessage.sentMessage.timestamp + msg.syncMessage.sentMessage.expiresInSeconds * 1000}`);
          return  Date.now() < (msg.syncMessage.sentMessage.timestamp + msg.syncMessage.sentMessage.expiresInSeconds * 1000);
         }
         return true;
        },
      );
      // if(oldLength != dbmessages.length) {
      //   console.log("Removed expired messages");
      //   await messagesDb.setItem(item.id || item.uuid, JSON.stringify(dbmessages));
      // }
      // chatMessages = dbmessages;
      // update the state value
      chatMessages.value = dbmessages;
      showChats0.value = "y";
    };
    chats.push(item);
  }
}
</script>
<template>
  <div class="bg-[#313244] rounded h-screen w-1/5 p-5">
    <h1 class="font-bold text-2xl">Chats</h1>
    <hr />
    <div>
      <!-- make a list of chats -->
      <ul class="list bg-base-100 rounded-box shadow-md">

        <li v-for="chat in chats" class="list-row" @click="chat.handleClick()">
          <div v-if="chat._type == 'group'">
            <div><img class="size-10 rounded-box" :src="chat.avatar" /></div>
            <div>
              <div>{{ chat.name || chat.username }}</div>
              <div class="text-xs font-semibold opacity-60">
                <div v-if="chat.lastMessage">{{ chat.lastMessage }}</div>
                <div v-else>
                  <span class="loading loading-spinner loading-xs"></span>
                </div>
              </div>
            </div>
          </div>
          <div v-else>
            <div><img class="size-10 rounded-box" :src="chat.avatar" /></div>
            <div>
              <div>{{ chat.name || chat.username }}</div>
              <div class="text-xs font-semibold opacity-60">
                <div v-if="chat.lastMessage">{{ chat.lastMessage }}</div>
                <div v-else>
                  <span class="loading loading-spinner loading-xs"></span>
                </div>
              </div>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
  <div class="justify-between w-3/4 top-5 absolute right-10">
    <Chats v-if="showChats0 == 'y'" :messages="chatMessages" :n="1" />
    <div v-else>
      <h1 class="text-6xl text-center mt-50 animate-spin">:3</h1>
    </div>
  </div>
</template>
