export class LoggerUtils {
    category;
    constructor(category) {
        this.category = category;
    }
    info(message, ...args) {
        console.info(this.category, message, ...args);
    }
    warn(message, ...args) {
        console.warn(this.category, message, ...args);
    }
    debug(message, ...args) {
        console.debug(this.category, message, ...args);
    }
    error(message, ...args) {
        console.error(this.category, message, ...args);
    }
}
