import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { type UpdateSettingsRequest } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useSettings() {
  return useQuery({
    queryKey: [api.settings.get.path],
    queryFn: async () => {
      const res = await fetch(api.settings.get.path);
      if (!res.ok) throw new Error("Failed to fetch settings");
      return api.settings.get.responses[200].parse(await res.json());
    },
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (updates: UpdateSettingsRequest) => {
      const res = await fetch(api.settings.update.path, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update settings");
      return api.settings.update.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.setQueryData([api.settings.get.path], data);
      
      // Handle Theme Change
      document.body.setAttribute('data-theme', data.theme || 'dark_space');
      
      // Handle Language Change
      document.documentElement.lang = data.language || 'en';
      document.documentElement.dir = data.language === 'ar' ? 'rtl' : 'ltr';
      
      toast({ title: "Settings Saved", description: "Your preferences have been updated." });
    },
    onError: () => {
      toast({ title: "Error", description: "Could not update settings.", variant: "destructive" });
    },
  });
}
