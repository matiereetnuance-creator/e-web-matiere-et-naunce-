import { getSettings } from '@/services/settings-repository';
import { SettingsInteractive } from './SettingsInteractive';

export async function SettingsView() {
  const settings = getSettings();
  return <SettingsInteractive settings={settings} />;
}
