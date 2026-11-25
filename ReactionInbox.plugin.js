/**
 * @name ReactionInbox
 * @author WillZero
 * @version 1.7.0
 * @description An in-app Reaction Inbox for Discord that tracks emoji reactions to your messages across all servers (including muted and 100k+ member servers) and DMs, styled to match Discord's native Inbox.
 * @website https://github.com/willzero123/discord-reaction-inbox
 * @source https://raw.githubusercontent.com/willzero123/discord-reaction-inbox/main/ReactionInbox.plugin.js
 */

const PLUGIN_NAME = "ReactionInbox";
const STYLE_ID = "ri-plugin-styles";
const BTN_ID = "ri-header-btn";
const PANEL_ID = "ri-popover-panel";
const TOOLTIP_ID = "ri-emote-tooltip";

const DEFAULT_SETTINGS = {
    maxEntries: 250,
    autoSyncMinutes: 2,
    keepRemoved: true,
    includeSelf: false,
    showInAppToast: false,
    useFloatingFallback: true,
};

const CSS = `
#${BTN_ID} {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 28px;
    margin: 0 2px;
    padding: 0;
    border: none;
    border-radius: 4px;
    background: transparent;
    color: var(--interactive-normal, #b5bac1);
    cursor: pointer;
    -webkit-app-region: no-drag;
    transition: color 0.12s ease, background-color 0.12s ease;
    flex-shrink: 0;
}
#${BTN_ID}:hover,
#${BTN_ID}.ri-active {
    color: var(--interactive-hover, #dbdee1);
    background-color: var(--background-modifier-hover, rgba(78, 80, 88, 0.3));
}
#${BTN_ID}.ri-floating {
    position: fixed;
    top: 44px;
    right: 16px;
    z-index: 1001;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--background-floating, #111214);
    border: 1px solid var(--background-modifier-accent, rgba(255,255,255,0.08));
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4);
}
#${BTN_ID} .ri-badge {
    position: absolute;
    top: 1px;
    right: 1px;
    min-width: 15px;
    height: 15px;
    padding: 0 4px;
    border-radius: 999px;
    background: var(--status-danger, #da373c);
    color: #fff;
    font-size: 10px;
    font-weight: 700;
    line-height: 15px;
    text-align: center;
    box-sizing: border-box;
    pointer-events: none;
    box-shadow: 0 0 0 2px var(--background-tertiary, #1e1f22);
}
#${BTN_ID} .ri-badge:empty {
    display: none;
}

#${PANEL_ID} {
    position: fixed;
    top: 42px;
    right: 16px;
    width: 730px;
    max-width: calc(100vw - 24px);
    height: calc(100vh - 56px);
    max-height: calc(100vh - 56px);
    z-index: 1002;
    display: flex;
    flex-direction: column;
    border-radius: 12px;
    background: var(--bg-overlay-floating, var(--background-surface-higher, var(--background-secondary, #1a1a1e)));
    color: var(--text-normal, #dbdee1);
    border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.08));
    box-shadow: 0 12px 36px rgba(0, 0, 0, 0.55);
    overflow: hidden;
    font-family: var(--font-primary, "gg sans", "Noto Sans", sans-serif);
    -webkit-app-region: no-drag;
}

.ri-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 16px 8px;
    background: transparent;
    gap: 10px;
    flex-shrink: 0;
}
.ri-title-wrap {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
}
.ri-title-icon {
    color: var(--header-primary, #f2f3f5);
    display: inline-flex;
    align-items: center;
}
.ri-title {
    font-family: var(--font-display, var(--font-primary, "gg sans", sans-serif));
    font-size: 20px;
    font-weight: 600;
    line-height: 24px;
    color: var(--header-primary, #f2f3f5);
    margin: 0;
}
.ri-header-actions {
    display: flex;
    align-items: center;
    gap: 8px;
}
.ri-header-icon-btn {
    width: 36px;
    height: 36px;
    padding: 0;
    border-radius: 8px;
    border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.06));
    background: var(--button-secondary-background, rgba(255, 255, 255, 0.06));
    color: var(--interactive-normal, #dbdee1);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background-color 0.12s ease, color 0.12s ease, border-color 0.12s ease;
}
.ri-header-icon-btn:hover {
    background: var(--button-secondary-background-hover, rgba(255, 255, 255, 0.12));
    color: var(--interactive-hover, #fff);
}
.ri-header-icon-btn.ri-btn-active {
    background: rgba(88, 101, 242, 0.22);
    border-color: rgba(88, 101, 242, 0.45);
    color: var(--text-brand, #949cf7);
}
.ri-header-icon-btn:disabled {
    cursor: default;
    opacity: 0.75;
}
@keyframes ri-spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}
.ri-header-icon-btn.ri-syncing svg {
    animation: ri-spin 0.9s linear infinite;
}

/* Native Discord Inbox underline tabs */
.ri-tabs {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 0 16px;
    background: transparent;
    border-bottom: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.08));
    flex-shrink: 0;
}
.ri-tab {
    position: relative;
    border: none;
    padding: 12px 16px;
    font-family: var(--font-primary, "gg sans", sans-serif);
    font-size: 16px;
    font-weight: 500;
    line-height: 20px;
    cursor: pointer;
    background: transparent;
    color: var(--interactive-normal, #949ba4);
    transition: color 0.12s ease;
}
.ri-tab:hover {
    color: var(--interactive-hover, #dbdee1);
}
.ri-tab.ri-tab-active {
    color: var(--text-brand, #949cf7);
}
.ri-tab.ri-tab-active::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    bottom: -1px;
    height: 2px;
    border-radius: 2px 2px 0 0;
    background: var(--brand-500, #5865f2);
}

.ri-search-wrap {
    display: none;
    align-items: center;
    padding: 12px 16px 0;
    background: transparent;
    flex-shrink: 0;
}
.ri-search-wrap.ri-search-open {
    display: flex;
}
.ri-search {
    width: 100%;
    box-sizing: border-box;
    padding: 8px 12px;
    border-radius: 8px;
    border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.08));
    background: var(--input-background, rgba(0, 0, 0, 0.25));
    color: var(--text-normal, #dbdee1);
    font-family: var(--font-primary, "gg sans", sans-serif);
    font-size: 14px;
    font-weight: 400;
    outline: none;
}
.ri-search::placeholder {
    color: var(--text-muted, #949ba4);
}
.ri-search:focus {
    border-color: var(--brand-500, #5865f2);
}

.ri-list {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: 14px 16px 16px;
    display: flex;
    flex-direction: column;
    gap: 14px;
}
.ri-list::-webkit-scrollbar {
    width: 8px;
}
.ri-list::-webkit-scrollbar-track {
    background: transparent;
}
.ri-list::-webkit-scrollbar-thumb {
    background: var(--scrollbar-auto-thumb, rgba(255, 255, 255, 0.16));
    border-radius: 4px;
}
.ri-list::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.28);
}

.ri-empty {
    padding: 40px 20px;
    text-align: center;
    color: var(--text-muted, #949ba4);
    font-size: 14px;
    line-height: 1.5;
}
.ri-empty strong {
    display: block;
    margin-bottom: 6px;
    color: var(--header-primary, #f2f3f5);
    font-size: 16px;
    font-weight: 600;
}

/* Native Discord Inbox Card */
.ri-card {
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    border-radius: 10px;
    background: var(--background-base-low, var(--background-primary, #202125));
    border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.08));
    overflow: hidden;
    cursor: pointer;
    transition: border-color 0.12s ease, background-color 0.12s ease;
}
.ri-card:hover {
    border-color: rgba(255, 255, 255, 0.15);
    background: var(--background-modifier-hover, #27282e);
}
.ri-card.ri-unread {
    border-left: 3px solid var(--brand-500, #5865f2);
}
.ri-card.ri-removed {
    opacity: 0.72;
}

/* Card Header Strip (matches native Discord Inbox card header) */
.ri-card-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    background: transparent;
    border-bottom: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.06));
}

.ri-source-icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    object-fit: cover;
    flex-shrink: 0;
    background: var(--background-tertiary, #18191c);
}
.ri-source-icon.ri-source-dm {
    border-radius: 50%;
}
.ri-source-acronym {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    flex-shrink: 0;
    background: var(--background-tertiary, #18191c);
    border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.08));
    color: var(--header-primary, #f2f3f5);
    font-size: 13px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    user-select: none;
}
.ri-source-acronym.ri-source-dm {
    border-radius: 50%;
}

.ri-source-crumb {
    flex: 1 1 auto;
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: var(--font-primary, "gg sans", sans-serif);
    line-height: 20px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.ri-source-guild {
    font-size: 15px;
    font-weight: 500;
    color: var(--header-secondary, #b5bac1);
    overflow: hidden;
    text-overflow: ellipsis;
}
.ri-source-sep {
    display: inline-flex;
    align-items: center;
    color: var(--text-muted, #80848e);
    flex-shrink: 0;
}
.ri-source-channel {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 16px;
    font-weight: 600;
    color: var(--header-primary, #f2f3f5);
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
}
.ri-source-channel-name {
    overflow: hidden;
    text-overflow: ellipsis;
}
.ri-source-hash {
    display: inline-flex;
    align-items: center;
    color: var(--channel-icon, #80848e);
    flex-shrink: 0;
}

.ri-inline-twemoji {
    width: 16px;
    height: 16px;
    vertical-align: -3px;
    object-fit: contain;
    display: inline-block;
    margin: 0 1px;
}

.ri-card-header-btns {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
}
.ri-icon-btn {
    width: 32px;
    height: 32px;
    padding: 0;
    border-radius: 8px;
    border: none;
    background: var(--button-secondary-background, rgba(255, 255, 255, 0.08));
    color: var(--interactive-normal, #dbdee1);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background-color 0.12s ease, color 0.12s ease;
}
.ri-icon-btn:hover {
    background: var(--button-secondary-background-hover, rgba(255, 255, 255, 0.15));
    color: var(--interactive-hover, #fff);
}
.ri-icon-btn.ri-icon-del:hover {
    background: rgba(218, 55, 60, 0.25);
    color: #f87171;
}

/* Card Body (Native Discord Reply-Spine layout matching Inbox → Mentions) */
.ri-card-body {
    padding: 14px 16px 16px;
    display: flex;
    flex-direction: column;
}

.ri-reply-context {
    position: relative;
    display: flex;
    align-items: center;
    gap: 6px;
    padding-left: 56px;
    margin-bottom: 5px;
    min-width: 0;
    font-size: 14px;
    line-height: 18px;
}
.ri-reply-context::before {
    content: "";
    position: absolute;
    left: 19px;
    top: 9px;
    bottom: -7px;
    width: 31px;
    border-top: 2px solid var(--interactive-muted, rgba(181, 186, 193, 0.35));
    border-left: 2px solid var(--interactive-muted, rgba(181, 186, 193, 0.35));
    border-top-left-radius: 6px;
    box-sizing: border-box;
    pointer-events: none;
}
.ri-reply-avatar {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
}
.ri-reply-author {
    font-weight: 500;
    color: var(--header-primary, #f2f3f5);
    opacity: 0.85;
    white-space: nowrap;
    flex-shrink: 0;
}
.ri-reply-snippet {
    font-weight: 400;
    color: var(--text-muted, #b5bac1);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
    flex: 1 1 auto;
}
.ri-card:hover .ri-reply-snippet {
    color: var(--text-normal, #dbdee1);
}
.ri-reply-snippet.ri-snippet-missing {
    color: var(--text-muted, #949ba4);
    font-style: italic;
}

.ri-main-row {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    min-width: 0;
}

.ri-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
    margin-top: 1px;
}
.ri-avatar-fallback {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    flex-shrink: 0;
    margin-top: 1px;
    background: var(--brand-500, #5865f2);
    color: #fff;
    font-size: 16px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    user-select: none;
}

.ri-body-content {
    flex: 1 1 auto;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 3px;
}

.ri-author-row {
    display: flex;
    align-items: baseline;
    gap: 8px;
    min-width: 0;
    line-height: 22px;
}
.ri-username {
    font-size: 16px;
    font-weight: 500;
    color: var(--header-primary, #f2f3f5);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.ri-reaction-row {
    display: flex;
    align-items: center;
    gap: 7px;
    margin-top: 1px;
    min-width: 0;
    flex-wrap: wrap;
}
.ri-reacted-label {
    font-size: 15px;
    font-weight: 400;
    line-height: 22px;
    color: var(--text-muted, #949ba4);
}

/* Normal-sized Discord reaction pill */
.ri-emoji-pill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 2px 8px;
    height: 26px;
    box-sizing: border-box;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.09);
    font-size: 16px;
    line-height: 1;
    flex-shrink: 0;
    user-select: none;
    transition: background-color 0.12s ease, border-color 0.12s ease;
}
.ri-emoji-pill:hover {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.22);
}
.ri-emoji-pill.ri-burst {
    background: rgba(168, 85, 247, 0.18);
    border-color: rgba(192, 132, 252, 0.55);
}
.ri-emoji-pill img {
    width: 18px;
    height: 18px;
    object-fit: contain;
    display: block;
}

.ri-tag {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    padding: 2px 6px;
    border-radius: 4px;
    flex-shrink: 0;
}
.ri-tag-removed {
    background: rgba(218, 55, 60, 0.2);
    color: #f38ba8;
}
.ri-tag-super {
    background: rgba(168, 85, 247, 0.22);
    color: #d8b4fe;
}
.ri-time {
    font-size: 12px;
    font-weight: 500;
    color: var(--text-muted, #949ba4);
    white-space: nowrap;
    flex-shrink: 0;
}

/* Native Discord Reaction Hover Tooltip */
#${TOOLTIP_ID} {
    position: fixed;
    z-index: 1005;
    pointer-events: none;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 14px;
    border-radius: 8px;
    background: var(--bg-overlay-floating, var(--background-floating, #111214));
    border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.08));
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
    color: var(--text-normal, #dbdee1);
    font-family: var(--font-primary, "gg sans", sans-serif);
    font-size: 14px;
    line-height: 1.35;
    max-width: 340px;
}
#${TOOLTIP_ID} .ri-tt-img {
    width: 48px;
    height: 48px;
    object-fit: contain;
    flex-shrink: 0;
    display: block;
}
#${TOOLTIP_ID} .ri-tt-fallback {
    font-size: 36px;
    line-height: 1;
    flex-shrink: 0;
}
#${TOOLTIP_ID} .ri-tt-text {
    color: var(--text-normal, #dbdee1);
    word-break: break-word;
}
#${TOOLTIP_ID} .ri-tt-name {
    font-weight: 600;
    color: var(--header-primary, #f2f3f5);
}

.ri-footer {
    flex-shrink: 0;
    padding: 8px 14px;
    font-size: 11px;
    color: var(--text-muted, #949ba4);
    background: var(--background-tertiary, #18191c);
    border-top: 1px solid var(--background-modifier-accent, rgba(255, 255, 255, 0.06));
    display: flex;
    justify-content: space-between;
    align-items: center;
}

/* Settings Panel */
.ri-settings {
    padding: 8px 4px;
    color: var(--text-normal, #dbdee1);
    display: flex;
    flex-direction: column;
    gap: 14px;
    font-size: 14px;
}
.ri-setting-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--background-modifier-accent, rgba(255, 255, 255, 0.06));
}
.ri-setting-info strong {
    display: block;
    color: var(--header-primary, #f2f3f5);
    margin-bottom: 2px;
}
.ri-setting-info span {
    font-size: 12px;
    color: var(--text-muted, #949ba4);
}
.ri-setting-row input[type="checkbox"] {
    width: 18px;
    height: 18px;
    accent-color: var(--brand-500, #5865f2);
    cursor: pointer;
}
.ri-setting-row input[type="number"] {
    width: 80px;
    padding: 5px 8px;
    border-radius: 4px;
    border: 1px solid var(--background-modifier-accent, rgba(255, 255, 255, 0.12));
    background: var(--input-background, #1e1f22);
    color: var(--text-normal, #dbdee1);
    font-size: 13px;
}
.ri-settings-buttons {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}
.ri-settings-btn {
    border: none;
    border-radius: 4px;
    padding: 7px 14px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    background: var(--brand-500, #5865f2);
    color: #fff;
}
.ri-settings-btn:hover {
    filter: brightness(1.08);
}
.ri-settings-btn.ri-secondary {
    background: var(--background-secondary-alt, #4e5058);
}
.ri-settings-btn.ri-danger-btn {
    background: var(--status-danger, #da373c);
}
`;

const ICON_SVG = `
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-3.5-9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm7 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm-3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
</svg>
`;

const LINK_SVG = `
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path fill="currentColor" d="M10.59 13.41c.41.39.41 1.03 0 1.42-.39.39-1.03.39-1.42 0a5.003 5.003 0 0 1 0-7.07l3.54-3.54a5.003 5.003 0 0 1 7.07 0 5.003 5.003 0 0 1 0 7.07l-1.49 1.49c.01-.82-.12-1.64-.4-2.42l.47-.48a2.982 2.982 0 0 0 0-4.24 2.982 2.982 0 0 0-4.24 0l-3.53 3.53a2.982 2.982 0 0 0 0 4.24zm2.82-4.24c.39-.39 1.03-.39 1.42 0a5.003 5.003 0 0 1 0 7.07l-3.54 3.54a5.003 5.003 0 0 1-7.07 0 5.003 5.003 0 0 1 0-7.07l1.49-1.49c-.01.82.12 1.64.4 2.43l-.47.47a2.982 2.982 0 0 0 0 4.24 2.982 2.982 0 0 0 4.24 0l3.53-3.53a2.982 2.982 0 0 0 0-4.24.973.973 0 0 1 0-1.42z"/>
</svg>
`;

const CLOSE_SVG = `
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path fill="currentColor" d="M18.4 4L12 10.4L5.6 4L4 5.6L10.4 12L4 18.4L5.6 20L12 13.6L18.4 20L20 18.4L13.6 12L20 5.6L18.4 4Z"/>
</svg>
`;

const SEARCH_SVG = `
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M15.62 17.03a9 9 0 1 1 1.41-1.41l4.68 4.67a1 1 0 0 1-1.42 1.42l-4.67-4.68ZM17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"/>
</svg>
`;

const SYNC_SVG = `
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path fill="currentColor" d="M12 4a8 8 0 0 0-7.75 6h2.1A6 6 0 0 1 17.6 8.4L15 11h6V5l-2 2A8 8 0 0 0 12 4Zm5.65 10A6 6 0 0 1 6.4 15.6L9 13H3v6l2-2a8 8 0 0 0 14.75-3h-2.1Z"/>
</svg>
`;

const CHEVRON_SVG = `
<svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path fill="currentColor" d="M9.3 5.3a1 1 0 0 0 0 1.4L14.58 12 9.3 17.3a1 1 0 1 0 1.4 1.4l6-6a1 1 0 0 0 0-1.4l-6-6a1 1 0 0 0-1.4 0Z"/>
</svg>
`;

const CHANNEL_HASH_SVG = `
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M10.99 3.16A1 1 0 1 0 9 2.84L8.15 8H4a1 1 0 0 0 0 2h3.82l-.67 4H3a1 1 0 1 0 0 2h3.82l-.8 4.84a1 1 0 0 0 1.97.32L8.85 16h4.97l-.8 4.84a1 1 0 0 0 1.97.32l.86-5.16H20a1 1 0 1 0 0-2h-3.82l.67-4H21a1 1 0 1 0 0-2h-3.82l.8-4.84a1 1 0 1 0-1.97-.32L15.15 8h-4.97l.8-4.84ZM14.15 14l.67-4H9.85l-.67 4h4.97Z"/>
</svg>
`;

const INLINE_EMOJI_RE = /([\u{1F1E6}-\u{1F1FF}]{2}|[0-9#*]\uFE0F?\u20E3|\p{Extended_Pictographic}(?:\uFE0F|\u200D\p{Extended_Pictographic})*)/gu;

module.exports = class ReactionInbox {
    constructor(meta) {
        this.meta = meta;
        this.settings = { ...DEFAULT_SETTINGS };
        this.entries = [];
        this.trackedPosts = [];
        this.knownKeys = new Set();
        this.panelOpen = false;
        this.activeTab = "all";
        this.searchQuery = "";
        this.searchOpen = false;
        this.sessionUnreadIds = new Set();

        this.stores = {};
        this.dispatcher = null;
        this.restApi = null;
        this.observer = null;
        this.mountTimer = null;
        this.syncTimer = null;
        this.autoSyncInterval = null;
        this.timeTicker = null;
        this.isSyncing = false;
        this.lastSyncAt = 0;
        this.syncBackoffUntil = 0;
        this.stopped = true;
        this.fetchQueue = [];
        this.queuedFetchKeys = new Set();
        this.failedFetchKeys = new Set();
        this.isDrainingQueue = false;

        this.onReactionAdd = this.onReactionAdd.bind(this);
        this.onReactionAddMany = this.onReactionAddMany.bind(this);
        this.onReactionRemove = this.onReactionRemove.bind(this);
        this.onMessageCreate = this.onMessageCreate.bind(this);
        this.onChannelActivity = this.onChannelActivity.bind(this);
        this.onNotificationCenterItemCreate = this.onNotificationCenterItemCreate.bind(this);
        this.onNotificationCenterItemsLoaded = this.onNotificationCenterItemsLoaded.bind(this);
        this.onDocumentClick = this.onDocumentClick.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        this.scanTimers = new Map();
    }

    start() {
        this.stopped = false;
        this.fetchQueue = [];
        this.queuedFetchKeys.clear();
        this.failedFetchKeys.clear();
        this.isDrainingQueue = false;

        this.loadData();
        this.initModules();
        BdApi.DOM.addStyle(STYLE_ID, CSS);

        if (this.dispatcher) {
            this.dispatcher.subscribe("MESSAGE_REACTION_ADD", this.onReactionAdd);
            this.dispatcher.subscribe("MESSAGE_REACTION_ADD_MANY", this.onReactionAddMany);
            this.dispatcher.subscribe("MESSAGE_REACTION_REMOVE", this.onReactionRemove);
            this.dispatcher.subscribe("MESSAGE_CREATE", this.onMessageCreate);
            this.dispatcher.subscribe("LOAD_MESSAGES_SUCCESS", this.onChannelActivity);
            this.dispatcher.subscribe("CHANNEL_SELECT", this.onChannelActivity);
            this.dispatcher.subscribe("NOTIFICATION_CENTER_ITEM_CREATE", this.onNotificationCenterItemCreate);
            this.dispatcher.subscribe("LOAD_NOTIFICATION_CENTER_ITEMS_SUCCESS", this.onNotificationCenterItemsLoaded);
        } else {
            BdApi.UI.showToast("ReactionInbox: Could not hook Discord FluxDispatcher.", { type: "error" });
        }

        document.addEventListener("mousedown", this.onDocumentClick, true);
        document.addEventListener("keydown", this.onKeyDown, true);

        this.ensureButtonMounted();
        this.startObserver();

        // Scan currently open channel so recent posts (e.g. in muted/huge servers) are tracked immediately
        const activeChanId = this.stores.SelectedChannelStore?.getChannelId?.();
        if (activeChanId) this.scanChannelMessages(activeChanId);

        // Hydrate any saved entries missing message text, then sync
        this.hydrateMissingSnippets();
        this.syncTimer = setTimeout(() => {
            this.syncFromNotificationCenter({ silent: true });
        }, 2000);
        this.restartAutoSyncTimer();

        this.timeTicker = setInterval(() => {
            if (this.panelOpen) this.renderPanelList();
        }, 60000);
    }

    restartAutoSyncTimer() {
        if (this.autoSyncInterval) {
            clearInterval(this.autoSyncInterval);
            this.autoSyncInterval = null;
        }
        const mins = Number(this.settings.autoSyncMinutes);
        if (!Number.isFinite(mins) || mins <= 0) return;
        const clampedMs = Math.max(1, Math.min(60, mins)) * 60 * 1000;
        this.autoSyncInterval = setInterval(() => {
            this.syncFromNotificationCenter({ silent: true });
        }, clampedMs);
    }

    stop() {
        this.stopped = true;
        this.fetchQueue = [];
        this.queuedFetchKeys.clear();
        this.isDrainingQueue = false;

        if (this.dispatcher) {
            this.dispatcher.unsubscribe("MESSAGE_REACTION_ADD", this.onReactionAdd);
            this.dispatcher.unsubscribe("MESSAGE_REACTION_ADD_MANY", this.onReactionAddMany);
            this.dispatcher.unsubscribe("MESSAGE_REACTION_REMOVE", this.onReactionRemove);
            this.dispatcher.unsubscribe("MESSAGE_CREATE", this.onMessageCreate);
            this.dispatcher.unsubscribe("LOAD_MESSAGES_SUCCESS", this.onChannelActivity);
            this.dispatcher.unsubscribe("CHANNEL_SELECT", this.onChannelActivity);
            this.dispatcher.unsubscribe("NOTIFICATION_CENTER_ITEM_CREATE", this.onNotificationCenterItemCreate);
            this.dispatcher.unsubscribe("LOAD_NOTIFICATION_CENTER_ITEMS_SUCCESS", this.onNotificationCenterItemsLoaded);
        }

        for (const t of this.scanTimers.values()) clearTimeout(t);
        this.scanTimers.clear();

        document.removeEventListener("mousedown", this.onDocumentClick, true);
        document.removeEventListener("keydown", this.onKeyDown, true);

        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
        if (this.mountTimer) {
            clearTimeout(this.mountTimer);
            this.mountTimer = null;
        }
        if (this.syncTimer) {
            clearTimeout(this.syncTimer);
            this.syncTimer = null;
        }
        if (this.autoSyncInterval) {
            clearInterval(this.autoSyncInterval);
            this.autoSyncInterval = null;
        }
        if (this.timeTicker) {
            clearInterval(this.timeTicker);
            this.timeTicker = null;
        }

        this.closePanel();
        this.hideEmoteTooltip();
        const btn = document.getElementById(BTN_ID);
        if (btn) btn.remove();
        BdApi.DOM.removeStyle(STYLE_ID);
    }

    loadData() {
        const savedSettings = BdApi.Data.load(PLUGIN_NAME, "settings");
        this.settings = Object.assign({}, DEFAULT_SETTINGS, savedSettings || {});

        const savedEntries = BdApi.Data.load(PLUGIN_NAME, "entries");
        this.entries = Array.isArray(savedEntries) ? savedEntries : [];

        const savedTracked = BdApi.Data.load(PLUGIN_NAME, "trackedPosts");
        this.trackedPosts = Array.isArray(savedTracked) ? savedTracked : [];
        this.pruneTrackedPosts();

        const savedKnown = BdApi.Data.load(PLUGIN_NAME, "knownKeys");
        this.knownKeys = new Set(Array.isArray(savedKnown) ? savedKnown : []);
        for (const e of this.entries) {
            this.knownKeys.add(`${e.messageId}:${e.userId}:${e.emojiKey}`);
        }
    }

    saveKnownKeys() {
        const arr = Array.from(this.knownKeys);
        const trimmed = arr.length > 1500 ? arr.slice(arr.length - 1500) : arr;
        if (trimmed.length !== arr.length) {
            this.knownKeys = new Set(trimmed);
        }
        BdApi.Data.save(PLUGIN_NAME, "knownKeys", trimmed);
    }

    pruneTrackedPosts() {
        const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000; // 7 days
        this.trackedPosts = this.trackedPosts
            .filter((p) => p && p.channelId && p.messageId && (p.timestamp || 0) >= cutoff)
            .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
            .slice(0, 100);
    }

    saveTrackedPosts() {
        this.pruneTrackedPosts();
        BdApi.Data.save(PLUGIN_NAME, "trackedPosts", this.trackedPosts);
    }

    saveSettings() {
        BdApi.Data.save(PLUGIN_NAME, "settings", this.settings);
    }

    saveEntries() {
        const limit = Math.max(20, Math.min(2000, Number(this.settings.maxEntries) || DEFAULT_SETTINGS.maxEntries));
        if (this.entries.length > limit) {
            this.entries = this.entries.slice(0, limit);
        }
        BdApi.Data.save(PLUGIN_NAME, "entries", this.entries);
    }

    initModules() {
        const { Webpack } = BdApi;

        this.stores = {
            UserStore: Webpack.getStore("UserStore"),
            ChannelStore: Webpack.getStore("ChannelStore"),
            GuildStore: Webpack.getStore("GuildStore"),
            MessageStore: Webpack.getStore("MessageStore"),
            GuildMemberStore: Webpack.getStore("GuildMemberStore"),
            SelectedChannelStore: Webpack.getStore("SelectedChannelStore"),
        };

        this.dispatcher =
            Webpack.getByKeys("dispatch", "subscribe", "unsubscribe") ||
            Webpack.getByKeys("dispatch", "subscribe") ||
            this.stores.UserStore?._dispatcher ||
            null;

        this.restApi = this.findRestApi();
        this.emojiUtils =
            Webpack.getByKeys?.("convertSurrogateToName", "getByName") ||
            Webpack.getByKeys?.("convertSurrogateToName") ||
            null;
        this.twemojiGetUrl = this.findTwemojiGetUrl();
    }

    findTwemojiGetUrl() {
        const { Webpack } = BdApi;

        const testGetUrl = (fn) => {
            if (typeof fn !== "function") return false;
            try {
                const sample = fn("🔥");
                return typeof sample === "string" && sample.length > 0 && /\.svg(\?|$)/i.test(sample);
            } catch (_) {
                return false;
            }
        };

        // 1. Directly on emojiUtils if present
        if (testGetUrl(this.emojiUtils?.getURL)) {
            return this.emojiUtils.getURL.bind(this.emojiUtils);
        }

        // 2. Common Discord Twemoji wrapper modules
        const candidates = [
            Webpack.getByKeys?.("getURL", "convert", { searchExports: true }),
            Webpack.getByKeys?.("getURL", "convert"),
            Webpack.getByKeys?.("getURL", "getEmoji", { searchExports: true }),
            Webpack.getByKeys?.("getURL", "parse", { searchExports: true }),
        ];
        for (const mod of candidates) {
            if (testGetUrl(mod?.getURL)) return mod.getURL.bind(mod);
        }

        // 3. Scan Webpack module containing Twemoji asset map
        for (const sig of ["twemoji", "convertSurrogateToName", ".svg"]) {
            try {
                if (sig === ".svg") break;
                const mod = Webpack.getBySource?.(sig);
                if (mod && typeof mod === "object") {
                    if (testGetUrl(mod.getURL)) return mod.getURL.bind(mod);
                    for (const val of Object.values(mod)) {
                        if (testGetUrl(val)) return val;
                        if (val && typeof val === "object" && testGetUrl(val.getURL)) {
                            return val.getURL.bind(val);
                        }
                    }
                }
            } catch (_) {}
        }

        // 4. General module scan for any getURL(surrogate) returning Discord's local .svg asset
        try {
            if (typeof Webpack.getModule === "function") {
                const mod = Webpack.getModule(
                    (m) => m && typeof m === "object" && typeof m.getURL === "function" && testGetUrl(m.getURL),
                    { searchExports: true }
                );
                if (mod) return mod.getURL.bind(mod);
            }
        } catch (_) {}

        return null;
    }

    emojiToTwemojiCodePoint(emojiStr, { keepFe0f = false } = {}) {
        if (!emojiStr || typeof emojiStr !== "string") return null;
        const cps = [];
        for (const ch of emojiStr) {
            const cp = ch.codePointAt(0);
            if (cp !== undefined) cps.push(cp.toString(16));
        }
        if (cps.length === 0) return null;
        const hasZwj = cps.includes("200d");
        const filtered = keepFe0f || hasZwj ? cps : cps.filter((c) => c !== "fe0f");
        return filtered.join("-");
    }

    getUnicodeEmojiUrls(emojiStr) {
        const urls = [];
        if (this.twemojiGetUrl) {
            try {
                const nativeUrl = this.twemojiGetUrl(emojiStr);
                if (typeof nativeUrl === "string" && nativeUrl.length > 0) {
                    urls.push(nativeUrl);
                }
            } catch (_) {}
        }
        const cp = this.emojiToTwemojiCodePoint(emojiStr, { keepFe0f: false });
        if (cp) {
            urls.push(`https://cdn.jsdelivr.net/gh/jdecked/twemoji@latest/assets/svg/${cp}.svg`);
        }
        const cpWithFe0f = this.emojiToTwemojiCodePoint(emojiStr, { keepFe0f: true });
        if (cpWithFe0f && cpWithFe0f !== cp) {
            urls.push(`https://cdn.jsdelivr.net/gh/jdecked/twemoji@latest/assets/svg/${cpWithFe0f}.svg`);
        }
        return urls;
    }

    getEmoteDisplayName(entry) {
        if (entry.emojiId) {
            return `:${entry.emojiName || "emote"}:`;
        }
        const raw = entry.emojiName || "";
        if (raw && typeof this.emojiUtils?.convertSurrogateToName === "function") {
            try {
                const converted = this.emojiUtils.convertSurrogateToName(raw);
                if (converted && converted !== raw) {
                    return converted.startsWith(":") ? converted : `:${converted}:`;
                }
            } catch (_) {}
        }
        return null;
    }

    findRestApi() {
        const { Webpack } = BdApi;

        // Explicitly reject raw superagent (which has .Request/.agent and expects string URLs, not { url, query })
        const isDiscordRestApi = (m) =>
            Boolean(
                m &&
                typeof m === "object" &&
                typeof m.get === "function" &&
                typeof m.post === "function" &&
                typeof m.patch === "function" &&
                typeof m.del === "function" &&
                !m.Request &&
                !m.agent
            );

        // 1. Discord's HTTP / RestAPI object often includes getAPIBaseURL or sits beside it
        try {
            const direct =
                Webpack.getByKeys?.("getAPIBaseURL", "get", "post", { searchExports: true }) ||
                Webpack.getByKeys?.("getAPIBaseURL", "get", "post");
            if (isDiscordRestApi(direct)) return direct;
        } catch (_) {}

        try {
            const wrapped = Webpack.getByKeys?.("HTTP", "getAPIBaseURL");
            if (isDiscordRestApi(wrapped?.HTTP)) return wrapped.HTTP;
        } catch (_) {}

        // 2. Inspect exports of the Webpack module containing Discord's API client source strings
        for (const sig of ["getAPIBaseURL", "V8APIError", "setAwaitOnline", "X-Audit-Log-Reason"]) {
            try {
                const mod = Webpack.getBySource?.(sig);
                if (isDiscordRestApi(mod)) return mod;
                if (mod && typeof mod === "object") {
                    for (const val of Object.values(mod)) {
                        if (isDiscordRestApi(val)) return val;
                    }
                }
            } catch (_) {}
        }

        // 3. Scan exported objects with get/post/put/patch/del excluding superagent
        try {
            if (typeof Webpack.getModule === "function") {
                const withMarker = Webpack.getModule(
                    (m) =>
                        isDiscordRestApi(m) &&
                        (typeof m.getAPIBaseURL === "function" ||
                            typeof m.setAwaitOnline === "function" ||
                            typeof m.getReadyState === "function" ||
                            typeof m.put === "function"),
                    { searchExports: true }
                );
                if (withMarker) return withMarker;
            }
        } catch (_) {}

        return null;
    }

    getNavigationHelpers() {
        const { Webpack } = BdApi;

        const findFnByString = (str) => {
            try {
                if (typeof Webpack.getByStrings === "function") {
                    const fn = Webpack.getByStrings(str, { searchExports: true });
                    if (typeof fn === "function") return fn;
                }
            } catch (_) {}
            try {
                if (typeof Webpack.getModule === "function") {
                    const fn = Webpack.getModule(
                        (m) => typeof m === "function" && Function.prototype.toString.call(m).includes(str),
                        { searchExports: true }
                    );
                    if (typeof fn === "function") return fn;
                }
            } catch (_) {}
            try {
                if (typeof Webpack.getBySource === "function") {
                    const mod = Webpack.getBySource(str);
                    if (typeof mod === "function") return mod;
                    if (mod && typeof mod === "object") {
                        for (const val of Object.values(mod)) {
                            if (typeof val === "function" && Function.prototype.toString.call(val).includes(str)) {
                                return val;
                            }
                        }
                    }
                }
            } catch (_) {}
            return null;
        };

        let transitionTo = null;
        const navMod = Webpack.getByKeys?.("transitionTo", "replaceWith");
        if (typeof navMod?.transitionTo === "function") {
            transitionTo = navMod.transitionTo.bind(navMod);
        } else {
            transitionTo =
                findFnByString("transitionTo - Transitioning to ") ||
                findFnByString("transitionTo -") ||
                null;
        }

        let transitionToGuild = null;
        const guildNavMod = Webpack.getByKeys?.("transitionToGuild");
        if (typeof guildNavMod?.transitionToGuild === "function") {
            transitionToGuild = guildNavMod.transitionToGuild.bind(guildNavMod);
        } else {
            transitionToGuild = findFnByString("transitionToGuild -") || null;
        }

        const channelNavMod = Webpack.getByKeys?.("selectChannel", "selectPrivateChannel");
        const selectChannel =
            typeof channelNavMod?.selectChannel === "function"
                ? channelNavMod.selectChannel.bind(channelNavMod)
                : null;

        const msgActions =
            Webpack.getByKeys?.("jumpToMessage", "_sendMessage") ||
            Webpack.getByKeys?.("jumpToMessage", "fetchMessages") ||
            Webpack.getByKeys?.("jumpToMessage");
        const jumpToMessage =
            typeof msgActions?.jumpToMessage === "function"
                ? msgActions.jumpToMessage.bind(msgActions)
                : null;

        return { transitionTo, transitionToGuild, selectChannel, jumpToMessage };
    }

    // -------------------------------------------------------------------------
    // Reaction Event Handlers
    // -------------------------------------------------------------------------

    onReactionAdd(event) {
        try {
            if (!event || event.optimistic) return;

            const selfUser = this.stores.UserStore?.getCurrentUser?.();
            const selfId = selfUser?.id;
            if (!selfId) return;

            const channelId = event.channelId ?? event.channel_id;
            const messageId = event.messageId ?? event.message_id;
            const userId = event.userId ?? event.user_id;
            const emoji = event.emoji;
            if (!channelId || !messageId || !userId || !emoji) return;

            if (!this.settings.includeSelf && userId === selfId) return;

            const cachedMsg = this.stores.MessageStore?.getMessage?.(channelId, messageId);
            const messageAuthorId = event.messageAuthorId ?? event.message_author_id ?? cachedMsg?.author?.id ?? null;

            if (messageAuthorId !== selfId) return;

            const channel = this.stores.ChannelStore?.getChannel?.(channelId);
            const guildId = event.guildId ?? event.guild_id ?? channel?.guild_id ?? null;

            const { userName, userHandle, userAvatarUrl } = this.resolveUser(userId, guildId, event.member);
            const loc = this.resolveLocation(guildId, channel, userAvatarUrl);
            const messageSnippet = this.extractMessageSnippet(cachedMsg);

            const emojiId = emoji.id || null;
            const emojiName = emoji.name || "?";
            const emojiAnimated = Boolean(emoji.animated);
            const burst = Boolean(event.burst || event.type === 1);
            const emojiKey = emojiId ? `id:${emojiId}` : `name:${emojiName}`;

            // Deduplicate identical (messageId, userId, emojiKey)
            const existingIdx = this.entries.findIndex(
                (e) => e.messageId === messageId && e.userId === userId && e.emojiKey === emojiKey
            );

            const entry = {
                id: `${messageId}:${userId}:${emojiKey}`,
                emojiKey,
                timestamp: Date.now(),
                channelId,
                guildId,
                isDm: loc.isDm,
                isGroupDm: loc.isGroupDm,
                messageId,
                userId,
                userName,
                userHandle,
                userAvatarUrl,
                guildName: loc.guildName,
                guildIconUrl: loc.guildIconUrl,
                guildAcronym: loc.guildAcronym,
                channelName: loc.channelName,
                categoryName: loc.categoryName,
                emojiId,
                emojiName,
                emojiAnimated,
                burst,
                messageSnippet: messageSnippet || (existingIdx !== -1 ? this.entries[existingIdx].messageSnippet : null),
                removed: false,
                read: this.panelOpen,
            };

            if (existingIdx !== -1) {
                this.entries.splice(existingIdx, 1);
            }
            this.entries.unshift(entry);
            if (this.panelOpen) {
                this.sessionUnreadIds.add(entry.id);
            }
            this.knownKeys.add(`${messageId}:${userId}:${emojiKey}`);
            this.saveKnownKeys();
            this.saveEntries();

            if (!entry.messageSnippet) {
                this.queueMessageFetch(channelId, messageId);
            }

            this.updateBadge();
            if (this.panelOpen) {
                this.renderPanelList();
            }

            if (this.settings.showInAppToast) {
                const emojiDisplay = emojiId ? `:${emojiName}:` : emojiName;
                BdApi.UI.showToast(`${userName} reacted ${emojiDisplay} in ${loc.channelName}`, { type: "info" });
            }
        } catch (err) {
            console.error(`[${PLUGIN_NAME}] Error handling MESSAGE_REACTION_ADD:`, err);
        }
    }

    onReactionAddMany(event) {
        try {
            if (!event || !Array.isArray(event.reactions)) return;
            const selfId = this.stores.UserStore?.getCurrentUser?.()?.id;
            if (!selfId) return;

            const channelId = event.channelId ?? event.channel_id;
            const messageId = event.messageId ?? event.message_id;
            const guildId = event.guildId ?? event.guild_id ?? null;
            if (!channelId || !messageId) return;

            const cachedMsg = this.stores.MessageStore?.getMessage?.(channelId, messageId);
            const isOwn =
                cachedMsg?.author?.id === selfId ||
                this.trackedPosts.some((p) => p.messageId === messageId);
            if (!isOwn) return;

            for (const batch of event.reactions) {
                if (!batch?.emoji || !Array.isArray(batch.users)) continue;
                for (const userId of batch.users) {
                    this.onReactionAdd({
                        channelId,
                        messageId,
                        guildId,
                        userId,
                        messageAuthorId: selfId,
                        emoji: batch.emoji,
                        optimistic: false,
                    });
                }
            }
        } catch (err) {
            console.error(`[${PLUGIN_NAME}] Error handling MESSAGE_REACTION_ADD_MANY:`, err);
        }
    }

    onReactionRemove(event) {
        try {
            if (!event || event.optimistic) return;

            const messageId = event.messageId ?? event.message_id;
            const userId = event.userId ?? event.user_id;
            const emoji = event.emoji;
            if (!messageId || !userId || !emoji) return;

            const emojiKey = emoji.id ? `id:${emoji.id}` : `name:${emoji.name || "?"}`;
            const idx = this.entries.findIndex(
                (e) => e.messageId === messageId && e.userId === userId && e.emojiKey === emojiKey
            );
            if (idx === -1) return;

            if (this.settings.keepRemoved) {
                this.entries[idx].removed = true;
            } else {
                this.entries.splice(idx, 1);
            }

            this.saveEntries();
            this.updateBadge();
            if (this.panelOpen) this.renderPanelList();
        } catch (err) {
            console.error(`[${PLUGIN_NAME}] Error handling MESSAGE_REACTION_REMOVE:`, err);
        }
    }

    snowflakeToTimestamp(id) {
        try {
            if (!id || !/^\d+$/.test(String(id))) return null;
            return Number((BigInt(id) >> 22n) + 1420070400000n);
        } catch (_) {
            return null;
        }
    }

    ingestNotificationCenterItem(raw, { historical = false } = {}) {
        const item = raw?.item || raw;
        if (!item || typeof item !== "object") return false;

        const typeStr = String(item.type || "").toLowerCase();
        const hasEmoji = Boolean(item.emoji_id || item.emoji_name || item.emoji?.id || item.emoji?.name);
        if (!typeStr.includes("reaction") && !hasEmoji) return false;

        const deeplink = String(item.deeplink || "");
        const dlMatch = deeplink.match(/\/channels\/(@me|\d+)\/(\d+)\/(\d+)/);

        const channelId = item.message_channel_id || item.channel_id || item.message?.channel_id || dlMatch?.[2] || null;
        const messageId = item.message_id || item.message?.id || dlMatch?.[3] || null;
        if (!channelId || !messageId) return false;

        const channel = this.stores.ChannelStore?.getChannel?.(channelId);
        const rawGuildId =
            item.guild_id ||
            (dlMatch?.[1] && dlMatch[1] !== "@me" ? dlMatch[1] : null) ||
            channel?.guild_id ||
            null;
        const guildId = rawGuildId && rawGuildId !== "@me" ? rawGuildId : null;

        const selfId = this.stores.UserStore?.getCurrentUser?.()?.id;
        const otherUser = item.other_user || item.user || null;
        const userId = otherUser?.id || item.user_id || "0";
        if (!this.settings.includeSelf && selfId && userId === selfId) return false;

        const emojiId = item.emoji_id || item.emoji?.id || null;
        const emojiName = item.emoji_name || item.emoji?.name || "✨";
        const emojiAnimated = Boolean(item.emoji?.animated || item.emoji_animated);
        const burst = Boolean(item.burst || typeStr.includes("super") || typeStr.includes("burst"));
        const emojiKey = emojiId ? `id:${emojiId}` : `name:${emojiName}`;

        const cachedMsg = this.stores.MessageStore?.getMessage?.(channelId, messageId);
        let messageSnippet = null;
        if (typeof item.message_content === "string" && item.message_content.trim()) {
            const cleaned = item.message_content.replace(/\s+/g, " ").trim();
            messageSnippet = cleaned.length > 160 ? `${cleaned.slice(0, 157)}...` : cleaned;
        }
        if (!messageSnippet) {
            messageSnippet = this.extractMessageSnippet(item.message) || this.extractMessageSnippet(cachedMsg);
        }
        if (!messageSnippet) {
            if (item.message_attachment_count > 0) {
                messageSnippet = item.message_attachment_count === 1 ? "[Attachment]" : `[${item.message_attachment_count} attachments]`;
            } else if (item.message_embed_count > 0) {
                messageSnippet = "[Embed]";
            }
        }

        const existingIdx = this.entries.findIndex(
            (e) => e.messageId === messageId && e.userId === userId && e.emojiKey === emojiKey
        );

        if (existingIdx !== -1) {
            // Already logged (e.g. via live MESSAGE_REACTION_ADD) — just backfill snippet if missing
            if (!this.entries[existingIdx].messageSnippet && messageSnippet) {
                this.entries[existingIdx].messageSnippet = messageSnippet;
                return true;
            }
            return false;
        }

        const { userName, userHandle, userAvatarUrl } = this.resolveUser(
            userId,
            guildId,
            otherUser ? { user: otherUser } : null
        );
        const loc = this.resolveLocation(guildId, channel, userAvatarUrl);

        let timestamp = Date.now();
        if (item.created_at) {
            const parsed = Date.parse(item.created_at);
            if (!Number.isNaN(parsed)) timestamp = parsed;
        } else {
            const fromSnowflake = this.snowflakeToTimestamp(item.id);
            if (fromSnowflake) timestamp = fromSnowflake;
        }

        const isNewlyUnread = !historical || !item.acked;
        const entry = {
            id: `${messageId}:${userId}:${emojiKey}`,
            emojiKey,
            timestamp,
            channelId,
            guildId,
            isDm: loc.isDm,
            isGroupDm: loc.isGroupDm,
            messageId,
            userId,
            userName,
            userHandle,
            userAvatarUrl,
            guildName: loc.guildName,
            guildIconUrl: loc.guildIconUrl,
            guildAcronym: loc.guildAcronym,
            channelName: loc.channelName,
            categoryName: loc.categoryName,
            emojiId,
            emojiName,
            emojiAnimated,
            burst,
            messageSnippet,
            removed: false,
            read: this.panelOpen ? true : !isNewlyUnread,
        };

        this.entries.unshift(entry);
        this.knownKeys.add(`${messageId}:${userId}:${emojiKey}`);
        this.saveKnownKeys();
        if (this.panelOpen && isNewlyUnread) {
            this.sessionUnreadIds.add(entry.id);
        }
        if (!entry.messageSnippet) {
            this.queueMessageFetch(channelId, messageId);
        }
        return true;
    }

    onNotificationCenterItemCreate(event) {
        try {
            if (!event) return;
            const added = this.ingestNotificationCenterItem(event, { historical: false });
            if (!added) return;

            this.entries.sort((a, b) => b.timestamp - a.timestamp);
            this.saveEntries();
            this.updateBadge();
            if (this.panelOpen) this.renderPanelList();

            if (this.settings.showInAppToast && this.entries[0]) {
                const top = this.entries[0];
                const emojiDisplay = top.emojiId ? `:${top.emojiName}:` : top.emojiName;
                BdApi.UI.showToast(`${top.userName} reacted ${emojiDisplay} in ${top.channelName}`, { type: "info" });
            }
        } catch (err) {
            console.error(`[${PLUGIN_NAME}] Error handling NOTIFICATION_CENTER_ITEM_CREATE:`, err);
        }
    }

    onNotificationCenterItemsLoaded(event) {
        try {
            const items = event?.items;
            if (!Array.isArray(items) || items.length === 0) return;

            let addedCount = 0;
            for (const item of items) {
                if (this.ingestNotificationCenterItem(item, { historical: true })) {
                    addedCount++;
                }
            }
            if (addedCount > 0) {
                this.entries.sort((a, b) => b.timestamp - a.timestamp);
                this.saveEntries();
                this.updateBadge();
                if (this.panelOpen) this.renderPanelList();
            }
        } catch (err) {
            console.error(`[${PLUGIN_NAME}] Error handling LOAD_NOTIFICATION_CENTER_ITEMS_SUCCESS:`, err);
        }
    }

    // -------------------------------------------------------------------------
    // Recent Own-Post Tracker (catches reactions in large / muted servers)
    // -------------------------------------------------------------------------

    onMessageCreate(event) {
        try {
            if (!event || event.optimistic) return;
            const msg = event.message;
            if (!msg) return;
            const selfId = this.stores.UserStore?.getCurrentUser?.()?.id;
            if (!selfId || msg.author?.id !== selfId) return;

            const channelId = event.channelId || msg.channel_id;
            const channel = this.stores.ChannelStore?.getChannel?.(channelId);
            const guildId = event.guildId || msg.guild_id || channel?.guild_id || null;
            this.trackOwnMessage(msg, channelId, guildId, { isNewPost: true });
        } catch (err) {
            console.error(`[${PLUGIN_NAME}] Error in onMessageCreate:`, err);
        }
    }

    onChannelActivity(event) {
        const channelId = event?.channelId;
        if (!channelId) return;
        const prev = this.scanTimers.get(channelId);
        if (prev) clearTimeout(prev);
        this.scanTimers.set(
            channelId,
            setTimeout(() => {
                this.scanTimers.delete(channelId);
                this.scanChannelMessages(channelId);
            }, 250)
        );
    }

    trackOwnMessage(msg, channelId, guildId, { isNewPost = false } = {}) {
        if (!msg?.id || !channelId) return false;
        const ts = this.snowflakeToTimestamp(msg.id) || Date.now();
        const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
        if (ts < cutoff) return false;

        const snippet = this.extractMessageSnippet(msg);
        const existing = this.trackedPosts.find((p) => p.messageId === msg.id);
        if (existing) {
            if (!existing.snippet && snippet) {
                existing.snippet = snippet;
                this.saveTrackedPosts();
            }
            return false;
        }

        this.trackedPosts.unshift({
            channelId,
            guildId: guildId || null,
            messageId: msg.id,
            timestamp: ts,
            snippet,
            syncedOnce: Boolean(isNewPost),
        });
        this.saveTrackedPosts();
        return true;
    }

    scanChannelMessages(channelId) {
        try {
            const selfId = this.stores.UserStore?.getCurrentUser?.()?.id;
            if (!selfId || !channelId) return;

            const storeMsgs = this.stores.MessageStore?.getMessages?.(channelId);
            const arr = storeMsgs?.toArray?.() || storeMsgs?._array || (Array.isArray(storeMsgs) ? storeMsgs : []);
            if (!arr.length) return;

            const channel = this.stores.ChannelStore?.getChannel?.(channelId);
            const guildId = channel?.guild_id || null;
            const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;

            let foundUntrackedReactions = false;
            let addedPosts = 0;

            for (const msg of arr) {
                if (!msg || msg.author?.id !== selfId) continue;
                const ts = this.snowflakeToTimestamp(msg.id) || 0;
                if (ts < cutoff) continue;

                if (this.trackOwnMessage(msg, channelId, guildId)) {
                    addedPosts++;
                }

                if (Array.isArray(msg.reactions) && msg.reactions.length > 0) {
                    if (this.hasUnloggedReactions(msg, selfId)) {
                        foundUntrackedReactions = true;
                    }
                }
            }

            if (foundUntrackedReactions && !this.isSyncing && !this.stopped) {
                // Immediately check newly spotted reactions on recent posts in this channel
                this.syncFromNotificationCenter({ silent: true });
            } else if (addedPosts > 0) {
                this.saveTrackedPosts();
            }
        } catch (err) {
            console.warn(`[${PLUGIN_NAME}] Error scanning channel ${channelId}:`, err);
        }
    }

    countKnownReactors(messageId, emojiKey, selfId) {
        const prefix = `${messageId}:`;
        const suffix = `:${emojiKey}`;
        let count = 0;
        for (const k of this.knownKeys) {
            if (!k.startsWith(prefix) || !k.endsWith(suffix)) continue;
            const userId = k.slice(prefix.length, k.length - suffix.length);
            if (!this.settings.includeSelf && selfId && userId === selfId) continue;
            count++;
        }
        return count;
    }

    hasUnloggedReactions(msg, selfId) {
        if (!Array.isArray(msg?.reactions) || msg.reactions.length === 0) return false;
        for (const r of msg.reactions) {
            const emoji = r.emoji;
            if (!emoji) continue;
            const emojiKey = emoji.id ? `id:${emoji.id}` : `name:${emoji.name || "?"}`;
            const normal = r.count_details ? (r.count_details.normal || 0) : (r.count || 0);
            const burst = r.count_details ? (r.count_details.burst || 0) : (r.burst_count || 0);
            const total = normal + burst || r.count || 0;
            const expected = total - (!this.settings.includeSelf && r.me ? 1 : 0);
            if (expected <= 0) continue;
            if (this.countKnownReactors(msg.id, emojiKey, selfId) < expected) {
                return true;
            }
        }
        return false;
    }

    async fetchAndIngestReactionsForMessage(
        msg,
        channelId,
        guildId,
        selfId,
        { isHistoricalBackfill = false, postTimestamp = null } = {}
    ) {
        if (!Array.isArray(msg?.reactions) || msg.reactions.length === 0) return 0;

        const channel = this.stores.ChannelStore?.getChannel?.(channelId);
        const resolvedGuildId = guildId || msg.guild_id || channel?.guild_id || null;
        const snippet = this.extractMessageSnippet(msg);
        let addedCount = 0;

        for (const r of msg.reactions) {
            if (this.stopped) break;
            const emoji = r.emoji;
            if (!emoji) continue;

            const emojiId = emoji.id || null;
            const emojiName = emoji.name || "?";
            const emojiAnimated = Boolean(emoji.animated);
            const emojiKey = emojiId ? `id:${emojiId}` : `name:${emojiName}`;

            const normalCount = r.count_details ? (r.count_details.normal || 0) : (r.count || 0);
            const burstCount = r.count_details ? (r.count_details.burst || 0) : (r.burst_count || 0);
            const totalCount = normalCount + burstCount || r.count || 0;
            const expected = totalCount - (!this.settings.includeSelf && r.me ? 1 : 0);
            if (expected <= 0) continue;

            if (this.countKnownReactors(msg.id, emojiKey, selfId) >= expected) {
                continue;
            }

            const encodedEmoji = emojiId
                ? `${encodeURIComponent(emojiName || "e")}:${emojiId}`
                : encodeURIComponent(emojiName);

            const typesToFetch = [];
            if (normalCount > 0 || (normalCount === 0 && burstCount === 0 && totalCount > 0)) {
                typesToFetch.push({ type: 0, burst: false });
            }
            if (burstCount > 0) {
                typesToFetch.push({ type: 1, burst: true });
            }

            for (const { type, burst } of typesToFetch) {
                if (this.stopped) break;
                try {
                    const res = await this.restApi.get({
                        url: `/channels/${channelId}/messages/${msg.id}/reactions/${encodedEmoji}`,
                        query: { limit: 25, type },
                    });
                    const users = Array.isArray(res?.body) ? res.body : Array.isArray(res) ? res : [];

                    for (const u of users) {
                        if (!u?.id) continue;
                        if (!this.settings.includeSelf && u.id === selfId) continue;

                        const key = `${msg.id}:${u.id}:${emojiKey}`;
                        if (this.knownKeys.has(key)) continue;

                        const { userName, userHandle, userAvatarUrl } = this.resolveUser(
                            u.id,
                            resolvedGuildId,
                            { user: u }
                        );
                        const loc = this.resolveLocation(resolvedGuildId, channel, userAvatarUrl);

                        const entryTimestamp =
                            isHistoricalBackfill && postTimestamp ? postTimestamp : Date.now();
                        const entry = {
                            id: key,
                            emojiKey,
                            timestamp: entryTimestamp,
                            timestampEstimated: Boolean(isHistoricalBackfill && postTimestamp),
                            channelId,
                            guildId: resolvedGuildId,
                            isDm: loc.isDm,
                            isGroupDm: loc.isGroupDm,
                            messageId: msg.id,
                            userId: u.id,
                            userName,
                            userHandle,
                            userAvatarUrl,
                            guildName: loc.guildName,
                            guildIconUrl: loc.guildIconUrl,
                            guildAcronym: loc.guildAcronym,
                            channelName: loc.channelName,
                            categoryName: loc.categoryName,
                            emojiId,
                            emojiName,
                            emojiAnimated,
                            burst,
                            messageSnippet: snippet,
                            removed: false,
                            read: isHistoricalBackfill ? true : this.panelOpen,
                        };

                        this.knownKeys.add(key);
                        this.entries.unshift(entry);
                        if (!isHistoricalBackfill && this.panelOpen) {
                            this.sessionUnreadIds.add(entry.id);
                        }
                        addedCount++;
                    }
                } catch (err) {
                    console.warn(`[${PLUGIN_NAME}] Failed fetching reactors for ${channelId}/${msg.id}:`, err);
                }

                await new Promise((res) => setTimeout(res, 180));
            }
        }

        return addedCount;
    }

    async syncTrackedPosts() {
        const selfId = this.stores.UserStore?.getCurrentUser?.()?.id;
        if (!selfId || !this.restApi || typeof this.restApi.get !== "function") {
            return { addedCount: 0, channelsChecked: 0, postsChecked: 0 };
        }

        // Also make sure the currently open channel's recent posts are included
        const activeChanId = this.stores.SelectedChannelStore?.getChannelId?.();
        if (activeChanId) {
            const storeMsgs = this.stores.MessageStore?.getMessages?.(activeChanId);
            const arr = storeMsgs?.toArray?.() || storeMsgs?._array || (Array.isArray(storeMsgs) ? storeMsgs : []);
            const ch = this.stores.ChannelStore?.getChannel?.(activeChanId);
            const gId = ch?.guild_id || null;
            for (const m of arr) {
                if (m?.author?.id === selfId) this.trackOwnMessage(m, activeChanId, gId);
            }
        }

        this.pruneTrackedPosts();
        if (this.trackedPosts.length === 0) {
            return { addedCount: 0, channelsChecked: 0, postsChecked: 0 };
        }

        // Group tracked posts by channel (most recently active channels first, cap at 12)
        const byChannel = new Map();
        for (const post of this.trackedPosts) {
            if (!byChannel.has(post.channelId)) {
                if (byChannel.size >= 12) continue;
                byChannel.set(post.channelId, []);
            }
            byChannel.get(post.channelId).push(post);
        }

        let addedCount = 0;
        let channelsChecked = 0;
        let postsChecked = 0;
        let aroundFallbacks = 0;
        let errors = 0;
        let lastErrorMsg = "";

        for (const [channelId, posts] of byChannel.entries()) {
            if (this.stopped) break;
            channelsChecked++;

            let fetchedById = new Map();
            try {
                const res = await this.restApi.get({
                    url: `/channels/${channelId}/messages`,
                    query: { limit: 50 },
                });
                const list = Array.isArray(res?.body) ? res.body : Array.isArray(res) ? res : [];
                for (const m of list) {
                    if (m?.id) fetchedById.set(m.id, m);
                }
            } catch (err) {
                errors++;
                lastErrorMsg = err?.status ? `HTTP ${err.status}` : String(err?.message || err);
                console.warn(`[${PLUGIN_NAME}] Could not fetch recent messages in channel ${channelId}:`, err);
                continue;
            }

            // Iterate oldest -> newest so newer posts never get stamped earlier than older ones
            const orderedPosts = [...posts].reverse();
            let trackedUpdated = false;

            for (const post of orderedPosts) {
                if (this.stopped) break;
                let msg = fetchedById.get(post.messageId);

                // If a busy channel pushed the post beyond the latest 50 messages, fetch around it (capped per sync)
                if (!msg && aroundFallbacks < 8) {
                    aroundFallbacks++;
                    try {
                        const res = await this.restApi.get({
                            url: `/channels/${channelId}/messages`,
                            query: { around: post.messageId, limit: 3 },
                        });
                        const list = Array.isArray(res?.body) ? res.body : Array.isArray(res) ? res : [];
                        msg = list.find((m) => m && m.id === post.messageId) || null;
                    } catch (_) {
                        msg = null;
                    }
                    await new Promise((r) => setTimeout(r, 180));
                }

                if (!msg) continue;
                postsChecked++;

                const newlyAdded = await this.fetchAndIngestReactionsForMessage(
                    msg,
                    channelId,
                    post.guildId,
                    selfId,
                    {
                        isHistoricalBackfill: post.syncedOnce === false,
                        postTimestamp: post.timestamp,
                    }
                );
                addedCount += newlyAdded;

                if (!post.syncedOnce) {
                    post.syncedOnce = true;
                    trackedUpdated = true;
                }
            }

            if (trackedUpdated) this.saveTrackedPosts();

            if (!this.stopped) {
                await new Promise((r) => setTimeout(r, 220));
            }
        }

        return { addedCount, channelsChecked, postsChecked, errors, lastErrorMsg };
    }

    async syncFromNotificationCenter({ silent = false } = {}) {
        if (this.isSyncing) return;
        if (silent) {
            if (typeof navigator !== "undefined" && navigator.onLine === false) return;
            if (Date.now() < this.syncBackoffUntil) return;
        }
        if (!this.restApi || typeof this.restApi.get !== "function") {
            if (!silent) BdApi.UI.showToast("ReactionInbox: Discord RestAPI module not found.", { type: "warning" });
            return;
        }

        this.isSyncing = true;
        const syncBtn = document.getElementById("ri-sync-btn");
        if (syncBtn) {
            syncBtn.disabled = true;
            syncBtn.classList.add("ri-syncing");
            syncBtn.title = "Syncing reactions...";
        }

        let addedCount = 0;
        let postStats = { addedCount: 0, channelsChecked: 0, postsChecked: 0 };

        try {
            // 1. Pull Discord's server-side Notification Center (unmuted servers & DMs)
            try {
                const res = await this.restApi.get({
                    url: "/users/@me/notification-center/items",
                    query: { limit: 100 },
                });
                const items = res?.body?.items || res?.items || [];
                for (const item of items) {
                    if (this.ingestNotificationCenterItem(item, { historical: true })) {
                        addedCount++;
                    }
                }
            } catch (ncErr) {
                console.warn(`[${PLUGIN_NAME}] Notification Center fetch skipped:`, ncErr);
            }

            // 2. Check reactions on your recent posts across ALL channels (including huge/muted servers!)
            postStats = await this.syncTrackedPosts();
            addedCount += postStats.addedCount;

            this.lastSyncAt = Date.now();
            this.syncBackoffUntil = 0;

            if (addedCount > 0) {
                this.entries.sort((a, b) => b.timestamp - a.timestamp);
                this.saveKnownKeys();
                this.saveEntries();
                this.updateBadge();
                if (this.panelOpen) this.renderPanelList();
            }

            if (!silent) {
                if (addedCount > 0) {
                    BdApi.UI.showToast(
                        `Synced ${addedCount} new reaction${addedCount === 1 ? "" : "s"}!`,
                        { type: "success" }
                    );
                } else if (postStats.errors > 0 && postStats.postsChecked === 0) {
                    BdApi.UI.showToast(
                        `Sync failed (${postStats.lastErrorMsg || "REST error"}) — check Ctrl+Shift+I console.`,
                        { type: "warning" }
                    );
                } else {
                    const detail =
                        postStats.postsChecked > 0
                            ? ` (checked ${postStats.channelsChecked} ch · ${postStats.postsChecked} posts)`
                            : "";
                    BdApi.UI.showToast(`Up to date${detail}.`, { type: "info" });
                }
            }
        } catch (err) {
            this.syncBackoffUntil = Date.now() + 5 * 60 * 1000;
            console.warn(`[${PLUGIN_NAME}] Sync failed (backing off 5m):`, err);
            if (!silent) {
                BdApi.UI.showToast("Could not sync reactions right now.", { type: "warning" });
            }
        } finally {
            this.isSyncing = false;
            const btnNow = document.getElementById("ri-sync-btn");
            if (btnNow) {
                btnNow.disabled = false;
                btnNow.classList.remove("ri-syncing");
                btnNow.title = "Sync reactions";
            }
        }
    }

    // -------------------------------------------------------------------------
    // Automatic Message Content Loader (for uncached messages)
    // -------------------------------------------------------------------------

    hydrateMissingSnippets() {
        for (const entry of this.entries) {
            if (!entry.messageSnippet && !entry.isTest) {
                this.queueMessageFetch(entry.channelId, entry.messageId);
            }
        }
    }

    applySnippetToEntries(channelId, messageId, snippet) {
        if (!snippet) return false;
        let changed = false;
        for (const e of this.entries) {
            if (e.channelId === channelId && e.messageId === messageId && !e.messageSnippet) {
                e.messageSnippet = snippet;
                changed = true;
            }
        }
        if (changed) this.saveEntries();
        if (changed && this.panelOpen) this.renderPanelList();
        return changed;
    }

    queueMessageFetch(channelId, messageId) {
        if (!channelId || !messageId) return;
        if (!/^\d+$/.test(String(channelId)) || !/^\d+$/.test(String(messageId))) return;
        if (channelId === "0" || messageId === "0") return;

        // Try local MessageStore cache first (instant, zero network)
        const cached = this.stores.MessageStore?.getMessage?.(channelId, messageId);
        const localSnippet = this.extractMessageSnippet(cached);
        if (localSnippet) {
            this.applySnippetToEntries(channelId, messageId, localSnippet);
            return;
        }

        if (!this.restApi || typeof this.restApi.get !== "function") return;

        const key = `${channelId}:${messageId}`;
        if (this.queuedFetchKeys.has(key) || this.failedFetchKeys.has(key)) return;

        this.queuedFetchKeys.add(key);
        this.fetchQueue.push({ channelId, messageId, key, retried: false });
        this.drainMessageFetchQueue();
    }

    async drainMessageFetchQueue() {
        if (this.isDrainingQueue || this.stopped) return;
        this.isDrainingQueue = true;

        try {
            while (this.fetchQueue.length > 0 && !this.stopped) {
                const job = this.fetchQueue.shift();
                if (!job) continue;
                const { channelId, messageId, key, retried } = job;

                // Skip if already populated while waiting in queue
                const stillMissing = this.entries.some(
                    (e) => e.channelId === channelId && e.messageId === messageId && !e.messageSnippet
                );
                if (!stillMissing) {
                    this.queuedFetchKeys.delete(key);
                    continue;
                }

                try {
                    const res = await this.restApi.get({
                        url: `/channels/${channelId}/messages`,
                        query: { around: messageId, limit: 3 },
                    });
                    if (this.stopped) break;

                    const list = Array.isArray(res?.body) ? res.body : Array.isArray(res) ? res : [];
                    const found = list.find((m) => m && m.id === messageId);
                    const snippet = found
                        ? this.extractMessageSnippet(found) || "[Empty message]"
                        : "[Message deleted]";

                    this.queuedFetchKeys.delete(key);
                    this.applySnippetToEntries(channelId, messageId, snippet);
                } catch (err) {
                    if (err?.status === 429 && !retried && !this.stopped) {
                        const waitMs = Math.min(10000, Math.max(1000, Number(err?.body?.retry_after || 2) * 1000));
                        await new Promise((r) => setTimeout(r, waitMs));
                        this.fetchQueue.unshift({ channelId, messageId, key, retried: true });
                        continue;
                    }
                    this.queuedFetchKeys.delete(key);
                    this.failedFetchKeys.add(key);
                    console.warn(`[${PLUGIN_NAME}] Could not load message ${channelId}/${messageId}:`, err);
                    if (this.panelOpen) this.renderPanelList();
                }

                if (this.fetchQueue.length > 0 && !this.stopped) {
                    await new Promise((r) => setTimeout(r, 250));
                }
            }
        } finally {
            this.isDrainingQueue = false;
        }
    }

    // -------------------------------------------------------------------------
    // Resolvers
    // -------------------------------------------------------------------------

    resolveUser(userId, guildId, eventMember) {
        const user = this.stores.UserStore?.getUser?.(userId);
        const memberUser = eventMember?.user;
        const guildNick = guildId ? this.stores.GuildMemberStore?.getNick?.(guildId, userId) : null;

        const userName =
            guildNick ||
            eventMember?.nick ||
            user?.globalName ||
            memberUser?.global_name ||
            user?.username ||
            memberUser?.username ||
            `User ${userId}`;

        const userHandle = user?.username || memberUser?.username || "";

        let userAvatarUrl = null;
        if (typeof user?.getAvatarURL === "function") {
            userAvatarUrl = user.getAvatarURL(guildId, 64);
        } else {
            const avatarHash = user?.avatar || memberUser?.avatar;
            if (avatarHash && /^\d+$/.test(String(userId))) {
                userAvatarUrl = `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.webp?size=64`;
            } else if (/^\d+$/.test(String(userId))) {
                const idx = Number((BigInt(userId) >> 22n) % 6n);
                userAvatarUrl = `https://cdn.discordapp.com/embed/avatars/${idx}.png`;
            }
        }

        return { userName, userHandle, userAvatarUrl };
    }

    toStaticIconUrl(url) {
        if (!url || typeof url !== "string") return url;
        return url
            .replace(/\.gif(\?|$)/i, ".png$1")
            .replace(/([?&])animated=true(&|$)/i, (_, sep, trail) => (trail === "&" ? sep : ""));
    }

    makeAcronym(name) {
        const cleaned = String(name || "")
            .replace(/'s /gi, " ")
            .replace(/[^a-zA-Z0-9\s]/g, " ")
            .trim();
        if (!cleaned) return "?";
        const words = cleaned.split(/\s+/).filter(Boolean);
        if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
        return words
            .map((w) => w[0])
            .join("")
            .slice(0, 3)
            .toUpperCase();
    }

    resolveLocation(guildId, channel, fallbackAvatarUrl = null) {
        // 1-on-1 DM
        if (!guildId && channel?.type !== 3) {
            let dmName = "Direct Message";
            let dmIconUrl = fallbackAvatarUrl || null;
            const recipientId = channel?.recipients?.[0];
            if (recipientId) {
                const r = this.stores.UserStore?.getUser?.(recipientId);
                if (r) {
                    dmName = r.globalName || r.username;
                    if (typeof r.getAvatarURL === "function") {
                        dmIconUrl = r.getAvatarURL(null, 64);
                    } else if (r.avatar && /^\d+$/.test(String(recipientId))) {
                        dmIconUrl = `https://cdn.discordapp.com/avatars/${recipientId}/${r.avatar}.webp?size=64`;
                    }
                }
            }
            return {
                isDm: true,
                isGroupDm: false,
                guildName: "Direct Message",
                guildIconUrl: dmIconUrl,
                guildAcronym: "DM",
                channelName: dmName,
                categoryName: null,
            };
        }

        // Group DM
        if (!guildId || channel?.type === 3) {
            const names = (channel?.recipients || [])
                .map((id) => {
                    const u = this.stores.UserStore?.getUser?.(id);
                    return u ? u.globalName || u.username : null;
                })
                .filter(Boolean);
            let groupIconUrl = null;
            if (channel?.icon && /^\d+$/.test(String(channel.id))) {
                groupIconUrl = `https://cdn.discordapp.com/channel-icons/${channel.id}/${channel.icon}.webp?size=64`;
            }
            const groupName = channel?.name || names.join(", ") || "Group DM";
            return {
                isDm: true,
                isGroupDm: true,
                guildName: "Group DM",
                guildIconUrl: groupIconUrl,
                guildAcronym: this.makeAcronym(groupName),
                channelName: groupName,
                categoryName: null,
            };
        }

        // Server channel / thread
        const guild = this.stores.GuildStore?.getGuild?.(guildId);
        const guildName = guild?.name || "Server";

        let guildIconUrl = null;
        if (typeof guild?.getIconURL === "function") {
            guildIconUrl = guild.getIconURL(64, false);
        } else if (guild?.icon && /^\d+$/.test(String(guildId))) {
            guildIconUrl = `https://cdn.discordapp.com/icons/${guildId}/${guild.icon}.png?size=64`;
        }
        if (typeof guildIconUrl === "string") {
            guildIconUrl = this.toStaticIconUrl(guildIconUrl);
        }

        const parentChannel = channel?.parent_id ? this.stores.ChannelStore?.getChannel?.(channel.parent_id) : null;
        const categoryName = parentChannel?.name || null;

        return {
            isDm: false,
            isGroupDm: false,
            guildName,
            guildIconUrl,
            guildAcronym: this.makeAcronym(guildName),
            channelName: channel?.name ? `#${channel.name}` : "#channel",
            categoryName,
        };
    }

    extractMessageSnippet(msg) {
        if (!msg) return null;
        const text = typeof msg.content === "string" ? msg.content.replace(/\s+/g, " ").trim() : "";
        if (text) {
            return text.length > 160 ? `${text.slice(0, 157)}...` : text;
        }
        // Forwarded message snapshot (REST or Flux)
        const forwarded = msg.messageSnapshots?.[0]?.message || msg.message_snapshots?.[0]?.message;
        if (forwarded) {
            const fwdSnippet = this.extractMessageSnippet(forwarded);
            if (fwdSnippet) return `[Forwarded] ${fwdSnippet}`;
        }
        if (Array.isArray(msg.attachments) && msg.attachments.length > 0) {
            if (msg.attachments.length === 1) {
                const a = msg.attachments[0];
                const isImg = typeof a.content_type === "string" && a.content_type.startsWith("image/");
                return `[${isImg ? "Image" : "Attachment"}: ${a.filename || "file"}]`;
            }
            return `[${msg.attachments.length} attachments]`;
        }
        const stickers = msg.stickerItems || msg.sticker_items;
        if (Array.isArray(stickers) && stickers.length > 0) {
            return `[Sticker: ${stickers[0].name || "sticker"}]`;
        }
        if (Array.isArray(msg.embeds) && msg.embeds.length > 0) {
            const e = msg.embeds[0];
            const label = e.title || e.rawTitle || e.description || e.rawDescription || "Embed";
            return `[Embed: ${String(label).slice(0, 100)}]`;
        }
        if (msg.poll?.question?.text) {
            return `[Poll: ${msg.poll.question.text}]`;
        }
        return null;
    }

    // -------------------------------------------------------------------------
    // Navigation
    // -------------------------------------------------------------------------

    jumpToEntry(entry) {
        if (!entry) return;

        if (!entry.read) {
            entry.read = true;
            this.saveEntries();
            this.updateBadge();
        }

        this.closePanel();

        if (entry.isTest) {
            BdApi.UI.showToast("That was a test entry — real reactions jump straight to your post!", { type: "info" });
            return;
        }

        const path = `/channels/${entry.guildId || "@me"}/${entry.channelId}/${entry.messageId}`;
        const { transitionTo, transitionToGuild, selectChannel, jumpToMessage } = this.getNavigationHelpers();
        const currentChannelId = this.stores.SelectedChannelStore?.getChannelId?.();

        if (currentChannelId === entry.channelId && jumpToMessage) {
            jumpToMessage({ channelId: entry.channelId, messageId: entry.messageId, flash: true });
            return;
        }

        const triggerFlashIfInChannel = () => {
            if (!jumpToMessage) return;
            setTimeout(() => {
                try {
                    const activeId = this.stores.SelectedChannelStore?.getChannelId?.();
                    if (!activeId || activeId === entry.channelId) {
                        jumpToMessage({ channelId: entry.channelId, messageId: entry.messageId, flash: true });
                    }
                } catch (_) {
                    // router already jumped
                }
            }, 150);
        };

        if (transitionTo) {
            transitionTo(path);
            triggerFlashIfInChannel();
            return;
        }

        if (transitionToGuild) {
            transitionToGuild(entry.guildId || "@me", entry.channelId, entry.messageId);
            triggerFlashIfInChannel();
            return;
        }

        if (selectChannel) {
            selectChannel({
                guildId: entry.guildId || null,
                channelId: entry.channelId,
                messageId: entry.messageId,
            });
            triggerFlashIfInChannel();
            return;
        }

        const url = `https://discord.com${path}`;
        this.copyText(url);
        BdApi.UI.showToast("Could not auto-jump; copied message link to clipboard.", { type: "warning" });
    }

    copyText(text) {
        if (navigator.clipboard?.writeText) {
            navigator.clipboard.writeText(text).catch(() => {});
        } else if (typeof DiscordNative !== "undefined" && DiscordNative.clipboard?.copy) {
            DiscordNative.clipboard.copy(text);
        }
    }

    // -------------------------------------------------------------------------
    // Button Mounting & Observer
    // -------------------------------------------------------------------------

    startObserver() {
        this.observer = new MutationObserver(() => {
            if (!document.getElementById(BTN_ID)) {
                if (this.mountTimer) clearTimeout(this.mountTimer);
                this.mountTimer = setTimeout(() => this.ensureButtonMounted(), 120);
            }
        });
        this.observer.observe(document.body, { childList: true, subtree: true });
    }

    findInboxAnchor() {
        const inboxBtn = document.querySelector(
            'button[aria-label="Inbox"], [role="button"][aria-label="Inbox"], div[aria-label="Inbox"]'
        );
        if (!inboxBtn || !inboxBtn.parentElement) return null;

        let anchor = inboxBtn;
        if (
            anchor.parentElement &&
            anchor.parentElement.tagName === "DIV" &&
            anchor.parentElement.children.length === 1 &&
            anchor.parentElement.parentElement
        ) {
            anchor = anchor.parentElement;
        }
        return anchor;
    }

    ensureButtonMounted() {
        const existing = document.getElementById(BTN_ID);
        const anchor = this.findInboxAnchor();

        if (existing) {
            if (existing.classList.contains("ri-floating") && anchor?.parentElement) {
                existing.classList.remove("ri-floating");
                anchor.parentElement.insertBefore(existing, anchor);
            }
            this.updateBadge();
            return;
        }

        const btn = document.createElement("button");
        btn.id = BTN_ID;
        btn.type = "button";
        btn.setAttribute("aria-label", "Reaction Inbox");
        btn.title = "Reaction Inbox (Alt+Shift+E)";
        btn.innerHTML = `${ICON_SVG}<span class="ri-badge"></span>`;
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            this.togglePanel();
        });

        if (anchor?.parentElement) {
            anchor.parentElement.insertBefore(btn, anchor);
        } else if (this.settings.useFloatingFallback) {
            btn.classList.add("ri-floating");
            document.body.appendChild(btn);
        }

        this.updateBadge();
    }

    isDmEntry(entry) {
        return entry?.isDm === true || !entry?.guildId;
    }

    getUnreadCount() {
        return this.entries.reduce((sum, e) => sum + (e.read ? 0 : 1), 0);
    }

    hasUnreadDm() {
        return this.entries.some((e) => !e.read && this.isDmEntry(e));
    }

    updateBadge() {
        const btn = document.getElementById(BTN_ID);
        if (!btn) return;
        const badge = btn.querySelector(".ri-badge");
        if (!badge) return;

        const unread = this.getUnreadCount();
        badge.textContent = unread > 0 ? (unread > 99 ? "99+" : String(unread)) : "";
        btn.classList.toggle("ri-active", this.panelOpen);
    }

    // -------------------------------------------------------------------------
    // Popover Panel UI
    // -------------------------------------------------------------------------

    togglePanel() {
        if (this.panelOpen) {
            this.closePanel();
        } else {
            this.openPanel();
        }
    }

    enrichEntryMetadata(entry) {
        if (!entry || entry.isTest) return false;
        let changed = false;

        if (!entry.messageSnippet) {
            const msg = this.stores.MessageStore?.getMessage?.(entry.channelId, entry.messageId);
            const snippet = this.extractMessageSnippet(msg);
            if (snippet) {
                entry.messageSnippet = snippet;
                changed = true;
            }
        }

        // Backfill server icon, category name, and DM icon for older saved entries
        const needsLocationInfo =
            entry.guildIconUrl === undefined ||
            entry.categoryName === undefined ||
            entry.isDm === undefined;

        if (needsLocationInfo) {
            const channel = this.stores.ChannelStore?.getChannel?.(entry.channelId);
            const loc = this.resolveLocation(entry.guildId, channel, entry.userAvatarUrl);
            entry.isDm = loc.isDm;
            entry.isGroupDm = loc.isGroupDm;
            if (!entry.guildIconUrl && loc.guildIconUrl) entry.guildIconUrl = loc.guildIconUrl;
            if (!entry.guildAcronym && loc.guildAcronym) entry.guildAcronym = loc.guildAcronym;
            if (entry.categoryName === undefined) entry.categoryName = loc.categoryName;
            // Clean up legacy "@Name" DM prefix saved by v1.0.x
            if (entry.isDm && typeof entry.channelName === "string" && entry.channelName.startsWith("@")) {
                entry.channelName = entry.channelName.slice(1);
            }
            changed = true;
        }

        return changed;
    }

    openPanel() {
        if (this.panelOpen) return;
        this.panelOpen = true;

        this.sessionUnreadIds = new Set();
        let updated = false;
        for (const entry of this.entries) {
            if (!entry.read) {
                this.sessionUnreadIds.add(entry.id);
                entry.read = true;
                updated = true;
            }
            if (this.enrichEntryMetadata(entry)) {
                updated = true;
            }
        }
        if (updated) this.saveEntries();

        const panel = document.createElement("div");
        panel.id = PANEL_ID;

        const btn = document.getElementById(BTN_ID);
        if (btn) {
            const rect = btn.getBoundingClientRect();
            const top = Math.min(Math.max(rect.bottom + 6, 36), window.innerHeight - 200);
            const panelWidth = Math.min(730, window.innerWidth - 24);
            const maxRight = Math.max(12, window.innerWidth - panelWidth - 12);
            const right = Math.min(Math.max(12, window.innerWidth - rect.right - 24), maxRight);
            panel.style.top = `${top}px`;
            panel.style.right = `${right}px`;
            panel.style.height = `calc(100vh - ${Math.round(top) + 14}px)`;
            panel.style.maxHeight = `calc(100vh - ${Math.round(top) + 14}px)`;
        }

        const showSearch = this.searchOpen || Boolean(this.searchQuery);
        panel.innerHTML = `
            <div class="ri-header">
                <div class="ri-title-wrap">
                    <span class="ri-title-icon">${ICON_SVG}</span>
                    <h3 class="ri-title">Reaction Inbox</h3>
                </div>
                <div class="ri-header-actions">
                    <button type="button" class="ri-header-icon-btn${showSearch ? " ri-btn-active" : ""}" id="ri-search-toggle-btn" title="Filter reactions (Ctrl+F)" aria-label="Filter reactions">${SEARCH_SVG}</button>
                    <button type="button" class="ri-header-icon-btn${this.isSyncing ? " ri-syncing" : ""}" id="ri-sync-btn" title="${this.isSyncing ? "Syncing reactions..." : "Sync reactions"}" aria-label="Sync reactions"${this.isSyncing ? " disabled" : ""}>${SYNC_SVG}</button>
                </div>
            </div>
            <div class="ri-tabs">
                <button type="button" class="ri-tab" data-tab="all">All</button>
                <button type="button" class="ri-tab" data-tab="servers">Servers</button>
                <button type="button" class="ri-tab" data-tab="dms">DMs</button>
            </div>
            <div class="ri-search-wrap${showSearch ? " ri-search-open" : ""}" id="ri-search-wrap">
                <input type="text" class="ri-search" id="ri-search-input" placeholder="Filter by person, server, channel, emoji, or message..." />
            </div>
            <div class="ri-list" id="ri-list"></div>
        `;

        document.body.appendChild(panel);

        panel.querySelectorAll(".ri-tab").forEach((tabBtn) => {
            tabBtn.addEventListener("click", () => {
                this.activeTab = tabBtn.dataset.tab;
                this.syncTabButtons(panel);
                this.renderPanelList();
            });
        });
        this.syncTabButtons(panel);

        const searchWrap = panel.querySelector("#ri-search-wrap");
        const searchToggleBtn = panel.querySelector("#ri-search-toggle-btn");
        const searchInput = panel.querySelector("#ri-search-input");
        searchInput.value = this.searchQuery;
        searchInput.addEventListener("input", (e) => {
            this.searchQuery = e.target.value;
            this.renderPanelList();
        });
        searchToggleBtn.addEventListener("click", () => {
            this.searchOpen = !this.searchOpen;
            if (!this.searchOpen && this.searchQuery) {
                this.searchQuery = "";
                searchInput.value = "";
                this.renderPanelList();
            }
            searchWrap.classList.toggle("ri-search-open", this.searchOpen);
            searchToggleBtn.classList.toggle("ri-btn-active", this.searchOpen);
            if (this.searchOpen) searchInput.focus();
        });

        panel.querySelector("#ri-sync-btn").addEventListener("click", () => {
            this.syncFromNotificationCenter({ silent: false });
        });

        const listScroll = panel.querySelector("#ri-list");
        if (listScroll) {
            listScroll.addEventListener("scroll", () => this.hideEmoteTooltip(), { passive: true });
        }

        this.renderPanelList();
        this.updateBadge();
        this.hydrateMissingSnippets();

        // Quietly refresh on open if it's been >30s since last sync
        if (Number(this.settings.autoSyncMinutes) > 0 && Date.now() - this.lastSyncAt > 30000) {
            this.syncFromNotificationCenter({ silent: true });
        }
    }

    closePanel() {
        if (!this.panelOpen) return;
        this.panelOpen = false;
        this.sessionUnreadIds.clear();
        this.hideEmoteTooltip();
        const panel = document.getElementById(PANEL_ID);
        if (panel) panel.remove();
        this.updateBadge();
    }

    hideEmoteTooltip() {
        const existing = document.getElementById(TOOLTIP_ID);
        if (existing) existing.remove();
    }

    showEmoteTooltip(anchorEl, entry) {
        this.hideEmoteTooltip();
        if (!anchorEl || !entry) return;

        const tt = document.createElement("div");
        tt.id = TOOLTIP_ID;

        const emoteLabel = this.getEmoteDisplayName(entry) || entry.emojiName || "?";

        // High-res 48x48 preview inside the hover card (just like Discord's native hover card)
        if (entry.emojiId && /^\d+$/.test(String(entry.emojiId))) {
            const img = document.createElement("img");
            img.className = "ri-tt-img";
            const ext = entry.emojiAnimated ? "gif" : "webp";
            img.src = `https://cdn.discordapp.com/emojis/${entry.emojiId}.${ext}?size=128&quality=lossless`;
            img.alt = emoteLabel;
            tt.appendChild(img);
        } else {
            const urls = this.getUnicodeEmojiUrls(entry.emojiName || "");
            if (urls.length > 0) {
                const img = document.createElement("img");
                img.className = "ri-tt-img";
                let idx = 0;
                img.src = urls[0];
                img.alt = emoteLabel;
                img.onerror = () => {
                    idx++;
                    if (idx < urls.length) {
                        img.src = urls[idx];
                    } else {
                        const span = document.createElement("span");
                        span.className = "ri-tt-fallback";
                        span.textContent = entry.emojiName || "?";
                        img.replaceWith(span);
                    }
                };
                tt.appendChild(img);
            } else {
                const span = document.createElement("span");
                span.className = "ri-tt-fallback";
                span.textContent = entry.emojiName || "?";
                tt.appendChild(span);
            }
        }

        const textWrap = document.createElement("div");
        textWrap.className = "ri-tt-text";

        const emoteSpan = document.createElement("span");
        emoteSpan.className = "ri-tt-name";
        emoteSpan.textContent = emoteLabel;

        const mid = document.createTextNode(" reacted by ");

        const userSpan = document.createElement("span");
        userSpan.className = "ri-tt-name";
        userSpan.textContent = entry.userName;

        textWrap.appendChild(emoteSpan);
        textWrap.appendChild(mid);
        textWrap.appendChild(userSpan);
        tt.appendChild(textWrap);

        document.body.appendChild(tt);

        // Position cleanly above the hovered emoji pill (flip below if near top)
        const aRect = anchorEl.getBoundingClientRect();
        const tRect = tt.getBoundingClientRect();
        let top = aRect.top - tRect.height - 8;
        if (top < 10) {
            top = aRect.bottom + 8;
        }
        let left = aRect.left + aRect.width / 2 - tRect.width / 2;
        left = Math.max(12, Math.min(left, window.innerWidth - tRect.width - 12));

        tt.style.top = `${Math.round(top)}px`;
        tt.style.left = `${Math.round(left)}px`;
    }

    syncTabButtons(panel) {
        panel.querySelectorAll(".ri-tab").forEach((b) => {
            b.classList.toggle("ri-tab-active", b.dataset.tab === this.activeTab);
        });
    }

    renderPanelList() {
        const panel = document.getElementById(PANEL_ID);
        if (!panel) return;

        const listEl = panel.querySelector("#ri-list");
        const countEl = panel.querySelector("#ri-total-count");
        if (!listEl) return;

        const q = this.searchQuery.trim().toLowerCase();
        const filtered = this.entries
            .filter((e) => {
                const dm = this.isDmEntry(e);
                if (this.activeTab === "dms" && !dm) return false;
                if (this.activeTab === "servers" && dm) return false;

                if (q) {
                    const haystack = [
                        e.userName,
                        e.userHandle,
                        e.guildName,
                        e.categoryName || "",
                        e.channelName,
                        e.emojiName,
                        e.messageSnippet || "",
                    ]
                        .join(" ")
                        .toLowerCase();
                    if (!haystack.includes(q)) return false;
                }
                return true;
            })
            .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

        if (countEl) {
            countEl.textContent = `${this.entries.length}`;
        }

        listEl.innerHTML = "";

        if (filtered.length === 0) {
            const empty = document.createElement("div");
            empty.className = "ri-empty";
            empty.innerHTML =
                this.entries.length === 0
                    ? `<strong>No reactions logged yet</strong>Whenever someone reacts to one of your messages while Discord is open, it'll show up right here.<br><br>Tip: you can test this instantly in <em>BetterDiscord → Plugins → ReactionInbox ⚙️</em>.`
                    : `<strong>No matching reactions</strong>Try switching tabs or clearing your filter.`;
            listEl.appendChild(empty);
            return;
        }

        const frag = document.createDocumentFragment();
        for (const entry of filtered) {
            frag.appendChild(this.buildEntryCard(entry));
        }
        listEl.appendChild(frag);
    }

    renderTextWithTwemoji(parentEl, text) {
        const str = String(text ?? "");
        if (!str) return;
        INLINE_EMOJI_RE.lastIndex = 0;
        let lastIdx = 0;
        let match;
        while ((match = INLINE_EMOJI_RE.exec(str)) !== null) {
            if (match.index > lastIdx) {
                parentEl.appendChild(document.createTextNode(str.slice(lastIdx, match.index)));
            }
            const emoji = match[0];
            const urls = this.getUnicodeEmojiUrls(emoji);
            if (urls.length > 0) {
                const img = document.createElement("img");
                img.className = "ri-inline-twemoji";
                let uIdx = 0;
                img.src = urls[0];
                img.alt = emoji;
                img.onerror = () => {
                    uIdx++;
                    if (uIdx < urls.length) {
                        img.src = urls[uIdx];
                    } else {
                        img.replaceWith(document.createTextNode(emoji));
                    }
                };
                parentEl.appendChild(img);
            } else {
                parentEl.appendChild(document.createTextNode(emoji));
            }
            lastIdx = match.index + emoji.length;
        }
        if (lastIdx < str.length) {
            parentEl.appendChild(document.createTextNode(str.slice(lastIdx)));
        }
    }

    buildEntryCard(entry) {
        const isDm = this.isDmEntry(entry);
        const isHighlighted = !entry.read || this.sessionUnreadIds.has(entry.id);

        const card = document.createElement("div");
        card.className = `ri-card${isDm ? " ri-dm" : ""}${isHighlighted ? " ri-unread" : ""}${entry.removed ? " ri-removed" : ""}`;
        card.addEventListener("click", () => this.jumpToEntry(entry));

        // ---------------------------------------------------------------------
        // Header strip (native Discord Inbox card header)
        // ---------------------------------------------------------------------
        const header = document.createElement("div");
        header.className = "ri-card-header";

        const rawIconUrl = entry.guildIconUrl || (isDm ? entry.userAvatarUrl : null);
        const iconUrl = !isDm && rawIconUrl ? this.toStaticIconUrl(rawIconUrl) : rawIconUrl;
        if (iconUrl) {
            const iconImg = document.createElement("img");
            iconImg.className = `ri-source-icon${isDm ? " ri-source-dm" : ""}`;
            iconImg.src = iconUrl;
            iconImg.alt = "";
            iconImg.onerror = () => {
                const fallback = document.createElement("div");
                fallback.className = `ri-source-acronym${isDm ? " ri-source-dm" : ""}`;
                fallback.textContent = entry.guildAcronym || (isDm ? "DM" : this.makeAcronym(entry.guildName));
                iconImg.replaceWith(fallback);
            };
            header.appendChild(iconImg);
        } else {
            const acronym = document.createElement("div");
            acronym.className = `ri-source-acronym${isDm ? " ri-source-dm" : ""}`;
            acronym.textContent = entry.guildAcronym || (isDm ? "DM" : this.makeAcronym(entry.guildName));
            header.appendChild(acronym);
        }

        const crumb = document.createElement("div");
        crumb.className = "ri-source-crumb";

        if (isDm) {
            const cleanName = String(entry.channelName || entry.userName || "Direct Message").replace(/^@/, "");
            const leftPart = document.createElement("span");
            leftPart.className = "ri-source-guild";
            leftPart.textContent = entry.isGroupDm ? "Group DM" : "Direct Message";

            const sep = document.createElement("span");
            sep.className = "ri-source-sep";
            sep.innerHTML = CHEVRON_SVG;

            const rightPart = document.createElement("span");
            rightPart.className = "ri-source-channel";
            const rightName = document.createElement("span");
            rightName.className = "ri-source-channel-name";
            this.renderTextWithTwemoji(rightName, cleanName);
            rightPart.appendChild(rightName);

            crumb.appendChild(leftPart);
            crumb.appendChild(sep);
            crumb.appendChild(rightPart);
        } else {
            const rawChannel = String(entry.channelName || "channel").replace(/^#/, "");
            const guildPart = document.createElement("span");
            guildPart.className = "ri-source-guild";
            this.renderTextWithTwemoji(guildPart, entry.guildName || "Server");

            const sep = document.createElement("span");
            sep.className = "ri-source-sep";
            sep.innerHTML = CHEVRON_SVG;

            const chanPart = document.createElement("span");
            chanPart.className = "ri-source-channel";
            const hash = document.createElement("span");
            hash.className = "ri-source-hash";
            hash.innerHTML = CHANNEL_HASH_SVG;
            const chanName = document.createElement("span");
            chanName.className = "ri-source-channel-name";
            this.renderTextWithTwemoji(chanName, rawChannel);
            chanPart.appendChild(hash);
            chanPart.appendChild(chanName);

            crumb.appendChild(guildPart);
            crumb.appendChild(sep);
            crumb.appendChild(chanPart);
        }

        header.appendChild(crumb);

        // Header right buttons (Copy Link + Dismiss)
        const headerBtns = document.createElement("div");
        headerBtns.className = "ri-card-header-btns";

        const copyBtn = document.createElement("button");
        copyBtn.type = "button";
        copyBtn.className = "ri-icon-btn";
        copyBtn.title = "Copy Message Link";
        copyBtn.innerHTML = LINK_SVG;
        copyBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            const url = `https://discord.com/channels/${entry.guildId || "@me"}/${entry.channelId}/${entry.messageId}`;
            this.copyText(url);
            BdApi.UI.showToast("Copied message link!", { type: "success" });
        });

        const delBtn = document.createElement("button");
        delBtn.type = "button";
        delBtn.className = "ri-icon-btn ri-icon-del";
        delBtn.title = "Dismiss";
        delBtn.innerHTML = CLOSE_SVG;
        delBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            this.hideEmoteTooltip();
            const idx = this.entries.indexOf(entry);
            if (idx !== -1) {
                this.entries.splice(idx, 1);
                this.sessionUnreadIds.delete(entry.id);
                this.saveEntries();
                this.updateBadge();
                this.renderPanelList();
            }
        });

        headerBtns.appendChild(copyBtn);
        headerBtns.appendChild(delBtn);
        header.appendChild(headerBtns);

        // ---------------------------------------------------------------------
        // Body: Native Discord Reply-Spine (your quoted message on top, reactor below)
        // ---------------------------------------------------------------------
        const body = document.createElement("div");
        body.className = "ri-card-body";

        const selfUser = this.stores.UserStore?.getCurrentUser?.();
        const selfId = selfUser?.id || null;
        const selfGuildMember =
            entry.guildId && selfId ? this.stores.GuildMemberStore?.getMember?.(entry.guildId, selfId) : null;
        const selfNick =
            (entry.guildId && selfId ? this.stores.GuildMemberStore?.getNick?.(entry.guildId, selfId) : null) ||
            selfGuildMember?.nick;
        const selfDisplayName = selfNick || selfUser?.globalName || selfUser?.username || "You";

        let selfAvatarUrl = null;
        if (typeof selfUser?.getAvatarURL === "function") {
            selfAvatarUrl = selfUser.getAvatarURL(entry.guildId || null, 32);
        } else if (selfUser?.avatar && selfId) {
            selfAvatarUrl = `https://cdn.discordapp.com/avatars/${selfId}/${selfUser.avatar}.webp?size=32`;
        }

        // Top reply-spine row: YOUR original message
        const replyRow = document.createElement("div");
        replyRow.className = "ri-reply-context";

        if (selfAvatarUrl) {
            const selfAv = document.createElement("img");
            selfAv.className = "ri-reply-avatar";
            selfAv.src = selfAvatarUrl;
            selfAv.alt = "";
            replyRow.appendChild(selfAv);
        }

        const selfAuthorEl = document.createElement("span");
        selfAuthorEl.className = "ri-reply-author";
        selfAuthorEl.textContent = selfDisplayName;
        if (selfGuildMember?.colorString) {
            selfAuthorEl.style.color = selfGuildMember.colorString;
        }
        replyRow.appendChild(selfAuthorEl);

        const snippetEl = document.createElement("span");
        if (entry.messageSnippet) {
            snippetEl.className = "ri-reply-snippet";
            this.renderTextWithTwemoji(snippetEl, entry.messageSnippet);
            snippetEl.title = entry.messageSnippet;
        } else {
            const fetchKey = `${entry.channelId}:${entry.messageId}`;
            snippetEl.className = "ri-reply-snippet ri-snippet-missing";
            snippetEl.textContent = this.queuedFetchKeys.has(fetchKey)
                ? "Loading message..."
                : "Message could not be loaded";
        }
        replyRow.appendChild(snippetEl);
        body.appendChild(replyRow);

        // Main row: 40px Reactor avatar + Reactor name & single timestamp + reaction pill
        const mainRow = document.createElement("div");
        mainRow.className = "ri-main-row";

        if (entry.userAvatarUrl) {
            const avatar = document.createElement("img");
            avatar.className = "ri-avatar";
            avatar.src = entry.userAvatarUrl;
            avatar.alt = "";
            avatar.onerror = () => {
                const fb = document.createElement("div");
                fb.className = "ri-avatar-fallback";
                fb.textContent = String(entry.userName || "?").slice(0, 1).toUpperCase();
                avatar.replaceWith(fb);
            };
            mainRow.appendChild(avatar);
        } else {
            const fb = document.createElement("div");
            fb.className = "ri-avatar-fallback";
            fb.textContent = String(entry.userName || "?").slice(0, 1).toUpperCase();
            mainRow.appendChild(fb);
        }

        const bodyContent = document.createElement("div");
        bodyContent.className = "ri-body-content";

        const authorRow = document.createElement("div");
        authorRow.className = "ri-author-row";

        const reactorNameEl = document.createElement("span");
        reactorNameEl.className = "ri-username";
        reactorNameEl.textContent = entry.userName;
        if (entry.userHandle && entry.userHandle !== entry.userName) {
            reactorNameEl.title = `${entry.userName} (@${entry.userHandle})`;
        }
        if (entry.guildId && entry.userId) {
            const reactorMember = this.stores.GuildMemberStore?.getMember?.(entry.guildId, entry.userId);
            if (reactorMember?.colorString) {
                reactorNameEl.style.color = reactorMember.colorString;
            }
        }
        authorRow.appendChild(reactorNameEl);

        const timeEl = document.createElement("span");
        timeEl.className = "ri-time";
        const clock = this.formatDiscordTime(entry.timestamp);
        timeEl.textContent = entry.timestampEstimated ? `~${clock}` : clock;
        timeEl.title = entry.timestampEstimated
            ? `Approximate reaction time (${new Date(entry.timestamp).toLocaleString()} — Discord doesn't provide exact timestamps for past reactions)`
            : `Reacted ${new Date(entry.timestamp).toLocaleString()}`;
        authorRow.appendChild(timeEl);

        const reactionRow = document.createElement("div");
        reactionRow.className = "ri-reaction-row";

        const reactedLabel = document.createElement("span");
        reactedLabel.className = "ri-reacted-label";
        reactedLabel.textContent = "reacted";
        reactionRow.appendChild(reactedLabel);

        const emojiPill = document.createElement("span");
        emojiPill.className = `ri-emoji-pill${entry.burst ? " ri-burst" : ""}`;

        if (entry.emojiId && /^\d+$/.test(String(entry.emojiId))) {
            const img = document.createElement("img");
            const ext = entry.emojiAnimated ? "gif" : "webp";
            img.src = `https://cdn.discordapp.com/emojis/${entry.emojiId}.${ext}?size=48&quality=lossless`;
            img.alt = `:${entry.emojiName}:`;
            img.onerror = () => {
                img.replaceWith(document.createTextNode(`:${entry.emojiName}:`));
            };
            emojiPill.appendChild(img);
        } else {
            const unicodeUrls = this.getUnicodeEmojiUrls(entry.emojiName || "");
            if (unicodeUrls.length > 0) {
                const img = document.createElement("img");
                let idx = 0;
                img.src = unicodeUrls[0];
                img.alt = entry.emojiName || "?";
                img.onerror = () => {
                    idx++;
                    if (idx < unicodeUrls.length) {
                        img.src = unicodeUrls[idx];
                    } else {
                        img.replaceWith(document.createTextNode(entry.emojiName || "?"));
                    }
                };
                emojiPill.appendChild(img);
            } else {
                emojiPill.textContent = entry.emojiName || "?";
            }
        }

        emojiPill.addEventListener("mouseenter", () => this.showEmoteTooltip(emojiPill, entry));
        emojiPill.addEventListener("mouseleave", () => this.hideEmoteTooltip());
        reactionRow.appendChild(emojiPill);

        if (entry.burst) {
            const superTag = document.createElement("span");
            superTag.className = "ri-tag ri-tag-super";
            superTag.textContent = "Super";
            reactionRow.appendChild(superTag);
        }

        if (entry.removed) {
            const remTag = document.createElement("span");
            remTag.className = "ri-tag ri-tag-removed";
            remTag.textContent = "Removed";
            reactionRow.appendChild(remTag);
        }

        bodyContent.appendChild(authorRow);
        bodyContent.appendChild(reactionRow);
        mainRow.appendChild(bodyContent);
        body.appendChild(mainRow);

        card.appendChild(header);
        card.appendChild(body);
        return card;
    }

    formatDiscordTime(ts) {
        const d = new Date(ts);
        const now = new Date();
        const timeStr = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

        const isSameDay =
            d.getFullYear() === now.getFullYear() &&
            d.getMonth() === now.getMonth() &&
            d.getDate() === now.getDate();
        if (isSameDay) return timeStr;

        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        const isYesterday =
            d.getFullYear() === yesterday.getFullYear() &&
            d.getMonth() === yesterday.getMonth() &&
            d.getDate() === yesterday.getDate();
        if (isYesterday) return `Yesterday at ${timeStr}`;

        return `${d.toLocaleDateString()} ${timeStr}`;
    }

    // -------------------------------------------------------------------------
    // Global Event Listeners
    // -------------------------------------------------------------------------

    onDocumentClick(e) {
        if (!this.panelOpen) return;
        const panel = document.getElementById(PANEL_ID);
        const btn = document.getElementById(BTN_ID);
        if (panel && panel.contains(e.target)) return;
        if (btn && btn.contains(e.target)) return;
        this.closePanel();
    }

    onKeyDown(e) {
        if (e.key === "Escape" && this.panelOpen) {
            if (this.searchOpen) {
                this.searchOpen = false;
                const panel = document.getElementById(PANEL_ID);
                const wrap = panel?.querySelector("#ri-search-wrap");
                const btn = panel?.querySelector("#ri-search-toggle-btn");
                const input = panel?.querySelector("#ri-search-input");
                if (this.searchQuery) {
                    this.searchQuery = "";
                    if (input) input.value = "";
                    this.renderPanelList();
                }
                if (wrap) wrap.classList.remove("ri-search-open");
                if (btn) btn.classList.remove("ri-btn-active");
                return;
            }
            this.closePanel();
            return;
        }
        if (this.panelOpen && (e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey && e.key.toLowerCase() === "f") {
            e.preventDefault();
            e.stopPropagation();
            this.searchOpen = true;
            const panel = document.getElementById(PANEL_ID);
            const wrap = panel?.querySelector("#ri-search-wrap");
            const btn = panel?.querySelector("#ri-search-toggle-btn");
            const input = panel?.querySelector("#ri-search-input");
            if (wrap) wrap.classList.add("ri-search-open");
            if (btn) btn.classList.add("ri-btn-active");
            if (input) input.focus();
            return;
        }
        if (e.altKey && e.shiftKey && !e.ctrlKey && !e.metaKey && e.key.toLowerCase() === "e") {
            e.preventDefault();
            this.togglePanel();
        }
    }

    // -------------------------------------------------------------------------
    // BetterDiscord Settings Panel
    // -------------------------------------------------------------------------

    addTestEntry() {
        const self = this.stores.UserStore?.getCurrentUser?.();
        const avatarUrl = typeof self?.getAvatarURL === "function" ? self.getAvatarURL(null, 64) : null;
        this.entries.unshift({
            id: `test:${Date.now()}`,
            emojiKey: "name:🔥",
            timestamp: Date.now(),
            channelId: "0",
            guildId: "0",
            isDm: false,
            isGroupDm: false,
            messageId: "0",
            userId: self?.id || "0",
            userName: self?.globalName || self?.username || "Test User",
            userHandle: self?.username || "testuser",
            userAvatarUrl: avatarUrl,
            guildName: "Test Server",
            guildIconUrl: null,
            guildAcronym: "TS",
            channelName: "#general",
            categoryName: "TEXT CHANNELS",
            emojiId: null,
            emojiName: "🔥",
            emojiAnimated: false,
            burst: false,
            messageSnippet: "This is a test reaction entry — real reactions will jump straight to your post!",
            removed: false,
            read: false,
            isTest: true,
        });
        this.saveEntries();
        this.updateBadge();
        if (this.panelOpen) this.renderPanelList();
        BdApi.UI.showToast("Added test entry to Reaction Inbox!", { type: "success" });
    }

    getSettingsPanel() {
        const wrap = document.createElement("div");
        wrap.className = "ri-settings";

        const makeToggle = (label, desc, key) => {
            const row = document.createElement("div");
            row.className = "ri-setting-row";

            const info = document.createElement("div");
            info.className = "ri-setting-info";
            const strong = document.createElement("strong");
            strong.textContent = label;
            const span = document.createElement("span");
            span.textContent = desc;
            info.appendChild(strong);
            info.appendChild(span);

            const input = document.createElement("input");
            input.type = "checkbox";
            input.checked = Boolean(this.settings[key]);
            input.addEventListener("change", () => {
                this.settings[key] = input.checked;
                this.saveSettings();
            });

            row.appendChild(info);
            row.appendChild(input);
            return row;
        };

        wrap.appendChild(
            makeToggle(
                "Keep removed reactions",
                'Mark un-reacted emojis with a "Removed" tag instead of deleting them from the list.',
                "keepRemoved"
            )
        );
        wrap.appendChild(
            makeToggle(
                "Include my own reactions",
                "Also log when you react to your own messages (handy for testing).",
                "includeSelf"
            )
        );
        wrap.appendChild(
            makeToggle(
                "Show in-app toast on new reaction",
                "Briefly flash a small toast inside Discord when a reaction comes in.",
                "showInAppToast"
            )
        );

        const syncRow = document.createElement("div");
        syncRow.className = "ri-setting-row";
        const syncInfo = document.createElement("div");
        syncInfo.className = "ri-setting-info";
        syncInfo.innerHTML =
            "<strong>Auto-sync interval (minutes)</strong><span>How often to pull Discord Notification Center in the background (1–60, or 0 for manual only).</span>";
        const syncInput = document.createElement("input");
        syncInput.type = "number";
        syncInput.min = "0";
        syncInput.max = "60";
        syncInput.value = String(this.settings.autoSyncMinutes ?? DEFAULT_SETTINGS.autoSyncMinutes);
        syncInput.addEventListener("change", () => {
            const parsed = parseInt(syncInput.value, 10);
            const v = Number.isNaN(parsed) ? DEFAULT_SETTINGS.autoSyncMinutes : Math.max(0, Math.min(60, parsed));
            syncInput.value = String(v);
            this.settings.autoSyncMinutes = v;
            this.saveSettings();
            this.restartAutoSyncTimer();
        });
        syncRow.appendChild(syncInfo);
        syncRow.appendChild(syncInput);
        wrap.appendChild(syncRow);

        const maxRow = document.createElement("div");
        maxRow.className = "ri-setting-row";
        const maxInfo = document.createElement("div");
        maxInfo.className = "ri-setting-info";
        maxInfo.innerHTML =
            "<strong>Max history entries</strong><span>How many reactions to keep stored locally (20–2000).</span>";
        const maxInput = document.createElement("input");
        maxInput.type = "number";
        maxInput.min = "20";
        maxInput.max = "2000";
        maxInput.value = String(this.settings.maxEntries);
        maxInput.addEventListener("change", () => {
            const v = Math.max(20, Math.min(2000, parseInt(maxInput.value, 10) || DEFAULT_SETTINGS.maxEntries));
            maxInput.value = String(v);
            this.settings.maxEntries = v;
            this.saveSettings();
            this.saveEntries();
        });
        maxRow.appendChild(maxInfo);
        maxRow.appendChild(maxInput);
        wrap.appendChild(maxRow);

        const btnRow = document.createElement("div");
        btnRow.className = "ri-settings-buttons";

        const testBtn = document.createElement("button");
        testBtn.type = "button";
        testBtn.className = "ri-settings-btn";
        testBtn.textContent = "Add Test Reaction";
        testBtn.addEventListener("click", () => this.addTestEntry());

        const openBtn = document.createElement("button");
        openBtn.type = "button";
        openBtn.className = "ri-settings-btn ri-secondary";
        openBtn.textContent = "Open Reaction Inbox";
        openBtn.addEventListener("click", () => this.openPanel());

        btnRow.appendChild(testBtn);
        btnRow.appendChild(openBtn);
        wrap.appendChild(btnRow);

        return wrap;
    }
};
