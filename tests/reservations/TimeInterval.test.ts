import { describe, it, expect } from "vitest";
import { TimeInterval } from "../../core/reservations/TimeInterval";

describe("TimeInterval", () => {
  describe("isOverlapping", () => {
    it("should return true for overlapping intervals", () => {
      const startTime1 = new Date("2023-10-01T10:00:00");
      const duration1 = 60; // 60 minutes
      const startTime2 = new Date("2023-10-01T10:30:00");
      const duration2 = 60; // 60 minutes

      const result = TimeInterval.isOverlapping(
        startTime1,
        duration1,
        startTime2,
        duration2
      );
      expect(result).toBe(true);
    });

    it("should return false for non-overlapping intervals", () => {
      const startTime1 = new Date("2023-10-01T10:00:00");
      const duration1 = 60; // 60 minutes
      const startTime2 = new Date("2023-10-01T11:30:00");
      const duration2 = 60; // 60 minutes

      const result = TimeInterval.isOverlapping(
        startTime1,
        duration1,
        startTime2,
        duration2
      );
      expect(result).toBe(false);
    });

    it("should return true when one interval starts exactly when the other ends", () => {
      const startTime1 = new Date("2023-10-01T10:00:00");
      const duration1 = 60; // 60 minutes
      const startTime2 = new Date("2023-10-01T11:00:00");
      const duration2 = 60; // 60 minutes

      const result = TimeInterval.isOverlapping(
        startTime1,
        duration1,
        startTime2,
        duration2
      );
      expect(result).toBe(false);
    });

    it("should return true when one interval is completely within another", () => {
      const startTime1 = new Date("2023-10-01T10:00:00");
      const duration1 = 120; // 120 minutes
      const startTime2 = new Date("2023-10-01T10:30:00");
      const duration2 = 30; // 30 minutes

      const result = TimeInterval.isOverlapping(
        startTime1,
        duration1,
        startTime2,
        duration2
      );
      expect(result).toBe(true);
    });

    it("should return false when both intervals are the same", () => {
      const startTime1 = new Date("2023-10-01T10:00:00");
      const duration1 = 60; // 60 minutes
      const startTime2 = new Date("2023-10-01T10:00:00");
      const duration2 = 60; // 60 minutes

      const result = TimeInterval.isOverlapping(
        startTime1,
        duration1,
        startTime2,
        duration2
      );
      expect(result).toBe(true);
    });
  });
});
