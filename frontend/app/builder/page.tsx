import { Suspense } from "react";
import { BuilderPage } from "@/components/builder/BuilderPage";

export default function BuilderRoute() {
  return (
    <Suspense fallback={null}>
      <BuilderPage />
    </Suspense>
  );
}
