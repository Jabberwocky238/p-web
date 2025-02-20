var _hook = (data: { message: string, variant: "success" | "error" | "info" | "warning" }) => {
    console.log(data);
}

export class Notify {
    static init(hook: typeof _hook) {
        console.log("[Notify] init");
        _hook = hook;
    }
    static success(message: string) {
        _hook({ message, variant: "success" });
    }
    static error(message: string) {
        _hook({ message, variant: "error" });
    }
    static info(message: string) {
        _hook({ message, variant: "info" });
    }
    static warning(message: string) {
        _hook({ message, variant: "warning" });
    }
}   