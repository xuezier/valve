import { Transfer } from "../transferrer/Transfer";

export class Module {
    private _transfer = Transfer;
    get transfer() {
        return this._transfer;
    }
}