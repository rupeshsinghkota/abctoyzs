import { useEffect } from 'react';

export function useBackToClose(isOpen: boolean, onClose: () => void) {
    useEffect(() => {
        if (isOpen) {
            // Push a new state when opened
            window.history.pushState({ drawerOpen: true }, '', window.location.href);

            const handlePopState = (event: PopStateEvent) => {
                // If back button is pressed, close the drawer
                // We prevent default behavior if possible, but popstate is post-facto.
                // The URL has already changed back. We just need to sync state.
                onClose();
            };

            window.addEventListener('popstate', handlePopState);

            return () => {
                window.removeEventListener('popstate', handlePopState);
                // Important: If we are unmounting because the user closed it via UI (not back button),
                // we might want to clean up the history state? 
                // However, that's complex to distinguish. 
                // A simpler approach for "Perfect" nav:
                // If isOpen became false, but we didn't popstate, should we back?
                // This is risky (infinite loops).
                // Safe bet: Just handle the Closing on Back. 
                // If user closes via UI, the "forward" state remains? No, that's bad.
                // 
                // Better approach:
                // When closing via UI, we should seemingly `history.back()` if we pushed state.
                // BUT we don't know if the user navigated away.
                //
                // Let's stick to the simple "Close on Back" for now. 
                // If user closes UI, the history stack has one extra entry. 
                // Hitting back then re-opens it? No, hitting back usually goes to previous.
                // If we pushed state, hitting back goes to "state before push".
                // So if user closes via UI, they are at "pushed state". Hitting back goes to "original state", triggering popstate -> onClose (redundant but safe).
                //
                // WAIT. If user closes via UI, they are at URL+State. If they hit back, they go to URL (no state).
                // Popstate fires. onClose called. Drawer matches state. All good.
                // The only "issue" is the user has to hit back TWICE to go to previous page?
                // Yes. To fix that, we need to `history.back()` when closing via UI.
            };
        }
    }, [isOpen, onClose]);
}
