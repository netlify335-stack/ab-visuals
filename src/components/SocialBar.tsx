import { socialsList } from '../lib/format';
import type { SiteContent } from '../lib/types';
import { InstagramIcon, WhatsAppIcon, YouTubeIcon } from './Icons';

const ICONS = {
  instagram: InstagramIcon,
  youtube: YouTubeIcon,
  whatsapp: WhatsAppIcon,
};

export default function SocialBar({ cms, hidden }: { cms: SiteContent; hidden?: boolean }) {
  const links = socialsList(cms);
  if (!links.length) return null;
  return (
    <div className={`socialbar ${hidden ? 'hidden' : 'show'}`} aria-label="AB VISUALS social links">
      {links.map((link, i) => {
        const Icon = ICONS[link.id];
        return (
          <span key={link.id} style={{ display: 'contents' }}>
            {i > 0 && <i className="sep" aria-hidden="true" />}
            <a href={link.url} target="_blank" rel="noopener noreferrer" aria-label={link.label}>
              <Icon />
              <span>{link.label}</span>
            </a>
          </span>
        );
      })}
    </div>
  );
}
