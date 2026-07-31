import { getSettings } from '@/services/settings-repository';
import { SettingsInteractive } from './SettingsInteractive';

export async function SettingsView() {
  const settings = await getSettings();
  return <SettingsInteractive settings={settings} />;
}
