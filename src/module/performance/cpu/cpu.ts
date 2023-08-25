/**
 * 计算基于提供的起始时间、结束时间和 CPU 使用情况的 CPU 使用率。
 *
 * @param startTime - 开始时间，以 [秒，纳秒] 数组表示，表示测量开始的时间。
 * @param startUsage - 开始时的 CPU 使用情况，作为 NodeJS.CpuUsage 对象。
 * @param endTime - 结束时间，以 [秒，纳秒] 数组表示，表示测量结束的时间。
 * @param endUsage - 结束时的 CPU 使用情况，作为 NodeJS.CpuUsage 对象。
 * @returns 计算得到的 CPU 使用率，表示 CPU 时间占用在经过时间中的比例。
 */
export function getCPUUsage(
    startTime: [number, number],
    startUsage: NodeJS.CpuUsage,
    endTime: [number, number],
    endUsage: NodeJS.CpuUsage
  ): number {
    // 计算经过的高分辨率时间，以秒为单位。
    const elapsedHRTime = (endTime[0] - startTime[0]) + (endTime[1] - startTime[1]) * 1e-9;

    // 计算开始和结束时间之间的 CPU 使用情况差异。
    const elapsedCPUTime = (endUsage.user - startUsage.user) + (endUsage.system - startUsage.system);

    // 计算 CPU 使用率，表示 CPU 时间占用在经过时间中的比例。
    const cpuUsage = (elapsedCPUTime / (elapsedHRTime * 1000000));

    return cpuUsage;
  }
