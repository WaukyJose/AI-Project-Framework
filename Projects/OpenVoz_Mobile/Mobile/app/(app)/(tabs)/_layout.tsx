import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { languageIdentities } from '../../../constants/language-identity';
import { useUiPreferencesStore } from '../../../store/ui-preferences-store';

const tabLabels = {
  en: {
    dashboard: 'Home',
    practice: 'Practice',
    progress: 'Progress',
    profile: 'Profile',
    settings: 'Settings',
  },
  es: {
    dashboard: 'Inicio',
    practice: 'Práctica',
    progress: 'Progreso',
    profile: 'Perfil',
    settings: 'Configuración',
  },
} as const;

export default function AppTabsLayout() {
  const uiLanguage = useUiPreferencesStore((state) => state.uiLanguage);
  const identity = languageIdentities[uiLanguage];

  return (
    <NativeTabs
      backgroundColor="#FFFFFF"
      disableTransparentOnScrollEdge
      iconColor={{ default: '#94A3B8', selected: identity.accent }}
      labelStyle={{
        color: '#64748B',
        fontSize: 10,
        fontWeight: '600',
      }}
      tintColor={identity.accent}
    >
      <NativeTabs.Trigger name="dashboard">
        <NativeTabs.Trigger.Icon
          sf={{ default: 'house', selected: 'house.fill' }}
          md="home"
        />
        <NativeTabs.Trigger.Label>{tabLabels[uiLanguage].dashboard}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="practice">
        <NativeTabs.Trigger.Icon sf={{ default: 'mic', selected: 'mic.fill' }} md="mic" />
        <NativeTabs.Trigger.Label>{tabLabels[uiLanguage].practice}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="progress">
        <NativeTabs.Trigger.Icon
          sf={{
            default: 'chart.line.uptrend.xyaxis',
            selected: 'chart.line.uptrend.xyaxis.circle.fill',
          }}
          md="trending_up"
        />
        <NativeTabs.Trigger.Label>{tabLabels[uiLanguage].progress}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Icon
          sf={{ default: 'person', selected: 'person.fill' }}
          md="person"
        />
        <NativeTabs.Trigger.Label>{tabLabels[uiLanguage].profile}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Icon
          sf={{ default: 'gearshape', selected: 'gearshape.fill' }}
          md="settings"
        />
        <NativeTabs.Trigger.Label>{tabLabels[uiLanguage].settings}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
