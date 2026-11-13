/**
 * Fullscreen helper utilities for examination proctoring / distraction-free UI.
 */

export function enterFullscreen() {
  const elem = document.documentElement;
  try {
    if (elem.requestFullscreen) {
      return elem.requestFullscreen().catch(() => {});
    } else if (elem.webkitRequestFullscreen) {
      return elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      return elem.msRequestFullscreen();
    }
  } catch (err) {
    console.warn('Fullscreen request could not be completed:', err);
  }
}

export function exitFullscreen() {
  try {
    if (document.fullscreenElement || document.webkitFullscreenElement) {
      if (document.exitFullscreen) {
        return document.exitFullscreen().catch(() => {});
      } else if (document.webkitExitFullscreen) {
        return document.webkitExitFullscreen();
      }
    }
  } catch (err) {
    console.warn('Exit fullscreen could not be completed:', err);
  }
}

export function isCurrentlyFullscreen() {
  return !!(
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement
  );
}

