import JSONRPCHandler from "./jsonrpc";

// one day ill organize my damn code :heavysob:
export function loadGCs() {
  return makeArequest(
    new JSONRPCHandler().setMethod("listGroups").setPayload({}),
  );
}

export function loadMyInf() {
  return makeArequest();
}
// 1. use sessionStorage cache - X for now since sessionStorage isnt reachable via server
// 2. ig we fetching the api now
export async function getAvatar(id_thing: string): string {
  // if(window.sessionStorage.getItem(id_thing)) {
  //     return window.sessionStorage.getItem(id_thing) as string;
  //   }

  // get via api
  // store in session storage cuz sob
  const the_avatar = await makeArequest(
    new JSONRPCHandler()
      .setMethod("getAvatar")
      .setPayload({ profile: id_thing }),
  ).then((d) => {
    return d.error
      ? "https://gravatar.com/avatar/27205e5c51cb03f862138b22bcb5dc20f94a342e744ff6df1b8dc8af3c865109?f=y"
      : `data:image/png;base64,${d.result.data}`;
  });
  // window.sessionStorage.setItem(id_thing, the_avatar);

  return the_avatar;
}

export function makeArequest(body: JsonRPCHandler) {
  return fetch("/api/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body.build()),
  }).then((r) => r.json());
}
