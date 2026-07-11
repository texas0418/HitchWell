import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/colors';
import { useStore } from '../lib/store';
import { makeSettingsStyles } from '../lib/settingsStyles';

export default function SettingsLists() {
  const t = useTheme();
  const s = useMemo(() => makeSettingsStyles(t), [t]);
  const { clients, addClient, removeClient, projects, addProject, removeProject } = useStore();

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
      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        <Text style={s.sectionTitle}>Clients</Text>
        <Text style={s.note}>The list you pick from when logging days, expenses, and mileage. Reports group on these.</Text>
        {clients.length === 0 && <Text style={s.emptyList}>No clients yet. Add one below or from any log screen.</Text>}
        {clients.map((c) => (
          <View key={c} style={s.listRow}>
            <Text style={s.listName}>{c}</Text>
            <Pressable hitSlop={8} onPress={() => removeClient(c)}>
              <Ionicons name="trash-outline" size={17} color={t.faint} />
            </Pressable>
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
