import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { NeroActor } from "@/components/nero/figure";
import { neroDesktop } from "@/lib/nero/desktop";
import { useNeroStore } from "@/lib/nero/store";

export const Route = createFileRoute("/pet")({
  component: PetWindow,
});

function PetWindow() {
  const settings = useNeroStore();
  useEffect(() => {
    document.documentElement.classList.add("nero-pet");
    void useNeroStore.persist.rehydrate();
    return () => document.documentElement.classList.remove("nero-pet");
  }, []);
  return (
    <main className="nero-drag flex h-dvh items-end justify-center">
      <NeroActor
        look={settings.look}
        state="idle"
        roam={settings.roam}
        motion={settings.motion}
        scale={settings.scale}
        label="Nero"
        onDoubleClick={() => void neroDesktop()?.closePet()}
      />
    </main>
  );
}
