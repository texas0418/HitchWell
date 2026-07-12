import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/colors';
import { useStore, ClientInfo } from '../lib/store';
import { makeSettingsStyles } from '../lib/settingsStyles';

export default function SettingsLists() {
  const t = useTheme();
  const s = useMemo(() => makeSettingsStyles(t), [t]);
  const { clients, addClient, removeClient, projects, addProject, removeProject, clientInfo, setClientInfo } = useStore();
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<ClientInfo>({ contact: '', address: '', phone: '', email: '' });

  const fmtPhone = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 10);
    if (d.length < 4) return d;
    if (d.length < 7) return `${d.slice(0, 3)}-${d.slice(3)}`;
    return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  };

  const openEditor = (name: string) => {
    if (editing === name) { setEditing(null); return; }
    setDraft(clientInfo[name] ?? { contact: '', address: '', phone: '', email: '' });
    setEditing(name);
  };

  const saveEditor = () => {
    if (!editing) return;
    setClientInfo(editing, {
      contact: draft.contact.trim(),
      address: draft.address.trim(),
      phone: draft.phone.trim(),
      email: draft.email.trim(),
    });
    setEditing(null);
  };

  const [clientDraft, setClientDraft] = useState('');
  const [projectDraft, setProjectDraft] = useState('');

  const addClientFromDraft = () => {
    const n = clientDraft.trim();
    if (!n) return;
    addClient(n);
    setClientDraft('');
  };

  const addProjectFromDraft = () => {
    const n = projectDraft.trim();
    if (!n) return;
    addProject(n);
    setProjectDraft('');
  };

  return (
    <SafeAreaView style={s.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets>
        <Text style={s.sectionTitle}>Clients</Text>
        <Text style={s.note}>The list you pick from when logging days, expenses, and mileage. Reports group on these.</Text>
        {clients.length === 0 && <Text style={s.emptyList}>No clients yet. Add one below or from any log screen.</Text>}
        {clients.map((c) => (
          <View key={c}>
            <View style={s.listRow}>
              <Pressable style={{ flex: 1 }} onPress={() => openEditor(c)}>
                <Text style={s.listName}>{c}</Text>
                <Text style={s.note}>
                  {clientInfo[c] && (clientInfo[c].address || clientInfo[c].email || clientInfo[c].phone)
                    ? 'Contact info on file · tap to edit'
                    : 'Tap to add contact info for invoices'}
                </Text>
              </Pressable>
              <Pressable hitSlop={8} onPress={() => removeClient(c)}>
                <Ionicons name="trash-outline" size={17} color={t.faint} />
              </Pressable>
            </View>
            {editing === c && (
              <View style={{ paddingBottom: 14 }}>
                <Text style={s.label}>Contact Name</Text>
                <TextInput style={s.input} value={draft.contact} onChangeText={(v) => setDraft({ ...draft, contact: v })} placeholder="AP contact or supervisor" placeholderTextColor={t.faint} />
                <Text style={s.label}>Address</Text>
                <TextInput style={[s.input, s.multiline]} value={draft.address} onChangeText={(v) => setDraft({ ...draft, address: v })} placeholder="street, city, state, zip" placeholderTextColor={t.faint} multiline />
                <Text style={s.label}>Phone</Text>
                <TextInput style={s.input} value={draft.phone} onChangeText={(v) => setDraft({ ...draft, phone: fmtPhone(v) })} keyboardType="phone-pad" placeholder="optional" placeholderTextColor={t.faint} />
                <Text style={s.label}>Email</Text>
                <TextInput style={s.input} value={draft.email} onChangeText={(v) => setDraft({ ...draft, email: v })} keyboardType="email-address" autoCapitalize="none" placeholder="optional" placeholderTextColor={t.faint} />
                <Pressable style={s.saveBtn} onPress={saveEditor}><Text style={s.saveText}>Save Client Info</Text></Pressable>
              </View>
            )}
          </View>
        ))}
        <View style={s.addRow}>
          <TextInput
            style={[s.input, { flex: 1 }]}
            value={clientDraft}
            onChangeText={setClientDraft}
            placeholder="Add a client or staffing house"
            placeholderTextColor={t.faint}
            onSubmitEditing={addClientFromDraft}
            returnKeyType="done"
          />
          <Pressable style={s.addBtn} onPress={addClientFromDraft}><Text style={s.saveText}>Add</Text></Pressable>
        </View>

        <Text style={s.sectionTitle}>Projects</Text>
        <Text style={s.note}>Project names like Manatee or Powernap. Days, expenses, and mileage tag a project, and invoices can split by it.</Text>
        {projects.length === 0 && <Text style={s.emptyList}>No projects yet. Add one below or from any log screen.</Text>}
        {projects.map((p) => (
          <View key={p} style={s.listRow}>
            <Text style={s.listName}>{p}</Text>
            <Pressable hitSlop={8} onPress={() => removeProject(p)}>
              <Ionicons name="trash-outline" size={17} color={t.faint} />
            </Pressable>
          </View>
        ))}
        <View style={s.addRow}>
          <TextInput
            style={[s.input, { flex: 1 }]}
            value={projectDraft}
            onChangeText={setProjectDraft}
            placeholder="Add a project"
            placeholderTextColor={t.faint}
            onSubmitEditing={addProjectFromDraft}
            returnKeyType="done"
          />
          <Pressable style={s.addBtn} onPress={addProjectFromDraft}><Text style={s.saveText}>Add</Text></Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
