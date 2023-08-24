import { Valve } from "../../Valve";
import { TUsage } from "../../module/performance/type/Usage";

/**
 * 监听性能收集事件并处理性能数据。
 *
 * @param valve - 用于性能监控的 Valve 实例。
 */
export function performanceCollect(valve: Valve) {
    const collector = valve.performanceCollector;
    let outOfRangeTimes = 0;
    let recoveryTimes = 0;

    // 监听 'collect' 事件，在性能收集时触发处理逻辑
    collector.on('collect', (usage: TUsage) => {
        const config = valve.config.performance.limit;

        const { cpu, memory } = usage;

        // 检查 CPU 和内存使用率是否超出设定限制
        const isOutOfRange = cpu > config.cpu || memory > config.memory;

        if (isOutOfRange && !valve.rateLimitingController.force) {
            outOfRangeTimes++;

            if(outOfRangeTimes >= valve.config.performance.limitThreshold) {
                outOfRangeTimes = 0;
                // 如果超出限制，记录日志，强制启用速率限制
                valve.logger.debug(`Performance usage exceeds limit: cpu: ${cpu}%, memory: ${memory}B`);
                const estimateCount = valve.rateLimitingController.counter.estimateCount();
                if(estimateCount < valve.config.rule.server.limit)
                    valve.config.rule.server.limit = estimateCount;

                valve.rateLimitingController.force = true;
                return;
            }
        }


        if(valve.rateLimitingController.force) {
            const recovery = valve.config.performance.recovery;

            // 检查 CPU 和内存使用率是否已恢复到设定的恢复阈值以下
            const isRecovery = cpu < recovery.cpu && memory < recovery.memory;

            // 如果之前启用了强制速率限制
            if (isRecovery) {
                recoveryTimes++;

                if(recoveryTimes >= valve.config.performance.recoveryThreshold) {
                    recoveryTimes = 0;
                    // 如果恢复，记录日志，并取消强制速率限制
                    valve.logger.debug(`Performance usage recovers: cpu: ${cpu}%, memory: ${memory}B`);
                    valve.rateLimitingController.force = false;
                    valve.config.rule.server.restore();
                }
            }
        }
    });

    if(valve.config.performance.enable)
        collector.emit('start', valve.config.performance.collectInterval);
}
