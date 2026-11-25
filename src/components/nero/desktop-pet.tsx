import { useEffect, useRef } from "react";
import { neroDesktop } from "@/lib/nero/desktop";

type PipWindow = Window & { document: Document };

type PipApi = {
  requestWindow: (options: { width: number; height: number }) => Promise<PipWindow>;
};

export function canLeaveDesktop(): boolean {
  return neroDesktop() !== null || (typeof window !== "undefined" && "documentPictureInPicture" in window);
}

export function DesktopPet({
  open,
  src,
  frames,
  onClose,
}: {
  open: boolean;
  src: string;
  frames?: string[];
  onClose: () => void;
}) {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const srcRef = useRef(src);
  const framesRef = useRef(frames);
  const closeRef = useRef(onClose);
  srcRef.current = src;
  framesRef.current = frames;
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const id = window.setInterval(() => {
      const img = imgRef.current;
      if (!img) return;
      const list = framesRef.current;
      if (list && list.length > 0) {
        const index = Math.floor(performance.now() / (1000 / 12)) % list.length;
        const next = list[index];
        if (next && !img.src.endsWith(next)) img.src = next;
        return;
      }
      if (!img.src.endsWith(srcRef.current)) img.src = srcRef.current;
    }, 80);
    return () => window.clearInterval(id);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const api = (window as Window & { documentPictureInPicture?: PipApi }).documentPictureInPicture;
    if (!api) {
      closeRef.current();
      return;
    }
    let dead = false;
    let child: PipWindow | null = null;
    void api
      .requestWindow({ width: 300, height: 540 })
      .then((pip) => {
        if (dead) {
          pip.close();
          return;
        }
        child = pip;
        pip.document.body.style.cssText =
          "margin:0;background:#120e16;height:100vh;display:flex;align-items:flex-end;justify-content:center;";
        const img = pip.document.createElement("img");
        img.src = srcRef.current;
        img.alt = "";
        img.draggable = false;
        img.style.cssText = "width:100%;height:100%;object-fit:contain;object-position:bottom center;";
        pip.document.body.replaceChildren(img);
        imgRef.current = img;
        pip.addEventListener("pagehide", () => closeRef.current());
      })
      .catch(() => closeRef.current());
    return () => {
      dead = true;
      child?.close();
      imgRef.current = null;
    };
  }, [open]);

  return null;
}
