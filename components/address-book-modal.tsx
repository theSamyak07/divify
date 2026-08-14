"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getSavedContacts,
  saveContact,
  deleteContact,
  type SavedContact,
} from "@/lib/contacts";
import { UserPlus, Trash2, Check, BookUser } from "lucide-react";

interface AddressBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectContact?: (contact: SavedContact) => void;
}

export function AddressBookModal({
  isOpen,
  onClose,
  onSelectContact,
}: AddressBookModalProps) {
  const [contacts, setContacts] = useState<SavedContact[]>([]);
  const [name, setName] = useState("");
  const [publicKey, setPublicKey] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setContacts(getSavedContacts());
    }
  }, [isOpen]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter a contact name.");
      return;
    }
    if (!publicKey.trim() || !publicKey.startsWith("G") || publicKey.length !== 56) {
      setError("Valid Stellar public key (56 characters starting with 'G') is required.");
      return;
    }

    setError("");
    saveContact(name, publicKey);
    setName("");
    setPublicKey("");
    setContacts(getSavedContacts());
  };

  const handleDelete = (id: string) => {
    const updated = deleteContact(id);
    setContacts(updated);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <BookUser className="h-5 w-5 text-stellar-teal" />
            Address Book
          </DialogTitle>
          <DialogDescription>
            Save frequently used Stellar wallet addresses to quickly add them to expense splits.
          </DialogDescription>
        </DialogHeader>

        {/* Add Contact Form */}
        <form onSubmit={handleAdd} className="space-y-3 bg-muted/30 p-3 rounded-lg border">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <Label htmlFor="contact-name" className="text-xs">Name / Label</Label>
              <Input
                id="contact-name"
                placeholder="e.g. Alice"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div>
              <Label htmlFor="contact-key" className="text-xs">Public Key (G...)</Label>
              <Input
                id="contact-key"
                placeholder="GC7N4S5R..."
                value={publicKey}
                onChange={(e) => setPublicKey(e.target.value)}
                className="h-8 text-sm font-mono"
              />
            </div>
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <Button type="submit" size="sm" className="w-full gap-1 bg-stellar-teal hover:bg-stellar-teal/90 text-primary-foreground h-8 text-xs">
            <UserPlus className="h-3.5 w-3.5" />
            Save Contact
          </Button>
        </form>

        {/* Contacts List */}
        <div className="max-h-60 overflow-y-auto space-y-2 pr-1 mt-2">
          {contacts.length === 0 ? (
            <p className="text-xs text-center text-muted-foreground py-6">
              No saved contacts yet. Add your friends' wallet addresses above.
            </p>
          ) : (
            contacts.map((contact) => (
              <div
                key={contact.id}
                className="flex items-center justify-between p-2.5 rounded-md border bg-card hover:border-stellar-teal/50 transition-colors"
              >
                <div className="min-w-0 flex-1 mr-2">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {contact.name}
                  </p>
                  <p className="text-xs font-mono text-muted-foreground truncate">
                    {contact.publicKey}
                  </p>
                </div>
                <div className="flex gap-1">
                  {onSelectContact && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs gap-1 border-stellar-teal text-stellar-teal hover:bg-stellar-teal/10"
                      onClick={() => {
                        onSelectContact(contact);
                        onClose();
                      }}
                    >
                      <Check className="h-3 w-3" />
                      Select
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(contact.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
