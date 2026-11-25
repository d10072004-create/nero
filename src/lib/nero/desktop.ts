export type NeroDesktopApi = {
  isApp: true;
  speak: (text: string, rate: number) => Promise<boolean>;
  openPet: () => Promise<void>;
  closePet: () => Promise<void>;
};

export function neroDesktop(): NeroDesktopApi | null {
  if (typeof window === "undefined") return null;
  const api = (window as Window & { neroDesktop?: NeroDesktopApi }).neroDesktop;
  return api?.isApp ? api : null;
}
