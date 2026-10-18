export interface ContactMessageRequest {
  garage_name?: string;
  primary_contact_person_name?: string;
  primary_contact?: string;
  name?: string;
  email: string;
  phone_number: string;
  message: string;
  source?: string;
}

export interface ContactMessageResponse {
  success: boolean;
  message: string;
  data?: any;
}
