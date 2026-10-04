import { useState, useEffect } from 'react';
import { checkIsMobile } from '../hud/GameHUD';

export interface DeviceLayout {
  isMobile: boolean;
  isLandscape: boolean;
  isMobileLandscape: boolean;
  isMobilePortrait: boolean;
  isDesktop: boolean;
  viewport: { width: number; height: number };
}

export const useDeviceLayout = (): DeviceLayout => {
  const [viewport, setViewport] = useState(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 1280,
    height: typeof window !== 'undefined' ? window.innerHeight : 720,
  }));

  const [mobile, setMobile] = useState(() => checkIsMobile());

  useEffect(() => {
    const handleResize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
      setMobile(checkIsMobile());
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  const isLandscape = viewport.width > viewport.height;
  const isMobileLandscape = mobile && isLandscape && viewport.height <= 560;
  const isMobilePortrait = mobile && !isLandscape && viewport.width <= 600;
  const isDesktop = !mobile && viewport.width > 768 && viewport.height > 520;

  return {
    isMobile: mobile,
    isLandscape,
    isMobileLandscape,
    isMobilePortrait,
    isDesktop,
    viewport,
  };
};
