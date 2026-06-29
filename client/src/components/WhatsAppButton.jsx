import { useI18n } from '../context/I18nContext';
import { useSiteConfig } from '../context/SiteConfigContext';

export default function WhatsAppButton() {
  const { t } = useI18n();
  const { whatsappNumber, siteName } = useSiteConfig();
  const number = whatsappNumber || '212600000000';
  const message = encodeURIComponent(`Bonjour ${siteName}, j'ai une question concernant vos produits.`);

  return (
    <a
      href={`https://wa.me/${number}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-8 right-8 z-50 flex items-center gap-2 bg-green-600 text-white px-4 py-3 shadow-md hover:bg-green-700 transition-colors text-sm"
      title={t('whatsapp')}
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.507 9.772c0 1.27-.259 2.488-.752 3.63-.494 1.14-1.16 2.082-1.997 2.828-.838.747-1.793 1.323-2.864 1.728-1.07.405-2.199.608-3.387.608-1.317 0-2.527-.239-3.63-.717l-4.051 1.345 1.358-3.957A8.74 8.74 0 011.5 9.772c0-1.27.24-2.488.717-3.63a9.128 9.128 0 011.978-2.828A9.244 9.244 0 017.51 1.3 9.62 9.62 0 0112 .003c1.27 0 2.488.24 3.63.717a9.342 9.342 0 012.828 1.979 9.227 9.227 0 011.979 2.827 9.42 9.42 0 01.717 3.556c0 1.317-.24 2.534-.717 3.63-.494 1.14-1.16 2.086-1.997 2.838l-2.794 1.13a6.875 6.875 0 01-.913-2.503 6.602 6.602 0 01-.215-1.648zm-2.78 1.963c.186-.304.42-.636.7-.998.282-.362.56-.677.838-.945.279-.269.56-.494.84-.677.282-.183.58-.296.895-.34v-.05c0-.523-.132-1.03-.395-1.524a5.307 5.307 0 00-1.047-1.38 4.798 4.798 0 00-1.538-1.002 5.162 5.162 0 00-1.886-.377c-.993 0-1.942.242-2.845.725a7.583 7.583 0 00-2.305 1.858c-.657.75-1.157 1.569-1.5 2.456s-.545 1.711-.545 2.57c0 .598.117 1.215.35 1.85.256.634.588 1.198.996 1.691.217-.616.5-1.194.85-1.734.35-.54.763-1.003 1.24-1.39a5.11 5.11 0 011.558-.935 5.216 5.216 0 011.607-.333c.59 0 1.123.108 1.597.324.474.215.92.508 1.338.878.416.37.705-.132.85-.322z" />
      </svg>
      <span>{t('whatsapp')}</span>
    </a>
  );
}
