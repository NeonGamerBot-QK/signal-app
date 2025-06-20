import JSONRPCHandler from "./jsonrpc";

// one day ill organize my damn code :heavysob:
export function loadGCs() {}

export function loadMyInf() {}

export function makeArequest(body: JsonRPCHandler) {
  return fetch("/api/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // TODO: FINISH THIS FUNCTION
    },
  });
}
