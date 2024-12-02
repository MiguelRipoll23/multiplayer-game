import { SerializedCredential } from "../serialized-credential.js";

export interface VerifyRegistrationRequest {
  username: string;
  registrationResponse: SerializedCredential;
}
