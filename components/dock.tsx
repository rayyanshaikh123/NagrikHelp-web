import React from "react";
import {
  IconBrandGithub,
  IconBrandX,
  IconExchange,
  IconHome,
  IconNewSection,
  IconTerminal2,
} from "@tabler/icons-react";

type DockItem = {
  title: string;
  icon: React.ReactNode;
  href: string;
}

function FloatingDock({ items, mobileClassName }: { items: DockItem[]; mobileClassName?: string }) {
  return (
    <nav aria-label="Floating dock" className={`fixed right-6 bottom-6 z-50 hidden md:flex flex-col space-y-3 ${mobileClassName || ''}`}>
      <div className="bg-card/90 backdrop-blur-md border border-border rounded-full p-2 shadow-lg flex flex-col space-y-2">
        {items.map((it) => (
          <a
            key={it.title}
            href={it.href}
            title={it.title}
            className="block w-10 h-10 rounded-full flex items-center justify-center hover:bg-muted/60 transition-colors"
            aria-label={it.title}
          >
            <span className="w-5 h-5">{it.icon}</span>
          </a>
        ))}
      </div>
    </nav>
  )
}

export function FloatingDockDemo() {
  const links: DockItem[] = [
    {
      title: "Home",
      icon: (
        <IconHome className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "#",
    },
    {
      title: "Products",
      icon: (
        <IconTerminal2 className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "#",
    },
    {
      title: "Components",
      icon: (
        <IconNewSection className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "#",
    },
    {
      title: "Aceternity UI",
      icon: (
        <img
          src="https://assets.aceternity.com/logo-dark.png"
          width={20}
          height={20}
          alt="Aceternity Logo"
        />
      ),
      href: "#",
    },
    {
      title: "Changelog",
      icon: (
        <IconExchange className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "#",
    },
    {
      title: "Twitter",
      icon: (
        <IconBrandX className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "#",
    },
    {
      title: "GitHub",
      icon: (
        <IconBrandGithub className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "#",
    },
  ];

  return (
    <div className="flex items-center justify-center h-[35rem] w-full">
      <FloatingDock
        mobileClassName="translate-y-20" // only for demo, remove for production
        items={links}
      />
    </div>
  );
}

export default FloatingDockDemo
