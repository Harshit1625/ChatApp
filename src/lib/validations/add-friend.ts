import { z } from "zod";

export const addFriendValidation = z.object({
    email : z.string().email(),
})