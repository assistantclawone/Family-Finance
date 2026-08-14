'use client';

/**
 * Lokaler No-op-Error-Listener.
 * Die ursprüngliche Komponente hing von Firebase-Fehlermodulen ab, die mit dem
 * localStorage-Umbau entfernt wurden. Sie bleibt als harmloser Platzhalter im
 * Baum, falls sie irgendwo eingebunden ist.
 */
export function FirebaseErrorListener() {
  return null;
}
