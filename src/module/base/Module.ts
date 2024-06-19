import { Valve } from "../../Valve";
import { Transfer } from "../transferrer/Transfer";

export class Module {
    private _valve: Valve;

    private _transfer = Transfer;
    get transfer() {
        return this._transfer;
    }

    get valve() {
        return this._valve;
    }

    constructor(valve: Valve) {
        this._valve = valve;
    }
}