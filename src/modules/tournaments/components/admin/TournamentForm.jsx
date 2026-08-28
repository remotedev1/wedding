"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDays, Globe2, Loader2, Save, ShieldCheck, Trophy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  createTournamentSchema,
  updateTournamentSchema,
  TournamentStatus,
  TournamentVisibility,
} from "@/modules/tournaments/schemas/tournament.schema";

const timezones = [
  "Asia/Kolkata",
  "UTC",
  "Asia/Dubai",
  "Asia/Singapore",
  "Europe/London",
  "America/New_York",
];

const labelize = (value) =>
  value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const toDateInput = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
};

const fromDateInput = (value) => (value ? new Date(`${value}T00:00:00.000Z`).toISOString() : null);

export function TournamentForm({ tournament = null, onSubmit, onCancel, loading = false }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const isEditing = Boolean(tournament);

  const form = useForm({
    resolver: zodResolver(isEditing ? updateTournamentSchema : createTournamentSchema),
    defaultValues: {
      name: tournament?.name || "",
      shortName: tournament?.shortName || "",
      year: tournament?.year || new Date().getFullYear(),
      timezone: tournament?.timezone || "Asia/Kolkata",
      visibility: tournament?.visibility || "PUBLIC",
      startDate: tournament?.startDate || "",
      endDate: tournament?.endDate || "",
      registrationDeadline: tournament?.registrationDeadline || null,
      status: tournament?.status || "DRAFT",
      description: tournament?.description || "",
      info: tournament?.info || [],
      images: tournament?.images || [],
    },
  });

  const handleSubmit = () => setShowConfirm(true);

  const confirmSubmit = async () => {
    await onSubmit(form.getValues());
    setShowConfirm(false);
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
          <Card className="border-slate-200 shadow-sm dark:border-slate-800">
            <CardHeader className="pb-4">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-slate-950 p-2 text-white dark:bg-white dark:text-slate-950">
                  <Trophy className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-base">Tournament identity</CardTitle>
                  <CardDescription>Name the edition the way spectators and officials will see it.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Tournament name *</FormLabel>
                    <FormControl><Input {...field} placeholder="Chenanda Inter-Family Hockey Tournament 2026" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="shortName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Short name</FormLabel>
                    <FormControl><Input {...field} value={field.value || ""} placeholder="Chenanda Hockey 2026" /></FormControl>
                    <FormDescription>Used in compact scoreboards and mobile navigation.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Edition year *</FormLabel>
                    <FormControl>
                      <Input type="number" min="2000" max="2100" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Public description</FormLabel>
                    <FormControl><Textarea {...field} value={field.value || ""} rows={4} placeholder="Official tournament introduction, edition context and spectator information." /></FormControl>
                    <FormDescription>Keep this concise; match data and results are published separately.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm dark:border-slate-800">
            <CardHeader className="pb-4">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-slate-100 p-2 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  <CalendarDays className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-base">Schedule & registration</CardTitle>
                  <CardDescription>Define the authoritative tournament window used by fixtures and registration.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {[["startDate", "Start date *"], ["endDate", "End date *"], ["registrationDeadline", "Registration deadline"]].map(([name, label]) => (
                <FormField
                  key={name}
                  control={form.control}
                  name={name}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{label}</FormLabel>
                      <FormControl>
                        <Input type="date" value={toDateInput(field.value)} onChange={(e) => field.onChange(fromDateInput(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
              <FormField
                control={form.control}
                name="timezone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Timezone *</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select timezone" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {timezones.map((zone) => <SelectItem key={zone} value={zone}>{zone}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormDescription>All public fixture times are interpreted in this tournament timezone.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm dark:border-slate-800">
            <CardHeader className="pb-4">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-slate-100 p-2 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  <Globe2 className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-base">Publication & lifecycle</CardTitle>
                  <CardDescription>Separate operational status from whether spectators can discover the tournament.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Operational status *</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        {Object.values(TournamentStatus).map((value) => <SelectItem key={value} value={value}>{labelize(value)}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormDescription>Controls registration, scheduling and live operations.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="visibility"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Public visibility *</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        {Object.values(TournamentVisibility).map((value) => <SelectItem key={value} value={value}>{labelize(value)}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormDescription>Private hides it, unlisted allows direct access, public publishes it to the sports portal.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="md:col-span-2 flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                <p className="m-0 max-w-none">Public visibility does not grant administration access. Staff permissions remain enforced by the canonical server session and permission layer.</p>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading} className="sm:min-w-44">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {isEditing ? "Save tournament" : "Create tournament"}
            </Button>
          </div>
        </form>
      </Form>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{isEditing ? "Save tournament changes?" : "Create this tournament?"}</AlertDialogTitle>
            <AlertDialogDescription>
              {isEditing
                ? "The updated dates, lifecycle and publication settings will become authoritative for tournament operations."
                : "This creates the tournament shell. Events, venues, registrations and fixtures are configured afterwards."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSubmit} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
