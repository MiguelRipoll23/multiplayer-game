import { MessageObject } from "../../objects/common/message-object.js";
import { CryptoService } from "../../services/crypto-service.js";
import { WebSocketService } from "../../services/websocket-service.js";
import { ApiService } from "../../services/api-service.js";
import { BaseGameScreen } from "../base/base-game-screen.js";
import { RegistrationResponse } from "../../interfaces/response/registration-response.js";
import { ServerRegistration } from "../../models/server-registration.js";
import { MainMenuScreen } from "./main-menu-screen.js";
import { GameController } from "../../models/game-controller.js";
import { CloseableMessageObject } from "../../objects/common/closeable-message-object.js";
import { GameState } from "../../models/game-state.js";
import { PlayerUtils } from "../../utils/player-utils.js";
import { EventType } from "../../enums/event-type.js";
import { EventProcessorService } from "../../services/event-processor-service.js";
import { PasskeyService } from "../../services/passkey-service.js";

export class LoginScreen extends BaseGameScreen {
  private gameState: GameState;
  private apiService: ApiService;
  private cryptoService: CryptoService;
  private webSocketService: WebSocketService;
  private eventProcessorService: EventProcessorService;
  private passkeyService: PasskeyService;

  private messageObject: MessageObject | null = null;
  private errorCloseableMessageObject: CloseableMessageObject | null = null;

  constructor(gameController: GameController) {
    super(gameController);

    this.gameState = gameController.getGameState();
    this.apiService = gameController.getApiService();
    this.cryptoService = gameController.getCryptoService();
    this.webSocketService = gameController.getWebSocketService();
    this.eventProcessorService = gameController.getEventProcessorService();
    this.passkeyService = new PasskeyService(gameController);
  }

  public override loadObjects(): void {
    this.loadMessageObject();
    this.loadCloseableMessageObject();

    super.loadObjects();
  }

  public override hasTransitionFinished(): void {
    super.hasTransitionFinished();
    this.checkForUpdates();
  }

  public override update(deltaTimeStamp: DOMHighResTimeStamp): void {
    this.listenForEvents();
    this.handleErrorCloseableMessageObject();
    super.update(deltaTimeStamp);
  }

  private handleServerConnectedEvent(): void {
    this.messageObject?.hide();
    this.transitionToMainMenuScreen();
  }

  private loadMessageObject(): void {
    this.messageObject = new MessageObject(this.canvas);
    this.uiObjects.push(this.messageObject);
  }

  private loadCloseableMessageObject(): void {
    this.errorCloseableMessageObject = new CloseableMessageObject(this.canvas);
    this.uiObjects.push(this.errorCloseableMessageObject);
  }

  private showError(message: string): void {
    this.messageObject?.setOpacity(0);
    this.errorCloseableMessageObject?.show(message);
  }

  private handleErrorCloseableMessageObject(): void {
    if (this.errorCloseableMessageObject?.isPressed()) {
      window.location.reload();
    }
  }

  private checkForUpdates(): void {
    this.messageObject?.show("Checking for updates...");

    this.apiService
      .checkForUpdates()
      .then((requiresUpdate) => {
        if (requiresUpdate) {
          return this.showError("An update is required to play the game");
        }

        this.messageObject?.hide();
        this.showDialog();
      })
      .catch((error) => {
        console.error(error);
        this.showError("An error occurred while checking for updates");
      });
  }

  private showDialog(): void {
    this.gameController.getGamePointer().setPreventDefault(false);

    const dialogElement = document.querySelector("dialog");
    const usernameElement = document.querySelector("#username-input");

    if (!dialogElement || !usernameElement) {
      console.error("Dialog element or username element not found");
      return;
    }

    dialogElement.showModal();
    usernameElement.setAttribute("value", PlayerUtils.getRandomName());

    const registerButton = document.querySelector("#register-button");

    registerButton?.addEventListener(
      "pointerup",
      this.handleRegisterClick.bind(this, usernameElement, dialogElement)
    );

    const signInButton = document.querySelector("#sign-in-button");

    signInButton?.addEventListener(
      "pointerup",
      this.handleSignInClick.bind(this, dialogElement)
    );

    this.passkeyService.showAutofillUI();
  }

  private handleRegisterClick(
    usernameElement: Element,
    dialogElement: HTMLDialogElement
  ): void {
    const username = usernameElement?.getAttribute("value") || "";

    if (username === "") {
      return;
    }

    dialogElement.close();
    this.gameController.getGamePointer().setPreventDefault(true);

    this.registerUser(username);
  }

  private async handleSignInClick(
    _dialogElement: HTMLDialogElement
  ): Promise<void> {
    await this.passkeyService.authenticateUser();
  }

  private registerUser(name: string): void {
    this.passkeyService.createCredential(name, name);

    this.apiService
      .registerUser(name)
      .then((registrationResponse: RegistrationResponse) => {
        this.gameState.getGamePlayer().setName(name);

        this.gameState
          .getGameServer()
          .setServerRegistration(new ServerRegistration(registrationResponse));

        this.downloadConfiguration();
      })
      .catch((error) => {
        console.error(error);
        this.showError("An error occurred while registering to the server");
      });
  }

  private downloadConfiguration(): void {
    this.messageObject?.show("Downloading configuration...");

    this.apiService
      .getConfiguration()
      .then(async (configurationResponse: ArrayBuffer) => {
        await this.applyConfiguration(configurationResponse);
      })
      .catch((error) => {
        console.error(error);
        this.showError("An error occurred while downloading configuration");
      });
  }

  private async applyConfiguration(
    configurationResponse: ArrayBuffer
  ): Promise<void> {
    const decryptedResponse = await this.cryptoService.decryptResponse(
      configurationResponse
    );

    const configuration = JSON.parse(decryptedResponse);
    this.gameState.getGameServer().setConfiguration(configuration);

    console.log("Configuration response (decrypted)", configuration);

    this.connectToServer();
  }

  private connectToServer(): void {
    this.messageObject?.show("Connecting to the server...");
    this.webSocketService.connectToServer();
  }

  private transitionToMainMenuScreen(): void {
    const mainMenuScreen = new MainMenuScreen(this.gameController, true);
    mainMenuScreen.loadObjects();

    this.screenManagerService
      ?.getTransitionService()
      .crossfade(mainMenuScreen, 0.2);
  }

  private listenForEvents(): void {
    this.eventProcessorService.listenLocalEvent(
      EventType.ServerConnected,
      this.handleServerConnectedEvent.bind(this)
    );
  }
}
