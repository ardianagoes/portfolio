import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SectionNavigation } from "./SectionNavigation";

const ids = ["top", "projects", "about", "experience", "skills", "contact"];
let tops: number[];
let height: number;
let scrollY: number;
let contactRect: DOMRect;
let intersectionCallback: () => void;
let resizeCallback: () => void;
let frameCallback: FrameRequestCallback | undefined;
const disconnect = vi.fn();
const resizeDisconnect = vi.fn();

function rect(top: number, bottom = top + 600, right = 1000): DOMRect {
  return {
    top,
    bottom,
    left: 24,
    right,
    width: right - 24,
    height: bottom - top,
    x: 24,
    y: top,
    toJSON: () => ({}),
  };
}

function refresh(event = "scroll") {
  act(() => {
    window.dispatchEvent(new Event(event));
    const callback = frameCallback;
    frameCallback = undefined;
    callback?.(0);
  });
}

function mount() {
  return render(
    <>
      <header>
        <a href="#top">Home</a>
      </header>
      <SectionNavigation />
      {ids.map((id) => (
        <section id={id} key={id}>
          <h2>{id}</h2>
          {id === "contact" && (
            <form aria-label="Contact">
              <input aria-label="Name" />
            </form>
          )}
        </section>
      ))}
    </>,
  );
}

function current() {
  return within(screen.getByRole("navigation", { name: "Page sections" })).getByRole("link", {
    current: "location",
  });
}

beforeEach(() => {
  tops = [0, 600, 2400, 3200, 4800, 5500];
  height = 6200;
  scrollY = 0;
  contactRect = rect(5600);
  frameCallback = undefined;
  vi.stubGlobal("innerHeight", 800);
  vi.stubGlobal("innerWidth", 1600);
  vi.stubGlobal("scrollY", 0);
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  vi.spyOn(document.documentElement, "scrollHeight", "get").mockImplementation(() => height);
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (
    this: HTMLElement,
  ) {
    if (this.tagName === "FORM") return contactRect;
    const index = ids.indexOf(this.id);
    const top = (tops[index] ?? 0) - scrollY;
    return rect(top, top + (index === 0 ? 600 : 800));
  });
  vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
    frameCallback = callback;
    return 1;
  });
  vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(callback: () => void) {
        intersectionCallback = callback;
      }
      observe = vi.fn();
      disconnect = disconnect;
    },
  );
  vi.stubGlobal(
    "ResizeObserver",
    class {
      constructor(callback: () => void) {
        resizeCallback = callback;
      }
      observe = vi.fn();
      disconnect = resizeDisconnect;
    },
  );
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("homepage section navigation", () => {
  it("starts at Top and links to each existing section", () => {
    mount();
    expect(current()).toHaveTextContent("Top");
    const links = within(screen.getByRole("navigation", { name: "Page sections" })).getAllByRole(
      "link",
    );
    expect(links.map((link) => link.getAttribute("href"))).toEqual(ids.map((id) => `#${id}`));
    expect(screen.queryByRole("button", { name: "Back to top" })).not.toBeInTheDocument();
  });

  it.each([1, 2, 3, 4, 5])("tracks section %i in either scroll direction", (index) => {
    mount();
    scrollY = (tops[index] ?? 0) - 100;
    vi.stubGlobal("scrollY", scrollY);
    refresh();
    expect(current()).toHaveAttribute("href", `#${ids[index]}`);
    scrollY = 0;
    vi.stubGlobal("scrollY", 0);
    refresh();
    expect(current()).toHaveAttribute("href", "#top");
  });

  it("activates Contact at the bottom even when its heading cannot reach the activation line", () => {
    mount();
    scrollY = 5400;
    tops[5] = 5800;
    vi.stubGlobal("scrollY", scrollY);
    refresh();
    expect(current()).toHaveAttribute("href", "#contact");
  });

  it("recalculates after viewport and content-size changes and observer notifications", () => {
    mount();
    tops[1] = 180;
    refresh("resize");
    expect(current()).toHaveAttribute("href", "#projects");
    vi.stubGlobal("innerHeight", 400);
    refresh("resize");
    expect(current()).toHaveAttribute("href", "#top");
    tops[1] = 80;
    act(() => intersectionCallback());
    refresh();
    expect(current()).toHaveAttribute("href", "#projects");
    tops[2] = 90;
    act(() => resizeCallback());
    refresh();
    expect(current()).toHaveAttribute("href", "#about");
  });

  it.each([false, true])(
    "returns instantly to the home link with reduced motion set to %s",
    (reducedMotion) => {
      vi.spyOn(window, "matchMedia").mockReturnValue({ matches: reducedMotion } as MediaQueryList);
      mount();
      scrollY = 601;
      vi.stubGlobal("scrollY", scrollY);
      refresh();
      fireEvent.click(screen.getByRole("button", { name: "Back to top" }));
      expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "instant" });
      expect(screen.getByRole("link", { name: "Home" })).toHaveFocus();
      scrollY = 0;
      vi.stubGlobal("scrollY", 0);
      refresh();
      expect(screen.queryByRole("button", { name: "Back to top" })).not.toBeInTheDocument();
    },
  );

  it("keeps the contact form clear on narrow screens and restores the button once clear", () => {
    mount();
    scrollY = 601;
    vi.stubGlobal("scrollY", scrollY);
    vi.stubGlobal("innerWidth", 390);
    contactRect = rect(500, 900, 366);
    refresh("resize");
    expect(screen.queryByRole("button", { name: "Back to top" })).not.toBeInTheDocument();
    contactRect = rect(-500, 100, 366);
    refresh();
    expect(screen.getByRole("button", { name: "Back to top" })).toBeInTheDocument();
  });

  it("works without observer support and cleans up pending work", () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    vi.stubGlobal("ResizeObserver", undefined);
    const view = mount();
    scrollY = 700;
    vi.stubGlobal("scrollY", scrollY);
    refresh();
    expect(current()).toHaveAttribute("href", "#projects");
    fireEvent.scroll(window);
    view.unmount();
    expect(window.cancelAnimationFrame).toHaveBeenCalled();
  });

  it("disconnects observers when leaving the homepage", () => {
    const view = mount();
    view.unmount();
    expect(disconnect).toHaveBeenCalledOnce();
    expect(resizeDisconnect).toHaveBeenCalledOnce();
  });
});
