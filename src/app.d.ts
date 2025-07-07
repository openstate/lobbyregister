// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import { AuthenticatedUser } from "./types"

declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      user?: AuthenticatedUser;
    }
    interface PageData {
      flash?: { type: 'success' | 'error'; message: string };      
    }
    // interface PageState {}
    // interface Platform {}
  }
}

export {};
