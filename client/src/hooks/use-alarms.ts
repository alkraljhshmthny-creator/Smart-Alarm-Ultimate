import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertAlarm, type UpdateAlarmRequest } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useAlarms() {
  return useQuery({
    queryKey: [api.alarms.list.path],
    queryFn: async () => {
      const res = await fetch(api.alarms.list.path);
      if (!res.ok) throw new Error("Failed to fetch alarms");
      return api.alarms.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateAlarm() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertAlarm) => {
      const res = await fetch(api.alarms.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create alarm");
      return api.alarms.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.alarms.list.path] });
      toast({ title: "Alarm Set", description: "Your new alarm is ready." });
    },
    onError: () => {
      toast({ title: "Error", description: "Could not create alarm.", variant: "destructive" });
    },
  });
}

export function useUpdateAlarm() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & UpdateAlarmRequest) => {
      const url = buildUrl(api.alarms.update.path, { id });
      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update alarm");
      return api.alarms.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.alarms.list.path] });
    },
    onError: () => {
      toast({ title: "Error", description: "Could not update alarm.", variant: "destructive" });
    },
  });
}

export function useDeleteAlarm() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.alarms.delete.path, { id });
      const res = await fetch(url, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete alarm");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.alarms.list.path] });
      toast({ title: "Alarm Deleted", description: "The alarm has been removed." });
    },
    onError: () => {
      toast({ title: "Error", description: "Could not delete alarm.", variant: "destructive" });
    },
  });
}
