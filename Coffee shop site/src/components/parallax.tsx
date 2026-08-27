import { useEffect, useRef, type ReactNode } from "react";

export function Parallax({ children, speed = 0.3, className = "" }: { children: ReactNode; speed?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const offset = (rect.top + rect.height / 2 - window.innerHeight / 2) * speed * -1;
        el.style.transform = `translate3d(0, ${offset}px, 0)`;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
  }, [speed]);
  return <div ref={ref} className={`parallax-slow ${className}`}>{children}</div>;
}

export function ScrollRotate({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        el.style.transform = `rotate(${y * 0.08}deg)`;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
  }, []);
  return <div ref={ref} className={className}>{children}</div>;
}

export function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          el.classList.add("animate-reveal");
          obs.unobserve(el);
        }
      });
    }, { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return <div ref={ref} style={{ animationDelay: `${delay}ms`, opacity: 0 }} className={className}>{children}</div>;
}
