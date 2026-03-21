import { Suspense } from "react";
import HomePage from "@/components/HomePage";

export default function Page() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-dvh text-gray-400">Loading...</div>}>
      <HomePage />
    </Suspense>
  );
}
