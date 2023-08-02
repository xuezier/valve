import { pathToRegexp } from 'path-to-regexp';

import { EAPIRule } from "../../core/trigger/event/ERule";
import { Trigger } from "../../core/trigger/function/Trigger";
import { TRule } from './type/TRule';

// APIRuleConfig类用于管理API规则配置，并继承自触发器类Trigger<EAPIRule>
export class APIRuleConfig extends Trigger<EAPIRule> {
    // rules属性是一个映射，用于存储具体API对应的规则
    rules: {
        [x: string]: TRule;
    } = {};

    // regexpRules属性是一个Map，用于存储正则表达式匹配的API规则
    regexpRules: Map<string, TRule & {
        api: string;
        regexp: RegExp;
    }> = new Map();

    // regexpRuleEntries属性是regexpRules的键值对数组，用于方便遍历
    regexpRuleEntries = [...this.regexpRules.entries()];

    /**
     * 添加API规则
     * @param api - API路径
     * @param rule - API规则对象
     */
    addRule(api: string, rule: TRule) {
        if (this.rules[api]) {
            // 如果已经存在该API规则，则合并传入的规则到现有规则
            Object.assign(this.rules[api], rule);

            // 如果regexpRules中也存在该API规则，则同样合并传入的规则到现有规则
            if (this.regexpRules.has(api))
                Object.assign(<any>this.regexpRules.get(api), rule);
        } else {
            // 如果不存在该API规则，则创建新的规则并添加到rules和regexpRules中
            this.rules[api] = rule;

            const regexp = pathToRegexp(api); // 将API转换为正则表达式
            this.regexpRules.set(api, {
                api,
                regexp,
                ...rule, // 合并传入的规则到新创建的规则
            });
        }

        // 更新regexpRuleEntries，以便新的规则可以被遍历
        this.regexpRuleEntries = [...this.regexpRules.entries()];
    }

    /**
     * 根据API获取对应的规则
     * @param api - API路径
     * @returns 返回对应的规则对象，如果找不到则返回undefined
     */
    getRule(api: string) {
        if (this.rules[api])
            return this.rules[api];

        // 如果直接匹配的规则不存在，使用正则表达式遍历查找匹配的规则
        const regexpRule = this.regexpRuleEntries.find(([api, rule]) => {
            return rule.regexp.test(api);
        });
        return regexpRule;
    }

    /**
     * 批量添加API规则
     * @param rules - API规则对象的数组，每个元素包含api和rule属性
     * @throws TypeError 如果已经存在相同的API规则，抛出类型错误异常
     */
    addRules(rules: {
        api: string;
        rule: TRule;
    }[]) {
        for (const { api, rule } of rules) {
            if (this.rules[api])
                throw new TypeError(`duplicate api: '${api}' rule`);

            this.addRule(api, rule);
        }
    }
}
