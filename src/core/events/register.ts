import { Valve } from "../../Valve";
import { moduleReady } from "./module-ready";
import { performanceCollect } from "./performance-collect";

export function register(valva: Valve) {
    moduleReady(valva);

    performanceCollect(valva);
}