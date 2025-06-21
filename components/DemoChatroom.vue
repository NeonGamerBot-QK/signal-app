<script setup lang="ts">
// censored ish version of my chat thing
const chats = [
  {
    number: null,
    uuid: "demo-mode",
    username: "neongamerbot.56",
    name: "",
    givenName: null,
    familyName: null,
    nickName: null,
    nickGivenName: null,
    nickFamilyName: null,
    note: null,
    color: null,
    isBlocked: false,
    isHidden: false,
    messageExpirationTime: 2419200,
    profileSharing: true,
    unregistered: false,
    profile: {
      givenName: "Neon",
      familyName: null,
      about: null,
      aboutEmoji: null,
      hasAvatar: true,
    },
    _type: "user",
    lastMessage: null,
  },
];

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
for (const chat of chats) {
  chat.avatar = `https://saahild.com/zeon/static/media/logo.496b486aab466e923154.png`;
  chat.handleClick = () => {
    // handle click logic
    console.log(`Clicked on chat: ${chat.username}`);
    chatMessages.value = [
      {
        sourceUuid: chat.uuid,
        sourceName: chat.name || chat.username,
        dataMessage: {
          message: "Welcome to the demo chat!",
          attachments: [],
        },
        timestamp: new Date().toISOString(),
        avatar: chat.avatar,
      },
      {
        sourceUuid: "demo-mode",
        sourceName: "Neon Gamer Bot",
        syncMessage: {
          sentMessage: {
            destinationUuid: chat.uuid,
            message: "Hello! This is a demo message.",
          },
        },
        timestamp: new Date().toISOString(),
        avatar: `https://saahild.com/zeon/static/media/logo.496b486aab466e923154.png`,
      },
      {
        sourceUuid: "demo-mode",
        sourceName: "Neon Gamer Bot",
        syncMessage: {
          sentMessage: {
            destinationUuid: chat.uuid,
            message: "Hello! This is a demo message.",
          },
        },
        timestamp: new Date().toISOString(),
        avatar: `https://saahild.com/zeon/static/media/logo.496b486aab466e923154.png`,
      },
      {
        sourceUuid: "demo-mode",
        sourceName: "Neon Gamer Bot",
        syncMessage: {
          sentMessage: {
            destinationUuid: chat.uuid,
            message: "Hello! This is a demo message.",
          },
        },
        timestamp: new Date().toISOString(),
        avatar: `https://saahild.com/zeon/static/media/logo.496b486aab466e923154.png`,
      },
      {
        sourceUuid: chat.uuid,
        sourceName: chat.name || chat.username,
        dataMessage: {
          message: "Welcome to the demo chat!",
          attachments: [],
        },
        timestamp: new Date().toISOString(),
        avatar: chat.avatar,
      },
      {
        sourceUuid: chat.uuid,
        sourceName: chat.name || chat.username,
        dataMessage: {
          message: "Welcome to the demo chat!",
          attachments: [],
        },
        timestamp: new Date().toISOString(),
        avatar: chat.avatar,
      },
      {
        sourceUuid: chat.uuid,
        sourceName: chat.name || chat.username,
        dataMessage: {
          message: "Welcome to the demo chat!",
          attachments: [],
        },
        timestamp: new Date().toISOString(),
        avatar: chat.avatar,
      },
    ];
    currentChatId.value = chat.uuid;
    isGroup.value = chat._type === "group" ? "y" : "n";
    showChats0.value = "y";
  };
}
function sendMessage() {
  alert("Hey! your in demo mode, u can send messages!");
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
