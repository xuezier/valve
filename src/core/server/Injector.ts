import { RateLimitingController } from "../../module";
import { install } from "./install";

export class Injector {
    private static _rate: RateLimitingController;
    public static set rate(rate: RateLimitingController) {
        this._rate = rate;
    }

    public static get rate() {
        return this._rate;
    }

    public static install() {
        install();
    }
}