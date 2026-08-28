"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { CalendarIcon, Loader2, Save } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/modules/tournaments/utils/tournament";
import {
  createGameSchema,
  updateGameSchema,
  GameCategory,
  SportType,
  categoryConfig,
  sportConfigExtended,
} from "@/modules/tournaments/schemas/games.schema";

export function GameForm({
  tournament,
  game = null,
  onSubmit,
  onCancel,
  loading = false,
}) {
  const [showConfirm, setShowConfirm] = useState(false);
  const isEditing = !!game;

  const form = useForm({
    resolver: zodResolver(isEditing ? updateGameSchema : createGameSchema),
    defaultValues: {
      sportType: game?.sportType || "",
      name: game?.name || "",
      shortName: game?.shortName || "",
      eventCode: game?.eventCode || "",
      format: game?.format || "",
      category: game?.category || "",
      date: game?.date || "",
      registrationDeadline: game?.registrationDeadline || "",
      registrationFee: game?.registrationFee || 0,
      matchDurationMinutes: game?.matchDurationMinutes ?? (game?.sportType === "FIELD_HOCKEY" ? 75 : null),
      minimumRestMinutes: game?.minimumRestMinutes ?? 30,
      teamSize: game?.teamSize || null,
      minRosterSize: game?.minRosterSize || null,
      maxRosterSize: game?.maxRosterSize || null,
      minAge: game?.minAge ?? null,
      maxAge: game?.maxAge ?? null,
      eligibilityCutoffDate: game?.eligibilityCutoffDate || "",
      allowedGenders: game?.allowedGenders || [],
      isActive: game?.isActive ?? true,
      icon: game?.icon || "",
      description: game?.description || "",
      rules: game?.rules || "",
    },
  });

  const handleSubmit = (data) => {
    setShowConfirm(true);
  };

  const confirmSubmit = async () => {
    const data = form.getValues();
    await onSubmit(data);
    setShowConfirm(false);
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="sportType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sport Type *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select sport" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(SportType).map(([key, value]) => {
                          const config = sportConfigExtended[value];
                          return (
                            <SelectItem key={value} value={value}>
                              {config?.icon} {config?.label}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(GameCategory).map(([key, value]) => {
                          const config = categoryConfig[value];
                          return (
                            <SelectItem key={value} value={value}>
                              {config?.icon} {config?.label}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Game Name *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Men's 7s Football Tournament"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField control={form.control} name="shortName" render={({ field }) => (
                <FormItem><FormLabel>Short name</FormLabel><FormControl><Input placeholder="e.g., Men's Hockey" {...field} value={field.value || ""} /></FormControl><FormDescription>Used in compact scorecards and public match lists.</FormDescription><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="eventCode" render={({ field }) => (
                <FormItem><FormLabel>Event code</FormLabel><FormControl><Input placeholder="e.g., M-HOCKEY-OPEN" {...field} value={field.value || ""} /></FormControl><FormDescription>Optional stable code for imports, reports and integrations.</FormDescription><FormMessage /></FormItem>
              )} />
            </div>

            <FormField
              control={form.control}
              name="format"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Format</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., 7-a-side, T20, 5s League"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional: Specify game format
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief description of the game..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Schedule & Registration */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Schedule & Registration</h3>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Game Date *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            {field.value ? (
                              format(new Date(field.value), "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={
                            field.value ? new Date(field.value) : undefined
                          }
                          onSelect={(date) =>
                            field.onChange(date?.toISOString())
                          }
                          disabled={(date) =>
                            date < new Date(tournament.startDate) ||
                            date > new Date(tournament.endDate)
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="registrationDeadline"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Registration Deadline *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            {field.value ? (
                              format(new Date(field.value), "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={
                            field.value ? new Date(field.value) : undefined
                          }
                          onSelect={(date) =>
                            field.onChange(date?.toISOString())
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="registrationFee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Registration Fee (₹) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="500"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <div><h3 className="font-semibold text-slate-950">Competition settings</h3><p className="mt-1 text-xs text-slate-500">These values drive fixture generation, roster checks and future sport-specific rules.</p></div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <FormField control={form.control} name="matchDurationMinutes" render={({ field }) => (<FormItem><FormLabel>Match duration (min)</FormLabel><FormControl><Input type="number" min="10" value={field.value ?? ""} onChange={(e)=>field.onChange(e.target.value ? Number(e.target.value) : null)} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="minimumRestMinutes" render={({ field }) => (<FormItem><FormLabel>Minimum rest (min)</FormLabel><FormControl><Input type="number" min="0" value={field.value ?? ""} onChange={(e)=>field.onChange(e.target.value ? Number(e.target.value) : 0)} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="teamSize" render={({ field }) => (<FormItem><FormLabel>On-field team size</FormLabel><FormControl><Input type="number" min="1" value={field.value ?? ""} onChange={(e)=>field.onChange(e.target.value ? Number(e.target.value) : null)} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="minRosterSize" render={({ field }) => (<FormItem><FormLabel>Minimum roster</FormLabel><FormControl><Input type="number" min="1" value={field.value ?? ""} onChange={(e)=>field.onChange(e.target.value ? Number(e.target.value) : null)} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="maxRosterSize" render={({ field }) => (<FormItem><FormLabel>Maximum roster</FormLabel><FormControl><Input type="number" min="1" value={field.value ?? ""} onChange={(e)=>field.onChange(e.target.value ? Number(e.target.value) : null)} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="minAge" render={({ field }) => (<FormItem><FormLabel>Minimum age</FormLabel><FormControl><Input type="number" min="0" max="120" value={field.value ?? ""} onChange={(e)=>field.onChange(e.target.value ? Number(e.target.value) : null)} /></FormControl><FormDescription>Optional. Age is calculated on the eligibility cutoff date.</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="maxAge" render={({ field }) => (<FormItem><FormLabel>Maximum age</FormLabel><FormControl><Input type="number" min="0" max="120" value={field.value ?? ""} onChange={(e)=>field.onChange(e.target.value ? Number(e.target.value) : null)} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="eligibilityCutoffDate" render={({ field }) => (<FormItem><FormLabel>Eligibility cutoff</FormLabel><FormControl><Input type="date" value={field.value ? String(field.value).slice(0,10) : ""} onChange={(e)=>field.onChange(e.target.value ? new Date(`${e.target.value}T00:00:00.000Z`).toISOString() : null)} /></FormControl><FormDescription>Defaults to the event date when not set.</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="allowedGenders" render={({ field }) => (<FormItem className="sm:col-span-2 lg:col-span-3"><FormLabel>Eligible gender</FormLabel><div className="flex flex-wrap gap-2">{["MALE","FEMALE","OTHER"].map((gender)=><Button key={gender} type="button" variant={(field.value || []).includes(gender) ? "default" : "outline"} size="sm" onClick={()=>{ const current=field.value || []; field.onChange(current.includes(gender) ? current.filter((v)=>v!==gender) : [...current, gender]); }}>{gender.charAt(0)+gender.slice(1).toLowerCase()}</Button>)}</div><FormDescription>Leave all unselected for an open event.</FormDescription><FormMessage /></FormItem>)} />
            </div>
          </div>

          {/* Additional Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Additional Details</h3>

            <FormField
              control={form.control}
              name="rules"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rules</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Game rules and regulations..."
                      className="resize-none"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active Status</FormLabel>
                    <FormDescription>
                      Enable or disable this game
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              {isEditing ? "Update Game" : "Create Game"}
            </Button>
          </div>
        </form>
      </Form>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isEditing ? "Update Game?" : "Create Game?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isEditing
                ? "Are you sure you want to update this game?"
                : "Are you sure you want to create this game?"}
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
