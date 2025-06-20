<script setup type="ts">
const props = defineProps(['messages', 'n', 'skeleton'])
const n = null;
const cm  = []
// console.log(n)
// console.log('from chats.vue', messages)
const foundAvatars = {};

for(const m of props.messages ) {
  const item = m;
const avatar = foundAvatars[item.sourceUuid] ? foundAvatars[item.sourceUuid] :  await fetch(`/api/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        new JSONRPCHandler()
          .setMethod("getAvatar")
          .setPayload({ profile: item.sourceUuid })
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
      m.avatar = avatar;
      foundAvatars[item.sourceUuid] = avatar;
    cm.push(m)
}
</script>
<template>
  <div class="overflow-y-auto max-h-screen overflow-x-hidden m-0">
    <div v-for="msg in cm">
      <div v-if="msg.dataMessage">
        <div class="chat chat-start">
          <div class="chat-image avatar">
            <div class="w-10 rounded-full">
              <img alt="User avatar" :src="msg.avatar" />
            </div>
          </div>
          <div class="chat-header">
            {{ msg.sourceName }}
            <time
              class="text-xs opacity-50"
              :datetime="$dayjs(msg.timestamp).utc().toString()"
              >{{ $dayjs(msg.timestamp).utc().fromNow() }}</time
            >
          </div>
          <div class="chat-bubble">
            <p
              v-for="line in msg.dataMessage.message
                ? msg.dataMessage.message.split('\n')
                : [msg.dataMessage.message]"
            >
              {{ line }}
            </p>
            <!-- displaying attachments :3 -->
            <div
              v-if="
                msg.dataMessage.attachments &&
                msg.dataMessage.attachments.length > 0
              "
            >
              <div class="flex flex-wrap gap-2 mt-2">
                <div
                  v-for="(attachment, index) in msg.dataMessage.attachments"
                  :key="index"
                  class="bg-gray-200 dark:bg-gray-700 rounded-lg p-2"
                >
                  <a
                    :href="attachment.url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-blue-500 hover:underline"
                  >
                    {{ attachment.filename || `Attachment ${index + 1}` }}
                  </a>
                </div>
              </div>
            </div>
            <!--  TODO add icon for when msg expires -->
            <!-- <div class="chat-footer opacity-50">Delivered</div> -->
          </div>
        </div>
      </div>
      <div v-else-if="msg.syncMessage">
        <div class="chat chat-end">
          <div class="chat-image avatar">
            <div class="w-10 rounded-full">
              <img alt="Avatar" :src="msg.avatar" />
            </div>
          </div>
          <div class="chat-header">
            {{ msg.sourceName }}
            <!-- <time class="text-xs opacity-50">12:46</time> -->
            <time
              class="text-xs opacity-50"
              :datetime="$dayjs(msg.timestamp).utc().toString()"
              >{{ $dayjs(msg.timestamp).utc().fromNow() }}</time
            >
          </div>
          <div class="chat-bubble">
            {{ msg.syncMessage.sentMessage.message }}
          </div>
          <!-- <div class="chat-footer opacity-50">Seen at 12:46</div> -->
        </div>
      </div>
    </div>
  </div>
</template>
