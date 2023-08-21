export class IPRuleConfig {
    private white: string[] = [];

    private block: string[] = [];

    setWhite(ips: string[]) {
        this.white = ips;
    }

    setBlock(ips: string[]) {
        this.block = ips;
    }

    isWhite(ip: string) {
        return this.white.includes(ip);
    }

    isBlock(ip: string) {
        return this.block.includes(ip);
    }
}