import { contactApi, useCreateContactMessageMutation } from "@/features/contact/api/contact.api";

export type { ContactMessageRequest, ContactMessageResponse } from "@/features/contact/api/contact.api";

export const driverContactApis = contactApi;
export { useCreateContactMessageMutation };

