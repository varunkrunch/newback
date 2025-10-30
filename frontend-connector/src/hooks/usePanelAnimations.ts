import { useState, useEffect } from 'react';

export interface PanelAnimationState {
  isAnimating: boolean;
  animationClass: string;
  staggerDelay: number;
}

export function usePanelAnimations() {
  const [animationState, setAnimationState] = useState<PanelAnimationState>({
    isAnimating: false,
    animationClass: '',
    staggerDelay: 0
  });

  const triggerPanelAnimation = (type: 'expand' | 'collapse' | 'slide-in' | 'slide-out') => {
    setAnimationState({
      isAnimating: true,
      animationClass: `animate-panel-${type}`,
      staggerDelay: 0
    });

    // Reset animation state after animation completes
    setTimeout(() => {
      setAnimationState({
        isAnimating: false,
        animationClass: '',
        staggerDelay: 0
      });
    }, 500); // Match animation duration
  };

  const getStaggeredAnimationClass = (index: number, baseClass: string = 'animate-stagger-in') => {
    const delay = Math.min(index + 1, 6);
    return `${baseClass} animate-stagger-${delay}`;
  };

  const getHoverAnimationClass = (baseClass: string = '') => {
    return `${baseClass} transition-all duration-300 hover:scale-[1.02] hover:shadow-md active:scale-95`;
  };

  const getButtonAnimationClass = (baseClass: string = '') => {
    return `${baseClass} transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-md animate-bounce-in`;
  };

  return {
    animationState,
    triggerPanelAnimation,
    getStaggeredAnimationClass,
    getHoverAnimationClass,
    getButtonAnimationClass
  };
}
