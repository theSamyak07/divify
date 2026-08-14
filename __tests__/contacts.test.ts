import { describe, it, expect, beforeEach } from "vitest";
import {
  getSavedContacts,
  saveContact,
  deleteContact,
} from "../lib/contacts";

describe("lib/contacts.ts — Address Book", () => {
  beforeEach(() => {
    // Mock localStorage & window for Node.js test environment
    const store: Record<string, string> = {};
    const storageMock = {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        Object.keys(store).forEach((key) => delete store[key]);
      },
      length: 0,
      key: (index: number) => Object.keys(store)[index] || null,
    } as Storage;

    global.localStorage = storageMock;
    if (typeof window !== "undefined") {
      window.localStorage = storageMock;
    } else {
      (global as unknown as { window: unknown }).window = {
        localStorage: storageMock,
      };
    }
  });

  it("returns empty array initially", () => {
    const contacts = getSavedContacts();
    expect(contacts).toEqual([]);
  });

  it("saves a new contact successfully", () => {
    const contact = saveContact(
      "Alice",
      "GC7N4S5R46K6F3VJXN5L3K2M1P0O9I8U7Y6T5R4E3W2Q1A0S9D8F7G6H"
    );
    expect(contact.name).toBe("Alice");
    expect(contact.publicKey).toBe(
      "GC7N4S5R46K6F3VJXN5L3K2M1P0O9I8U7Y6T5R4E3W2Q1A0S9D8F7G6H"
    );

    const saved = getSavedContacts();
    expect(saved.length).toBe(1);
    expect(saved[0].name).toBe("Alice");
  });

  it("deletes a contact by ID", () => {
    const c1 = saveContact(
      "Alice",
      "GC7N4S5R46K6F3VJXN5L3K2M1P0O9I8U7Y6T5R4E3W2Q1A0S9D8F7G6H"
    );
    const c2 = saveContact(
      "Bob",
      "GD1A2B3C4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T1U2V3W4X5Y6Z7A"
    );

    expect(getSavedContacts().length).toBe(2);

    const remaining = deleteContact(c1.id);
    expect(remaining.length).toBe(1);
    expect(remaining[0].name).toBe("Bob");
  });
});
