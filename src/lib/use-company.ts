import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function useCompany(): string | null {
  const [companyId, setCompanyId] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("companies")
      .select("id")
      .single()
      .then(({ data }) => setCompanyId(data?.id ?? null));
  }, []);

  return companyId;
}
