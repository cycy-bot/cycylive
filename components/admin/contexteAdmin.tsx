"use client";

import { createContext, useContext } from "react";
import type { EtatAdmin } from "@/components/admin/useEtatAdmin";

export const ContexteAdmin = createContext<EtatAdmin | null>(null);

export function useAdmin(): EtatAdmin {
  const v = useContext<EtatAdmin | null>(ContexteAdmin);
  if (!v) throw new Error("useAdmin doit être utilisé dans l'administration");
  return v;
}
