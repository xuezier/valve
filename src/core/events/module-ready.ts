import { Valve } from "../../Valve";

export function moduleReady(valve: Valve) {
    valve.once('ready', () => {
        if(!valve.config.enable)
            return;

        valve.Injector.rate = valve.rateLimitingController;
        valve.config.rule.ip.start();
    });
}