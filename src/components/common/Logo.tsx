import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  customLogoUrl?: string;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showSubtitle = true,
  customLogoUrl,
  className = '',
}) => {
  const sizeMap = {
    sm: {
      icon: 'w-7 h-7',
      title: 'text-sm font-extrabold',
      sub: 'text-[10px]',
    },
    md: {
      icon: 'w-9 h-9 sm:w-10 sm:h-10',
      title: 'text-base sm:text-lg font-extrabold',
      sub: 'text-[11px]',
    },
    lg: {
      icon: 'w-14 h-14 sm:w-16 sm:h-16',
      title: 'text-xl font-black',
      sub: 'text-xs',
    },
    xl: {
      icon: 'w-24 h-24 sm:w-28 sm:h-28',
      title: 'text-2xl font-black',
      sub: 'text-sm',
    },
  };

  const currentSize = sizeMap[size];
  const [imgSrc, setImgSrc] = React.useState(customLogoUrl || '/gcc-logo.png');

  React.useEffect(() => {
    setImgSrc(customLogoUrl || '/gcc-logo.png');
  }, [customLogoUrl]);

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Official Circular Emblem */}
      <img
        src={imgSrc}
        alt="Genius Coaching Centre (GCC) Quiz App Logo"
        referrerPolicy="no-referrer"
        className={`${currentSize.icon} object-contain rounded-full shadow-xs shrink-0 transition-transform hover:scale-105 bg-white`}
        onError={() => {
          if (imgSrc === '/gcc-logo.png') {
            setImgSrc('/gcc-original-logo.jpg');
          } else if (imgSrc === '/gcc-original-logo.jpg') {
            setImgSrc('/gcc-logo.svg');
          }
        }}
      />

      <div className="leading-tight">
        <div className={`tracking-tight ${currentSize.title}`}>
          <span className="text-slate-900">GCC </span>
          <span className="text-blue-700">Quiz App</span>
        </div>
        {showSubtitle && (
          <div className={`font-medium text-slate-500 tracking-normal ${currentSize.sub}`}>
            Genius Coaching Centre
          </div>
        )}
      </div>
    </div>
  );
};
