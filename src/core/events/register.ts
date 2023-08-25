import { Valve } from "../../Valve";
import { performanceCollect } from "./performance-collect";

export function register(valva: Valve) {
    performanceCollect(valva);
}