import { defineStorage } from "@aws-amplify/backend";

export const storage = defineStorage({
  name: "amplifyNotesDrive",
  access: (allow) => ({
    "profile_pictures/*": [
      allow.entity("identity").to(["read", "write", "delete"]),
    ],
  }),
});


