<script setup lang="ts">
import JSONRPCHandler from "../util/jsonrpc";
import { makeArequest } from "../util/chat";
console.log(import.meta.browser);
const chats = [];
const chatMessages = useState("chatMessages", () => {
  return [];
});
// sob
// WHY DOES IT HAVE TO BE STRINGS
const showChats0 = useState("showChats0", "n");
const ShowChats1 = useState("ShowChats1", "n");
const currentChatId = useState("currentChatId", "null");
const isGroup = useState("isGroup", "n");
const ChatBoxValue = ref("");
if (import.meta.client) {
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
          if (payload.envelope.dataMessage) {
            item.lastMessage = payload.envelope.dataMessage.message;
          } else if (payload.envelope.syncMessage) {
            item.lastMessage = payload.envelope.syncMessage.sentMessage.message;
          }

          console.log("found it");
        }
      }
      localStorage.setItem("groupchatlist", JSON.stringify(groupChatList));
    }
  });

  if (!localStorage.getItem("myinfo")) {
    // takes first device because we cant be multi device atm :3\
    await makeArequest(
      new JSONRPCHandler().setMethod("listAccounts").setPayload({}),
    ).then((d) => {
      console.log(d);
      localStorage.setItem("myinfo", JSON.stringify(d.result[0]));
    });
  }
  if (!localStorage.getItem("groupchatlist")) {
    const nr = [];
    console.log("gc list");
    const gcList = await loadGCs().then(async (d) => {
      console.log(d.result);
      for (const item of d.result) {
        item._type = "group";
        nr.push(item);
      }
    });
    await makeArequest(new JSONRPCHandler().setMethod("listContacts")).then(
      (d) => {
        console.log(d);
        for (const item of d.result) {
          item._type = "user";
          nr.push(item);
        }
      },
    );
    localStorage.setItem("groupchatlist", JSON.stringify(nr));
  }

  // end of rescans
  // load vars
  for (const item of JSON.parse(localStorage.getItem("groupchatlist"))) {
    const avatar = await makeArequest(
      new JSONRPCHandler()
        .setMethod("getAvatar")
        .setPayload(item.id ? { groupId: item.id } : { profile: item.uuid }),
    ).then((d) => {
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
      let dbmessages = JSON.parse(chatsDbMessageS || "[]");
      console.log(dbmessages);
      const oldLength = parseInt(dbmessages.length.toString());
      // before we pass dbmessages please format it to unload expired messages
      // dbmessages = dbmessages.filter((msg) => {
      //   if (msg.dataMessage)
      //     return (
      //       Date.now() >
      //       msg.dataMessage.timestamp + msg.dataMessage.expiresInSeconds * 1000
      //     );
      //   if (msg.syncMessage) {
      //     console.log(
      //       msg.syncMessage.sentMessage,
      //       msg.syncMessage.sentMessage.timestamp,
      //       msg.syncMessage.sentMessage.expiresInSeconds * 1000,
      //       `${Date.now()} > ${msg.syncMessage.sentMessage.timestamp + msg.syncMessage.sentMessage.expiresInSeconds * 1000}`
      //     );
      //     return (
      //       Date.now() <
      //       msg.syncMessage.sentMessage.timestamp +
      //         msg.syncMessage.sentMessage.expiresInSeconds * 1000
      //     );
      //   }
      //   return true;
      // });
      // if (oldLength != dbmessages.length) {
      //   console.log("Removed expired messages");
      //   await messagesDb.setItem(
      //     item.id || item.uuid,
      //     JSON.stringify(dbmessages)
      //   );
      // }
      // chatMessages = dbmessages;
      // update the state value
      currentChatId.value = item.id || item.uuid;

      chatMessages.value = dbmessages;
      showChats0.value = "y";
    };
    chats.push(item);
  }
}
function sendMessage() {
  // console.log(ChatBoxValue.value);
  makeArequest(
    new JSONRPCHandler().setMethod("send").setPayload({
      message: ChatBoxValue.value,
      recipient: currentChatId.value,
    }),
  ).then((d) => console.debug(`msg send response`, d));
  ChatBoxValue.value = "";
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
                  <span class="loading loading-spinner loading-xs" />
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
                  <span class="loading loading-spinner loading-xs" />
                </div>
              </div>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
  <div class="justify-between w-3/4 top-5 absolute right-10">
    <div v-if="showChats0 == 'y'">
      <Chats
        :messages="chatMessages"
        :isGroup="isGroup == 'y'"
        :chatId="currentChatId"
        :n="1"
      />
      <input
        type="text"
        class="input input-bordered w-3/4 mt-5"
        placeholder="Send message :3."
        v-model="ChatBoxValue"
      />
      <button class="btn p-2 ml-5" @click="sendMessage">Send</button>
    </div>
    <div v-else>
      <h1 class="text-6xl text-center mt-50 animate-spin">:3</h1>
    </div>
  </div>
</template>
