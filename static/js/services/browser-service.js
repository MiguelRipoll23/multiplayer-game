export class BrowserService {
    canvas;
    constructor(canvas) {
        this.canvas = canvas;
        this.addEventListeners();
    }
    addEventListeners() {
        this.canvas.addEventListener("fullscreenchange", this.removeEventListeners.bind(this));
        this.canvas?.addEventListener("click", this.requestFullScreen.bind(this));
    }
    requestFullScreen() {
        this.canvas.requestFullscreen().catch((error) => {
            alert(`Error: ${error.message}`);
        });
    }
    removeEventListeners = () => {
        this.canvas.removeEventListener("click", this.requestFullScreen);
        this.canvas.removeEventListener("fullscreenchange", this.removeEventListeners);
    };
}
