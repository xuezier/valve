import { Valve } from "../../Valve";

export function moduleReady(valve: Valve) {
    valve.once('ready', () => {
        valve.Injector.rate = valve.rateLimitingController;
        if(!valve.config.enable)
            return;

        valve.config.rule.ip.start();
    });
}