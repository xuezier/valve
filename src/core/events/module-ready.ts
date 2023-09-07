import { Valve } from "../../Valve";

export function moduleReady(valve: Valve) {
    valve.once('ready', () => {
        valve.config.rule.ip.start();
    });
}