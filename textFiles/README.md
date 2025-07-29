
## Overview

Fortuna Chess is a web-based chess experience that reimagines the classic game with a twist.

🔲 Classic Mode
Play traditional chess on a familiar 8×8 board with standard rules — perfect for purists or warm-up games.

🎲 Fortuna Mode
Unleash chaos and creativity in Fortuna Mode, where each side fields a set of special fantasy-themed pieces.

Every unit can have unique abilities with cooldowns, charges, and effects, transforming the battlefield into a dynamic strategy game.


## Getting Started

🕹️ How to Run the Game
The game is completely web-based — no downloads or setup required beyond your browser.

Option 1: Open Locally
Clone or download the project files.

Open index.html in any modern browser (Chrome recommended).

Click “Start Game” to choose between Classic or Fortuna mode.

Option 2: Using Live Server (for developers)
Open the project folder in VS Code.

Install the Live Server extension if you haven't.

Right-click index.html → “Open with Live Server”.

The game will launch in your browser with live reloading enabled.


## 📦 Tech Stack

HTML/CSS/JavaScript (Vanilla JS)

DOM-based piece rendering and event handling

Modular game logic for abilities and turn control



## MODES

## Classic Mode

A straightforward, rules-accurate game of chess — no new pieces, no surprises. Just strategy. 8x8 board.

## Fortuna Mode

Fortuna Mode is a chaotic twist on traditional chess where pieces are imbued with **special abilities**. Each side controls a set of **unique units** capable of powerful, unpredictable actions — teleportation, resurrection, explosions, and more.

## Set up

The board has a default set-up which may be modiifed in the app.js file. The user does not need to do anything to set-up the game after loading it locally.

## Ability Usage

Each piece has a unique ability.

Abilities are casted by CLICKING on a piece and then PRESSING the 'A' key
EVOLVED Abilities are casted by CLICKING on a piece and then PRESSING the 'Q' key
ULTIMATE Abilities are casted by CLICKING on a piece and then PRESSING the 'U' key

ABILITY DESCRIPTIONS will be shown later.

## Dynamic Board

The board may experience changes as a result of piece abilities or turn-based environmental effects.

There are different tiles that have specific traits that can be used in a strategic manner.

## Turn & Game Flow

Players still take alternating turns, still starting with white's move first.
Instead of moving a piece, a player may decide to use an ability instead
You cannot use an ability and move a piece in the same turn
Both abilities and movement are very important, so be strategic and don't waste turns!

## End Goal

Unlike basic chess, there is no king! Just have fun and try to eliminate all enemy pieces in the most stylish and satisfying fashion possible. Treat this mode as somewhat of a sandbox, the possibilities are endless!

## Strategy

Positioning -> Decide when to group versus separate your pieces, as some abilities work well together in vicinity

Use turns wisely -> Abilities are very powerful, but are powerless unless used alongside piece movement. Control the board, not just material

Board changes -> Board changes completely shake up the game, so anticipate them and play around potential environmental obstacles

Make sacrifices -> You can't win every interaction. Sometimes losing a piece to prevent further loss is the right move.

## Future Additions

- AI opponent in classic mode
- Online multiplayer
- Sound effects and music
- More unique abilities and implementation of new pieces
- Customizable set-ups and board layouts
- Give abilities more depth, work with charges, cooldowns, etc...

## Credits

Created by Ethan Gu. Inspired by classic chess and luck-based RPG mechanics.