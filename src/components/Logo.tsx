import React, { useState } from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export const Logo: React.FC<LogoProps> = ({ className = 'w-14 h-14', size }) => {
  const [sourceIndex, setSourceIndex] = useState(0);
  const sources = [
    '/logo.png',
    '/logo.PNG',
    '/20240531_005527921_iOS.PNG',
    '/20240531_005527921_iOS.png',
    '/logo.jpg',
    '/logo.jpeg',
    '/logo.svg',
  ];

  const currentSrc = sources[sourceIndex] || '/logo.svg';

  return (
    <div
      style={size ? { width: size, height: size } : undefined}
      className={`relative shrink-0 select-none rounded-full overflow-hidden aspect-square flex items-center justify-center ${className}`}
    >
      <img
        src={currentSrc}
        alt="Logo Antojitos Inaf Lafken"
        className="w-full h-full object-cover scale-[1.03] rounded-full"
        loading="eager"
        referrerPolicy="no-referrer"
        onError={() => {
          if (sourceIndex < sources.length - 1) {
            setSourceIndex((prev) => prev + 1);
          }
        }}
      />
    </div>
  );
};
