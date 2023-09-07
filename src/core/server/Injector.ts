import { Valve } from "../../Valve";
import { RateLimitingController } from "../../module";
import { install } from "./install";

export class Injector {
    private static _rate: RateLimitingController;
    public static set rate(rate: RateLimitingController) {
        this._rate = rate;
    }

    static valve: Valve;

    public static get rate() {
        return this._rate;
    }

    public static install() {
        install();
    }
}