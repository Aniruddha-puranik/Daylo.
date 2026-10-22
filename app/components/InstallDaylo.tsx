'use client';

import { useEffect, useState } from 'react';
import { Download, Smartphone } from 'lucide-react';

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

export function InstallDaylo({ compact = false }: { compact?: boolean }) {
  const [promptEvent, setPromptEvent] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches ||
      ('standalone' in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
    setInstalled(standalone);
    setIsIOS(/iphone|ipad|ipod/i.test(navigator.userAgent));

    const onPrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as InstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setPromptEvent(null);
      setShowHelp(false);
    };

    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const install = async () => {
    if (!promptEvent) {
      setShowHelp(current => !current);
      return;
    }
    await promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    if (choice.outcome === 'accepted') setInstalled(true);
    setPromptEvent(null);
  };

  return (
    <div className={`install-daylo${compact ? ' install-daylo-compact' : ''}`}>
      {!installed ? (
        <button className="button install-daylo-button" type="button" onClick={install} aria-expanded={showHelp}>
          {compact ? <Download size={15}/> : <Smartphone size={17}/>} Install Daylo app
        </button>
      ) : (
        <p className="install-daylo-status"><Smartphone size={16}/> Daylo is installed on this device.</p>
      )}
      {showHelp && !installed && (
        <div className="install-daylo-help" role="status">
          {isIOS ? (
            <><strong>Add Daylo to your Home Screen</strong><span>In Safari, tap Share, choose “Add to Home Screen,” then tap Add.</span></>
          ) : (
            <><strong>Install from your browser</strong><span>Open the browser menu and choose “Install app” or “Add to Home screen.”</span></>
          )}
        </div>
      )}
    </div>
  );
}
