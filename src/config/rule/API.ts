import { EAPIRule } from "../../core/trigger/event/ERule";
import { Trigger } from "../../core/trigger/function/Trigger";
import { TRule } from './type/TRule';
import { TMethod } from '../../core/server/type/TMethods';
import { RuleAPILayer } from "./RuleLayer";

// APIRuleConfig类用于管理API规则配置，并继承自触发器类Trigger<EAPIRule>
export class APIRuleConfig extends Trigger<EAPIRule> {

    // 存储API规则的数组，每个元素包含路由层和对应的规则
    private rules: RuleAPILayer[] = [];

    // 缓存已经匹配过的 API 规则
    private matchedRule: Map<string, RuleAPILayer> = new Map();

    /**
     * 添加单个API规则
     * @param method - 请求方法
     * @param path - 路由路径
     * @param rule - API规则对象
     */
    addRule(method: TMethod, path: string, rule: TRule) {
        // 检查是否已存在相同的API规则
        const existsRuleLayer = this.getRule(path, method);
        if (existsRuleLayer) {
            // 如果已存在相同的API规则，则合并新的规则到已存在的规则
            Object.assign(existsRuleLayer.rule, rule);
        } else {
            // 如果不存在相同的API规则，则创建新的路由层并添加到规则数组中
            const layer = new RuleAPILayer(path, method);
            layer.rule = rule;
            this.rules.push(layer);
        }
    }

    getMatchedRule(path: string, method: TMethod) {
        return this.matchedRule.get(`${method} ${path}`);
    }

    /**
     * 获取匹配指定请求路径和方法的API规则
     * @param path - 请求路径
     * @param method - 请求方法
     * @returns 返回匹配的API规则对象，如果没有找到则返回undefined
     */
    getRule(path: string, method: TMethod) {
        const matched = this.getMatchedRule(path, method);
        if(matched)
            return matched;

        // 遍历所有的API规则
        for (const layer of this.rules) {
            // 检查当前API规则是否匹配给定的请求路径和方法
            if (layer.match(path, method)) {
                if(layer.path === path)
                    this.matchedRule.set(`${method} ${path}`, layer);

                return layer; // 返回匹配的API规则
            }
        }
        return undefined; // 如果没有找到匹配的规则，则返回undefined
    }

    removeRule(path: string, method: TMethod) {
        const index = this.rules.findIndex(rule => rule.match(path, method));

        if(index < 0)
            return;

        this.rules.splice(index, 1);
        this.matchedRule.delete(`${method} ${path}`);
    }

    /**
     * 批量添加API规则
     * @param rules - 包含请求路径、请求方法和API规则对象的数组
     */
    addRules(rules: {
        path: string;
        method: TMethod;
        rule: TRule;
    }[]) {
        for (const { path, method, rule } of rules) {
            // 检查是否已存在相同的API规则
            if (this.getRule(path, method)) {
                throw new TypeError(`duplicate api: '${method} ${path}' rule`);
            }
            // 否则添加新的API规则
            this.addRule(method, path, rule);
        }
    }
}
