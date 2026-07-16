import React, { useState } from 'react';
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { REFRESH_INTERVAL_OPTIONS, useSettings } from '../context/SettingsContext';
import { useTheme } from '../theme/useTheme';
import { InfoSection } from '../components/InfoSection';
import { GlossySurface } from '../components/GlossySurface';

export function SettingsScreen() {
  const theme = useTheme();
  const {
    units,
    setUnits,
    refreshIntervalSeconds,
    setRefreshIntervalSeconds,
    credentials,
    setCredentials,
  } = useSettings();

  const [clientId, setClientId] = useState(credentials?.clientId ?? '');
  const [clientSecret, setClientSecret] = useState(credentials?.clientSecret ?? '');

  const saveCredentials = () => {
    if (clientId.trim() && clientSecret.trim()) {
      setCredentials({ clientId: clientId.trim(), clientSecret: clientSecret.trim() });
    } else {
      setCredentials(null);
    }
  };

  return (
    <ScrollView
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={styles.content}
    >
      <InfoSection title="Units">
        <View style={styles.row}>
          <Text style={[styles.rowLabel, { color: theme.text }]}>Use metric units</Text>
          <Switch
            value={units === 'metric'}
            onValueChange={(v) => setUnits(v ? 'metric' : 'imperial')}
            trackColor={{ false: theme.surfaceAlt, true: theme.primary }}
            thumbColor="#ffffff"
            ios_backgroundColor={theme.surfaceAlt}
          />
        </View>
      </InfoSection>

      <InfoSection title="Refresh rate">
        <View style={styles.optionsRow}>
          {REFRESH_INTERVAL_OPTIONS.map((seconds) => {
            const isSelected = refreshIntervalSeconds === seconds;
            return (
              <Pressable key={seconds} onPress={() => setRefreshIntervalSeconds(seconds)}>
                <GlossySurface
                  tint={isSelected ? 'light' : 'dark'}
                  style={[styles.option, !isSelected && { borderColor: theme.border, borderWidth: 1 }]}
                >
                  <Text
                    style={{
                      color: isSelected ? theme.onPrimary : theme.text,
                      fontWeight: '600',
                      fontSize: 13,
                    }}
                  >
                    {seconds}s
                  </Text>
                </GlossySurface>
              </Pressable>
            );
          })}
        </View>
        <Text style={[styles.hint, { color: theme.textMuted }]}>
          Lower intervals use more of your OpenSky rate-limit allowance.
        </Text>
      </InfoSection>

      <InfoSection title="OpenSky account (optional)">
        <Text style={[styles.hint, { color: theme.textMuted }]}>
          Flight Tracker Free works out of the box using OpenSky's anonymous access, which is
          rate-limited. Adding a free OpenSky Network API client raises that limit considerably.
        </Text>
        <TextInput
          value={clientId}
          onChangeText={setClientId}
          placeholder="Client ID"
          placeholderTextColor={theme.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
          style={[styles.input, { color: theme.text, borderColor: theme.border }]}
        />
        <TextInput
          value={clientSecret}
          onChangeText={setClientSecret}
          placeholder="Client Secret"
          placeholderTextColor={theme.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry
          style={[styles.input, { color: theme.text, borderColor: theme.border }]}
        />
        <Pressable onPress={saveCredentials}>
          <GlossySurface tint="light" style={styles.saveButton}>
            <Text style={[styles.saveButtonText, { color: theme.onPrimary }]}>Save credentials</Text>
          </GlossySurface>
        </Pressable>
        <Pressable onPress={() => Linking.openURL('https://opensky-network.org/my-opensky/account')}>
          <Text style={[styles.link, { color: theme.text }]}>
            Get a free client ID / secret →
          </Text>
        </Pressable>
      </InfoSection>

      <InfoSection title="About">
        <Text style={[styles.hint, { color: theme.textMuted }]}>
          Live positions come from the OpenSky Network's crowd-sourced ADS-B/Mode S receiver
          network, so coverage depends on nearby volunteer receivers. Aircraft registration and
          route details are looked up from hexdb.io and may be missing for private or
          non-scheduled flights. Commercial / private / helicopter classification is inferred
          from callsign shape and ADS-B category and is not authoritative.
        </Text>
      </InfoSection>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 12, gap: 12, paddingBottom: 32 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowLabel: { fontSize: 14 },
  optionsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  option: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  hint: { fontSize: 12, lineHeight: 17 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
  },
  saveButton: {
    alignItems: 'center',
    borderRadius: 10,
    paddingVertical: 10,
  },
  saveButtonText: { fontWeight: '700', fontSize: 13 },
  link: { fontSize: 12, fontWeight: '600', textDecorationLine: 'underline' },
});
