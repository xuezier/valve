/**
 * @author 图南
 * @email tunan@gaoding.com
 * @create date 2023-08-03 18:15:49
 * @modify date 2023-08-03 18:15:49
 * @desc koa-router 路由匹配简化版，使用 path-to-regexp 来管理正则路由匹配
 */

import { pathToRegexp } from 'path-to-regexp';
import { TMethod } from './type/TMethods';

// APILayer类表示一个API路由层，用于管理单个路由规则
export class APILayer {
    path: string; // 路由路径

    regexp: RegExp; // 路由路径对应的正则表达式

    methods: TMethod[] = []; // 支持的请求方法数组

    // 构造函数，初始化路由路径和请求方法
    constructor(path: string, method: TMethod) {
        this.path = path; // 初始化路由路径

        this.methods = [ method ]; // 初始化支持的请求方法

        this.regexp = pathToRegexp(path); // 将路由路径转换为正则表达式
    }

    // 检查请求路径和请求方法是否匹配当前路由层
    match(path: string, method?: TMethod) {
        if(method)
            return this.methods.includes(method) && this.regexp.test(path);

        // 如果没有指定请求方法，只检查路径是否匹配
        return this.regexp.test(path);
    }

    // 用于向后兼容，调用match方法检查请求路径是否匹配
    matchPath(path: string) {
        return this.match(path);
    }

    // 添加支持的请求方法，使用Set避免重复添加
    addMethod(method: TMethod) {
        this.methods = [...new Set([...this.methods, method])];
    }
}
