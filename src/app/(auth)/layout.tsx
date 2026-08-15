'use client';

/**
 * Schlankes Layout für Auth-Seiten (Login/Register).
 * Bewusst OHNE Sidebar/Dashboard-Wrapper, damit die Karte auf
 * jedem Gerät (v.a. Handy) vollflächig zentriert erscheint.
 */
import React from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-background p-4">
      {children}
    </div>
  );
}
