import { useEffect, useState } from "react";
import { WebContainer } from "@webcontainer/api";

let webcontainerPromise: Promise<WebContainer> | undefined;

function bootWebContainer() {
  if (!webcontainerPromise) {
    webcontainerPromise = WebContainer.boot();
  }
  return webcontainerPromise;
}

export function useWebContainer() {
  const [webcontainer, setWebcontainer] = useState<WebContainer>();

  useEffect(() => {
    let cancelled = false;

    bootWebContainer().then((instance) => {
      if (!cancelled) {
        setWebcontainer(instance);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return webcontainer;
}
