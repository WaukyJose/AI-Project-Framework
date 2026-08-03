import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ScreenContainer } from '../../components/ui/screen-container';
import { useBackendDiagnostics } from '../../hooks/use-backend-diagnostics';
import { ApiError } from '../../services/api';
import { useConnectivityStore } from '../../store/connectivity-store';
import { getAvailableApiEnvironments } from '../../utils/env';

function formatStatus(value: boolean) {
  return value ? 'Connected' : 'Unavailable';
}

function formatCode(value: number | null) {
  return value === null ? 'Not received' : `${value}`;
}

function formatVersion(value: string | null) {
  return value ?? 'Unavailable';
}

function ErrorPanel({ error }: { error: unknown }) {
  if (!(error instanceof ApiError)) {
    return (
      <View style={[styles.card, styles.errorCard]}>
        <Text style={styles.cardTitle}>Last Error</Text>
        <Text style={styles.errorText}>An unexpected connectivity error occurred.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.card, styles.errorCard]}>
      <Text style={styles.cardTitle}>Last Error</Text>
      <Text style={styles.errorText}>{error.getUserMessage()}</Text>
      <Text style={styles.metaText}>Code: {error.code}</Text>
      <Text style={styles.metaText}>Status: {error.status ?? 'Not available'}</Text>
    </View>
  );
}

export function HomeScreen() {
  const selectedEnvironment = useConnectivityStore((state) => state.selectedEnvironment);
  const setSelectedEnvironment = useConnectivityStore((state) => state.setSelectedEnvironment);
  const { data, error, isFetching, isLoading, refetch } = useBackendDiagnostics();
  const environments = getAvailableApiEnvironments();

  return (
    <ScreenContainer>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Sprint 1</Text>
          <Text style={styles.title}>Backend connectivity</Text>
          <Text style={styles.body}>
            This screen validates the shared communication layer that future authentication,
            speaking, and assessment features will reuse.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Environment</Text>
          <View style={styles.environmentRow}>
            {environments.map((environment) => {
              const isSelected = environment.name === selectedEnvironment;

              return (
                <Pressable
                  key={environment.name}
                  onPress={() => void setSelectedEnvironment(environment.name)}
                  style={[styles.environmentButton, isSelected && styles.environmentButtonSelected]}
                >
                  <Text
                    style={[
                      styles.environmentButtonText,
                      isSelected && styles.environmentButtonTextSelected,
                    ]}
                  >
                    {environment.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={styles.metaText}>
            Base URL: {environments.find((item) => item.name === selectedEnvironment)?.apiBaseUrl}
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Backend Status</Text>
            <Pressable onPress={() => void refetch()} style={styles.refreshButton}>
              <Text style={styles.refreshButtonText}>Refresh</Text>
            </Pressable>
          </View>

          {isLoading || isFetching ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color="#22577A" />
              <Text style={styles.metaText}>Checking backend connectivity...</Text>
            </View>
          ) : null}

          <View style={styles.statusGrid}>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Server</Text>
              <Text style={styles.statusValue}>{formatStatus(data?.siteAvailable ?? false)}</Text>
              <Text style={styles.metaText}>HTTP {formatCode(data?.siteStatusCode ?? null)}</Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>API</Text>
              <Text style={styles.statusValue}>{formatStatus(data?.apiAvailable ?? false)}</Text>
              <Text style={styles.metaText}>
                HTTP {formatCode(data?.versionStatusCode ?? null)}
              </Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Version</Text>
              <Text style={styles.statusValue}>{formatVersion(data?.version ?? null)}</Text>
              <Text style={styles.metaText}>{data ? `${data.latencyMs} ms` : 'Pending'}</Text>
            </View>
          </View>

          <Text style={styles.noteText}>
            The current production backend responds on the main site and login route. As of August
            3, 2026, a dedicated read-only JSON `health` or `version` endpoint is not exposed on the
            live deployment.
          </Text>
        </View>

        {error ? <ErrorPanel error={error} /> : null}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Error Handling Coverage</Text>
          <Text style={styles.metaText}>
            No internet, timeout, invalid JSON, 401, 403, 500, and server-unavailable states are
            normalized by the shared API client.
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
    paddingBottom: 32,
  },
  eyebrow: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#22577A',
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: '#334155',
  },
  card: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    borderRadius: 20,
    borderWidth: 1,
    gap: 12,
    padding: 18,
  },
  cardHeaderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardTitle: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '700',
  },
  environmentButton: {
    borderColor: '#CBD5E1',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  environmentButtonSelected: {
    backgroundColor: '#22577A',
    borderColor: '#22577A',
  },
  environmentButtonText: {
    color: '#334155',
    fontSize: 14,
    fontWeight: '600',
  },
  environmentButtonTextSelected: {
    color: '#FFFFFF',
  },
  environmentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  errorCard: {
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
  },
  errorText: {
    color: '#991B1B',
    fontSize: 15,
    lineHeight: 22,
  },
  header: {
    gap: 10,
    paddingTop: 12,
  },
  loadingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  metaText: {
    color: '#64748B',
    fontSize: 13,
    lineHeight: 18,
  },
  noteText: {
    color: '#475569',
    fontSize: 14,
    lineHeight: 21,
  },
  refreshButton: {
    backgroundColor: '#E2E8F0',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  refreshButtonText: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '600',
  },
  statusGrid: {
    gap: 12,
  },
  statusItem: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
    padding: 14,
  },
  statusLabel: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  statusValue: {
    color: '#0F172A',
    fontSize: 20,
    fontWeight: '700',
  },
  title: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '700',
    color: '#0F172A',
  },
});
