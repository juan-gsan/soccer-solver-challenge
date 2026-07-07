import { describe, expect, it, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDebouncedValue } from "../hooks/useDebouncedValue";

describe("useDebouncedValue", () => {
  it("returns the initial value immediately", () => {
    const { result } = renderHook(() => useDebouncedValue("haaland", 300));
    expect(result.current).toBe("haaland");
  });

  it("does not update before the delay elapses", () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 300),
      {
        initialProps: { value: "h" },
      },
    );

    rerender({ value: "ha" });
    act(() => {
      vi.advanceTimersByTime(200); // still under 300ms
    });
    expect(result.current).toBe("h"); // unchanged yet

    vi.useRealTimers();
  });

  it("updates to the latest value once the delay elapses", () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 300),
      {
        initialProps: { value: "h" },
      },
    );

    rerender({ value: "ha" });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe("ha");

    vi.useRealTimers();
  });

  it("rapid consecutive changes only produce the FINAL value (this is the whole point: one network call, not one per keystroke)", () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 300),
      {
        initialProps: { value: "h" },
      },
    );

    // Simulates fast typing: each keystroke arrives before the previous
    // timer would have fired, so each one cancels the last.
    rerender({ value: "ha" });
    act(() => vi.advanceTimersByTime(100));
    rerender({ value: "haa" });
    act(() => vi.advanceTimersByTime(100));
    rerender({ value: "haal" });
    act(() => vi.advanceTimersByTime(100));
    expect(result.current).toBe("h"); // still nothing committed — under 300ms since last change

    act(() => vi.advanceTimersByTime(300));
    expect(result.current).toBe("haal"); // only the final value ever gets committed

    vi.useRealTimers();
  });
});
