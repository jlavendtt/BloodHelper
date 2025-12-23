// hooks/useContactImporter.ts
import * as Contacts from 'expo-contacts';
import { useMemo, useState } from 'react';
import { Linking, Platform } from 'react-native';


type Options = {
  onPick: (name: string, phone: string) => void;
  excludeNames?: string[]; // ✅ names already in game
};


export function useContactImporter({ onPick, excludeNames = [] }: Options) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [list, setList] = useState<Contacts.Contact[]>([]);
  const [query, setQuery] = useState('');
  const [access, setAccess] = useState<'none' | 'limited' | 'full'>('none');


  const norm = (s: string) => s.trim().toLowerCase();

const excluded = useMemo(() => {
  return new Set(excludeNames.map(norm));
}, [excludeNames]);



  // inside useContactImporter.ts

const refresh = async () => {
  setError(null);
  setLoading(true);

  try {
    // This may show the “Selected Contacts / Full Access” prompt if not decided yet
    await Contacts.requestPermissionsAsync();

    const perm = await Contacts.getPermissionsAsync();

    if (perm.status !== 'granted') {
      setAccess('none');
      setError('Contacts permission not granted.');
      setList([]);
      return;
    }

    // iOS can be "limited" (selected contacts only) or "all"
    const privileges = (perm as any).accessPrivileges;
    if (Platform.OS === 'ios') {
      if (privileges === 'limited') setAccess('limited');
      else if (privileges === 'all') setAccess('full');
      else setAccess('full'); // fallback if field not present in this SDK version
    } else {
      setAccess('full'); // Android: granted is effectively full access
    }

    // Fetch all pages (handles large contact lists)
    const all: Contacts.Contact[] = [];
    let pageOffset = 0;
    const pageSize = 1000;

    while (true) {
      const res = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers],
        pageSize,
        pageOffset,
      });

      all.push(...(res.data ?? []));

      if (!res.hasNextPage) break;
      pageOffset += pageSize;
    }

    setList(all);
  } catch {
    setError('Failed to load contacts.');
  } finally {
    setLoading(false);
  }
};


  const openPicker = async () => {
  await refresh();
  setOpen(true);
};

const selectMoreContacts = async () => {
  // Calling requestPermissionsAsync again is how iOS often shows
  // the “Select More Contacts” / “Keep Selected” prompt.
  await Contacts.requestPermissionsAsync();
  await refresh();
};

const openSettings = async () => {
  await Linking.openSettings();
};



  


  const closePicker = () => {
    setOpen(false);
    setQuery('');
  };

  const pickContact = (c: Contacts.Contact) => {
  const name =
    (c.name ?? `${c.firstName ?? ''} ${c.lastName ?? ''}`.trim()).trim();

  const phone = c.phoneNumbers?.[0]?.number?.trim() ?? '';

  if (!name) return;

  // ✅ Prevent adding if already in game (by name)
  if (excluded.has(norm(name))) return;

  onPick(name, phone);

  // ✅ Keep modal open so you can add multiple
  // closePicker();
};




  const filtered = useMemo(() => {
  const q = query.trim().toLowerCase();

  return list
    .filter(c => {
      const name =
        (c.name ?? `${c.firstName ?? ''} ${c.lastName ?? ''}`.trim()).trim();
      if (!name) return false;

      // ✅ remove contacts already in game
      if (excluded.has(norm(name))) return false;

      if (!q) return true;

      const phone = c.phoneNumbers?.[0]?.number?.trim() ?? '';
      return name.toLowerCase().includes(q) || phone.toLowerCase().includes(q);
    });
}, [list, query, excluded]);


  return {
  open,
  loading,
  error,
  query,
  filtered,
  access,               // ✅
  setQuery,
  openPicker,
  closePicker,
  pickContact,
  refresh,
  selectMoreContacts,   // ✅
  openSettings,         // ✅
};


}
