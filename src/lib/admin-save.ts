import { toast } from "@/hooks/use-toast";
import type { PortfolioData } from "@/types";

export async function savePortfolioUpdate(
  updateData: (data: PortfolioData) => Promise<void>,
  data: PortfolioData,
  successTitle: string | null,
): Promise<boolean> {
  try {
    await updateData(data);
    if (successTitle) toast({ title: successTitle });
    return true;
  } catch (error) {
    toast({
      title: "Save failed",
      description: error instanceof Error ? error.message : "The portfolio could not be saved.",
      variant: "destructive",
    });
    return false;
  }
}
