import { SerializedCredential } from "../serialized-credential.js";

export interface VerifyRegistrationRequest {
  requestId: string;
  username: string;
  registrationResponse: SerializedCredential;
}
