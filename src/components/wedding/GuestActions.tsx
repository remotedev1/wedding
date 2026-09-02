"use client";

import { useMemo } from "react";
import { wedding } from "@/data/wedding";
import { createCalendarData } from "@/lib/calendar";

function invitationUrl() {
  if (typeof window !== "undefined") {
    return window.location.href;
  }
  return wedding.site.url;
}

function whatsappUrl() {
  const text = `${wedding.sharing.message}\n\n${invitationUrl()}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function GuestActions() {
  const calendarData = useMemo(
    () =>
      createCalendarData({
        title: `${wedding.couple.bride.name} & ${wedding.couple.groom.name} Wedding`,
        description: wedding.invitation.message,
        location: `${wedding.venue.name}, ${wedding.venue.place}`,
        start: wedding.weddingDate,
        end: wedding.weddingEndDate
      }),
    []
  );

  const downloadCalendar = () => {
    const blob = new Blob([calendarData], {
      type: "text/calendar;charset=utf-8"
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "wedding-invitation.ics";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  const nativeShare = async () => {
    if (!navigator.share) {
      window.open(whatsappUrl(), "_blank", "noopener,noreferrer");
      return;
    }

    try {
      await navigator.share({
        title: wedding.site.title,
        text: wedding.sharing.message,
        url: invitationUrl()
      });
    } catch {
      // A cancelled share dialog is expected and needs no UI error.
    }
  };

  return (
    <div className="guest-actions">
      <button type="button" onClick={nativeShare}>
        <span aria-hidden="true">↗</span>
        Share invitation
      </button>

      <a href={whatsappUrl()} target="_blank" rel="noreferrer">
        <span aria-hidden="true">✦</span>
        WhatsApp
      </a>

      <button type="button" onClick={downloadCalendar}>
        <span aria-hidden="true">＋</span>
        Add to calendar
      </button>
    </div>
  );
}
