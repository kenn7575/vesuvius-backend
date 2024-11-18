export class TimeInterval {
  static isOverlapping(
    startTime1: Date,
    duration1: number,
    startTime2: Date,
    duration2: number
  ): boolean {
    const endTime1 = new Date(startTime1.getTime() + duration1 * 60000);
    const endTime2 = new Date(startTime2.getTime() + duration2 * 60000);
    return startTime1 < endTime2 && startTime2 < endTime1;
  }
}
