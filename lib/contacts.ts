/**
 * lib/contacts.ts — Address Book / Saved Contacts Management
 *
 * Allows users to save frequently used Stellar wallet addresses with custom nicknames
 * in localStorage for quick selection in the ExpenseSplitter component.
 */

export interface SavedContact {
  id: string;
  name: string;
  publicKey: string;
  createdAt: string;
}

const STORAGE_KEY = "divify_saved_contacts";

/** Fetch all saved contacts from localStorage. */
export function getSavedContacts(): SavedContact[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error("Failed to load saved contacts:", err);
    return [];
  }
}

/** Save a new contact to localStorage. */
export function saveContact(name: string, publicKey: string): SavedContact {
  const contacts = getSavedContacts();
  const newContact: SavedContact = {
    id: `contact_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    name: name.trim(),
    publicKey: publicKey.trim(),
    createdAt: new Date().toISOString(),
  };
  
  // Prevent duplicate public keys
  const filtered = contacts.filter((c) => c.publicKey !== newContact.publicKey);
  const updated = [newContact, ...filtered];
  
  if (typeof window !== "undefined" && window.localStorage) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }
  return newContact;
}

/** Delete a contact by ID. */
export function deleteContact(id: string): SavedContact[] {
  const contacts = getSavedContacts();
  const updated = contacts.filter((c) => c.id !== id);
  if (typeof window !== "undefined" && window.localStorage) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }
  return updated;
}
