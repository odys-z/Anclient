/** Copied from source of React-portal-overlay.
 *  Change for dependency error.
 *
 *  Use this for dialog showing components can not work with Material UI.
 *
 *  https://github.com/madeleineostoja/react-portal-overlay
 *  License: MIT
 */
import { CSSProperties, HTMLProps, ReactNode } from 'react';
export declare type OverlayProps = {
    /** Whether the overlay is open */
    open: boolean;
    /** Styles to apply to the default document-root portal */
    defaultPortalStyles?: CSSProperties | any;
    /** Custom element to render the overlay into */
    portal?: HTMLElement | null;
    /** Whether to close the overlay when clicked */
    closeOnClick?: boolean;
    /** Whether to close the overlay when the escape key is pressed */
    closeOnEsc?: boolean;
    /** Animation configuration */
    animation?: {
        duration: number;
        easing: string;
    } | null;
    /** Action when overlay closes */
    onClose?(): void;
    /** Content of the overlay */
    children?: ReactNode;
} & HTMLProps<HTMLDivElement>;
/**
 * A lightweight and performant fullscreen overlay component using React portals to render anywhere you need them to
 */
export declare function Overlay({ open, portal, closeOnClick, closeOnEsc, defaultPortalStyles, onClose, animation, children, ...attrs }: OverlayProps): JSX.Element;
