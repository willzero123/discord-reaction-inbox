# Reaction Inbox (BetterDiscord Plugin)

An in-app **Reaction Inbox** for Discord desktop that keeps a chronological feed of who reacted—and with which emoji—to your messages across **servers and DMs**, without needing OS/desktop notifications turned on.

## Features

- **Native Discord Inbox UI:** Adds a smiley button right next to Discord's top-bar **Inbox** button with an unread counter badge and native reply-spine cards (`your message` on top, reactor avatar/name/timestamp and reaction pill below).
- **Works Across Muted & Large Servers:**
  - Captures live reactions in real time (`MESSAGE_REACTION_ADD` and batched `MESSAGE_REACTION_ADD_MANY`).
  - Periodically syncs Discord's Notification Center (unmuted servers & DMs) and tracks up to **100** of your recent posts from the last **7 days** (from channels you post in or visit while the plugin is running), checking up to the **12** most recently active channels per sync so reactions in muted or 100k+ member servers still show up.
- **Native Emotes & Hover Previews:** Renders standard emojis using Discord's native Twemoji SVGs (falling back to `jdecked/twemoji` SVGs via jsDelivr if needed), plus custom and animated server emotes. Hovering any reaction pill opens a `48×48` preview card with `:emote_name: reacted by User`.
- **Click-to-Jump:** Click any card to jump directly to your message across servers, channels, and DMs, or use the card header buttons to copy the message link or dismiss the item.
- **Auto-Loaded Message Context:** Automatically fetches message text in the background for older/uncached posts (including attachments, forwards, embeds, stickers, and polls).
- **Filtering & Shortcuts:**
  - Filter by **All**, **Servers**, or **DMs**.
  - Click the search icon (or press `Ctrl+F` / `Cmd+F` while open) to filter by person, server, channel, emoji, or message text.
  - Toggle the inbox anytime with `Alt+Shift+E`.
- **Sorted by Reaction Time:** Live reactions and Notification Center items use exact reaction timestamps; newly polled reactions on tracked posts use the time they were detected (within the sync interval); and a post's first historical backfill uses an approximate (`~`) timestamp anchored to the post time since Discord's API does not return past reaction timestamps.

## Installation

1. Install [BetterDiscord](https://betterdiscord.app/) if you don't already have it.
2. Download [`ReactionInbox.plugin.js`](https://raw.githubusercontent.com/willzero123/discord-reaction-inbox/main/ReactionInbox.plugin.js) (right-click → **Save Link As...**).
3. Move `ReactionInbox.plugin.js` into your BetterDiscord plugins folder:
   - **Windows:** `%AppData%\BetterDiscord\plugins`
   - **macOS:** `~/Library/Application Support/BetterDiscord/plugins`
   - **Linux:** `~/.config/BetterDiscord/plugins`
4. Open **Discord Settings → BetterDiscord → Plugins** and enable **ReactionInbox**.

## Settings

Click the gear icon next to **ReactionInbox** in BetterDiscord's Plugins list to configure:

- **Keep removed reactions** *(default: on)*: When someone un-reacts to your message while Discord is open, dim the card and show a `Removed` tag instead of deleting it from the list (does not retroactively detect un-reactions while offline).
- **Include my own reactions** *(default: off)*: Also log when you react to your own messages (useful for testing).
- **Show in-app toast on new reaction** *(default: off)*: Flash a small in-app toast inside Discord when a new live reaction arrives.
- **Auto-sync interval (minutes)** *(default: `2`)*: How often to sync Discord's Notification Center and tracked recent posts in the background (`1–60`, or `0` for manual sync only).
- **Max history entries** *(default: `250`)*: Maximum number of reaction entries retained locally (`20–2000`).

## Notes

- Your reaction history is stored locally in BetterDiscord's plugin data (`ReactionInbox.config.json`) and is never sent to any third-party service.
- Background sync and message-context loading make standard Discord API requests through your active Discord client session; standard emoji SVGs fall back to jsDelivr (`cdn.jsdelivr.net/gh/jdecked/twemoji`) only if Discord's built-in Twemoji helper isn't available.
- BetterDiscord is an unofficial third-party modification to Discord; use at your own discretion.

## License

[MIT](LICENSE)
