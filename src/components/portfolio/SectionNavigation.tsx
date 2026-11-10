import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

const sections = [
  { id: "top", label: "Top" },
  { id: "projects", label: "01 Projects" },
  { id: "about", label: "02 About" },
  { id: "experience", label: "03 Experience" },
  { id: "skills", label: "04 Skills" },
  { id: "contact", label: "05 Contact" },
];

export function SectionNavigation() {
  const [position, setPosition] = useState({ active: "top", showTop: false });

  useEffect(() => {
    const targets = sections.flatMap(({ id }) => {
      const element = document.getElementById(id);
      return element ? [element] : [];
    });
    let frame: number | undefined;

    function update() {
      frame = undefined;
      const activationLine = Math.min(200, window.innerHeight / 4);
      let active = "top";
      for (const target of targets) {
        if (target.getBoundingClientRect().top <= activationLine) active = target.id;
      }
      // The final section need not reach the activation line on a tall viewport.
      const height = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
      if (window.scrollY > 0 && window.scrollY + window.innerHeight >= height - 2) {
        active = targets.at(-1)?.id ?? active;
      }

      const hero = targets.find((target) => target.id === "top");
      // Leave the corner free whenever a contact control would sit underneath it.
      const overlapsContact = Array.from(
        document.querySelectorAll("#contact form, #contact a"),
      ).some((control) => {
        const rect = control.getBoundingClientRect();
        return (
          rect.right > window.innerWidth - 80 &&
          rect.left < window.innerWidth &&
          rect.bottom > window.innerHeight - 100 &&
          rect.top < window.innerHeight
        );
      });
      const showTop = Boolean(hero && hero.getBoundingClientRect().bottom <= 0 && !overlapsContact);
      setPosition((previous) =>
        previous.active === active && previous.showTop === showTop ? previous : { active, showTop },
      );
    }

    function scheduleUpdate() {
      if (frame === undefined) frame = window.requestAnimationFrame(update);
    }

    const observer =
      typeof IntersectionObserver === "undefined"
        ? undefined
        : new IntersectionObserver(scheduleUpdate, { rootMargin: "-15% 0px -70% 0px" });
    targets.forEach((target) => observer?.observe(target));
    const resizeObserver =
      typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(scheduleUpdate);
    resizeObserver?.observe(document.body);
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    window.addEventListener("hashchange", scheduleUpdate);
    update();

    return () => {
      observer?.disconnect();
      resizeObserver?.disconnect();
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      window.removeEventListener("hashchange", scheduleUpdate);
      if (frame !== undefined) window.cancelAnimationFrame(frame);
    };
  }, []);

  function backToTop() {
    window.scrollTo({ top: 0, behavior: "instant" });
    document
      .querySelector<HTMLAnchorElement>('header a[href="#top"]')
      ?.focus({ preventScroll: true });
  }

  return (
    <>
      <nav
        aria-label="Page sections"
        className="fixed left-8 top-1/2 z-20 hidden -translate-y-1/2 2xl:block"
      >
        <ol className="border-l border-border/60">
          {sections.map(({ id, label }) => (
            <li key={id} className="relative">
              <a
                href={`#${id}`}
                aria-current={position.active === id ? "location" : undefined}
                className={`block py-3 pl-5 pr-2 text-xs tracking-wide hover:text-primary ${position.active === id ? "font-semibold text-primary" : "text-muted-foreground/75"}`}
              >
                <span
                  aria-hidden="true"
                  className={`absolute -left-[3px] top-1/2 h-[5px] w-[5px] -translate-y-1/2 rounded-full ${position.active === id ? "bg-primary" : "bg-border"}`}
                />
                {label}
              </a>
            </li>
          ))}
        </ol>
      </nav>
      {position.showTop && (
        <button
          type="button"
          onClick={backToTop}
          aria-label="Back to top"
          className="fixed bottom-[max(1.5rem,env(safe-area-inset-bottom))] right-6 z-30 flex h-11 w-11 items-center justify-center rounded-md border border-border bg-background text-primary hover:border-primary"
        >
          <ArrowUp aria-hidden="true" className="h-5 w-5" />
        </button>
      )}
    </>
  );
}
