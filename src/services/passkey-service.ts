export class PasskeyService {
  public async showAutofillUI(): Promise<void> {
    if (
      typeof window.PublicKeyCredential !== "undefined" &&
      typeof window.PublicKeyCredential.isConditionalMediationAvailable ===
        "function"
    ) {
      const available =
        await PublicKeyCredential.isConditionalMediationAvailable();

      if (available) {
        try {
          // Retrieve authentication options for `navigator.credentials.get()`
          // from your server.
          const authOptions = await this.getAuthenticationOptions();
          // This call to `navigator.credentials.get()` is "set and forget."
          // The Promise will only resolve if the user successfully interacts
          // with the browser's autofill UI to select a passkey.
          const webAuthnResponse = await navigator.credentials.get({
            mediation: "conditional",
            publicKey: {
              ...authOptions,
              // see note about userVerification below
              userVerification: "preferred",
            },
          });

          if (webAuthnResponse === null) {
            // The user closed the autofill UI without selecting a passkey.
            console.log("User closed the autofill UI");
            return;
          }

          // Send the response to your server for verification and
          // authenticate the user if the response is valid.
          await this.verifyAutoFillResponse(webAuthnResponse);
        } catch (err) {
          console.error("Error with conditional UI:", err);
        }
      }
    }
  }

  private async getAuthenticationOptions(): Promise<PublicKeyCredentialRequestOptions> {
    // Retrieve authentication options from your server.
    const response = await fetch("/auth-options");
    return response.json();
  }

  private async verifyAutoFillResponse(credential: Credential): Promise<void> {
    // Send the response to your server for verification and
    // authenticate the user if the response is valid.
    const response = await fetch("/verify", {
      method: "POST",
      body: JSON.stringify(credential),
    });
    if (response.ok) {
      console.log("User authenticated successfully");
    } else {
      console.error("User authentication failed");
    }
  }
}
