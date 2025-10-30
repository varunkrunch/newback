import * as React from "react"

const MOBILE_BREAKPOINT = 640
const TABLET_BREAKPOINT = 1024
const DESKTOP_BREAKPOINT = 1280

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

export function useMobile() {
  const [screenSize, setScreenSize] = React.useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  const [isMobile, setIsMobile] = React.useState(false);
  const [isTablet, setIsTablet] = React.useState(false);
  const [isDesktop, setIsDesktop] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setScreenSize({ width, height });
      
      // Mobile-first breakpoints
      setIsMobile(width < MOBILE_BREAKPOINT);
      setIsTablet(width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT);
      setIsDesktop(width >= TABLET_BREAKPOINT);
    };

    // Set initial size
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Utility functions for responsive behavior
  const isSmallScreen = () => screenSize.width < MOBILE_BREAKPOINT;
  const isMediumScreen = () => screenSize.width >= MOBILE_BREAKPOINT && screenSize.width < TABLET_BREAKPOINT;
  const isLargeScreen = () => screenSize.width >= TABLET_BREAKPOINT;
  const isExtraLargeScreen = () => screenSize.width >= DESKTOP_BREAKPOINT;

  // Touch detection
  const [isTouchDevice, setIsTouchDevice] = React.useState(false);
  
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const checkTouchDevice = () => {
      setIsTouchDevice(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        (navigator as any).msMaxTouchPoints > 0
      );
    };
    
    checkTouchDevice();
  }, []);

  return {
    isMobile,
    isTablet,
    isDesktop,
    screenSize,
    isSmallScreen,
    isMediumScreen,
    isLargeScreen,
    isExtraLargeScreen,
    isTouchDevice,
    // Responsive utilities
    mobile: isMobile,
    tablet: isTablet,
    desktop: isDesktop,
    // Screen size checks
    sm: screenSize.width >= MOBILE_BREAKPOINT,
    md: screenSize.width >= 768,
    lg: screenSize.width >= TABLET_BREAKPOINT,
    xl: screenSize.width >= DESKTOP_BREAKPOINT,
    '2xl': screenSize.width >= 1536,
  };
}
