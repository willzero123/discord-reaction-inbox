# Reaction Inbox (BetterDiscord Plugin)

An in-app **Reaction Inbox** for Discord desktop that keeps a chronological feed of who reacted—and with which emoji—to your messages across **all servers and DMs**, without needing OS/desktop notifications turned on.

## Features

- **Native Discord Inbox UI:** Adds a smiley button right next to Discord's top-bar **Inbox** button with an unread counter badge and native reply-spine cards (`your message` on top, reactor avatar/name/timestamp and reaction pill below).
- **Works Everywhere (Including Muted & 100k+ Member Servers):**
  - Captures live reactions in real time (`MESSAGE_REACTION_ADD` and batched `MESSAGE_REACTION_ADD_MANY`).
  - Periodically syncs Discord's Notification Center and tracks your recent posts (last 7 days) so reactions in muted or massive lazy-loaded servers still show up.
- **Native Emotes & Hover Previews:** Renders standard emojis using Discord's native Twemoji SVGs (plus custom & animated server emotes). Hovering any reaction pill opens a `48×48` preview card with `:emote_name: reacted by User`.
- **Click-to-Jump:** Click any card to jump directly to your message across servers, channels, and DMs, or use the header buttons to copy the message link or dismiss the item.
- **Auto-Loaded Message Context:** Automatically fetches message text in the background for older/uncached posts (including attachments, forwards, embeds, stickers, and polls).
- **Filtering & Shortcuts:**
  - Filter by **All**, **Servers**, or **DMs**.
  - Click the search icon (or press `Ctrl+F` while open) to filter by person, server, channel, emoji, or message text.
  - Toggle the inbox anytime with `Alt+Shift+E`.
- **Sorted by Reaction Time:** New reactions always rise to the top in the order they happened, and history persists locally across Discord restarts.

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

- **Keep removed reactions:** Mark un-reacted emojis with a `Removed` tag instead of deleting them.
- **Include my own reactions:** Log your own reactions (useful for testing).
- **Show in-app toast on new reaction:** Flash a small in-app toast inside Discord when a new reaction arrives.
- **Auto-sync interval (minutes):** Background sync frequency (`1–60`, or `0` for manual sync only).
- **Max history entries:** Number of reactions retained locally (`20–2000`).

## Notes

- All history is stored locally in BetterDiscord's plugin data (`ReactionInbox.config.json`) and never leaves your machine.
- BetterDiscord is an unofficial third-party modification to Discord; use at your own discretion.

## License

[MIT](LICENSE)
