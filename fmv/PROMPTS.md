# Prompts for realistic cutscene footage

Paste these into an AI image generator (for stills) or an image-to-video / text-to-video tool (for clips).
Save each result in this folder under the file name shown, and the game picks it up automatically.

**Style line.** Add this to every prompt so the cast matches:

> Late-1990s live-action FMV cutscene in the style of Command & Conquer: Red Alert 2. A real actor filmed on a lit studio set, photorealistic, medium close-up of head and shoulders, looking just off camera as if briefing the viewer. Strong coloured rim light, dark command-centre background with glowing screens slightly out of focus, subtle video softness and film grain, 16:9.

**Tips**
- Generate one still per character first and pick the best.
- For video, use image-to-video from that still, so the face stays the same.
- Ask for "talking, small natural head movement, 5–8 seconds, loopable".
- These are fictional characters. Don't use a real person's likeness.

## Cast

The bundled portraits (`fmv/<id>.webp`) come from `fmv/source/cast-sheet.jpg`.
`scripts/fmv_portraits.py` cuts them out and grades them. Keep new footage consistent with these looks:
a clean ink-outlined illustration, dark sci-fi command room, and faction insignia.

| File | Character | Look |
|---|---|---|
| `reyes.*` | Col. Ada Reyes — Vanguard commander | A woman in her 50s, weathered face, short brown hair, stern grey eyes. Navy undershirt, olive plate carrier with a name tape, blue Vanguard chevron patch on the shoulder. |
| `hale.*` | Lt. Marcus Hale — Vanguard field officer | A young man, tanned, short brown hair. Grey armour plate over a navy undershirt, blue Vanguard chevron shoulder patch. |
| `ghost.*` | Ghost — Vanguard commando | A woman in her 30s, blonde hair tied back, blue-grey eyes, calm. Olive tactical vest over a black undershirt, blue chevron patch. |
| `draganov.*` | Marshal Draganov — Legion supreme commander | A man in his 60s, grey swept-back hair, heavy brows, hard stare. Olive field jacket and vest, red collar tabs with gold stars, medal ribbons, red Legion star shield. |
| `volkova.*` | Commissar Volkova — Legion political officer | A woman in her 30s, black hair pulled back, sharp features. Khaki armour, red collar tabs with gold stars, red star shoulder shield. |
| `bogdan.*` | Chief Engineer Bogdan — Legion engineer | A rugged man in his 40s, short beard, scarred brow. Grey armour, red collar tabs, red Legion star shield on the chest. |
| `reaper.*` | Reaper — Legion commando | A square-jawed man in his 30s, dark cropped hair, cold eyes. Olive field jacket with pouches, red collar tabs, red star shoulder patch. |
| `voice.*` | The Voice — the Syndicate hive-mind | A tall ridged alien head, grey-violet chitin, narrow glowing violet eyes, no hair, an organic armoured body. |
| `senna.*` | Adept Senna — Syndicate hybrid clone | A human woman's face in a violet hood that grows into organic spines, with dark hive veins across the cheeks. |
| `phantom.*` | Phantom — Syndicate infiltrator grown from Ghost's DNA | A smooth chrome-violet synthetic face with glowing white-violet eyes, in iridescent armour. |

Dr. Elias Marsh is only heard, in archive footage, so he needs no portrait.

## Scenes

The **Style line** for scenes is: *"cinematic still from a late-1990s CGI/live-action game cutscene, Red Alert 2 style, dramatic lighting, 16:9"*.

Shots marked "drawn by the game" are titles and animated maps, and are best left as they are.
The close-up shots use the character files above.

### The Iron Frontier (`prologue`)

| File | Shot | Line |
|---|---|---|
| `prologue_00` | _drawn by the game — leave empty_ |  |
| `prologue_01` | _drawn by the game — leave empty_ | In this history the Cold War never ended. It ran out of oil — and the East answered the resource war with numbers. |
| `prologue_02` | Endless ranks of eastern-bloc infantry in greatcoats and steel helmets marching past red banners, searchlights crossing a smoky red sky. | The Legion. Millions of soldiers and endless armour, pouring west across the Frontier. |
| `prologue_03` | Dusk battlefield on open plains: a line of main battle tanks firing, muzzle flashes, explosions, smoke columns against an orange sky. | The Western Vanguard could not match them. City by city, the West fell back. |
| `prologue_04` | Archive footage of the Starfall lab (Marsh speaking off-screen) | There is something out past Jupiter. Mass, metal — and structure. It is not natural. And we can bring it down. |
| `prologue_05` | A dark, jagged meteor streaked with glowing violet veins drifting toward Earth, seen from orbit with the planet's blue limb below, stars, cinematic. | Project Starfall. A last gamble: catch a wandering meteor, and use whatever was inside it to turn the tide. |
| `prologue_06` | Dusk over a snowy mountain range; a huge burning meteor streaks down trailing fire and smoke and strikes the horizon in a blinding flash. | On the fourteenth of April, they brought it down on the Frontier. |
| `prologue_07` | Night, a vast ice crater lit by sweeping military floodlights; scaffolding surrounds a dark glowing meteorite fragment; tiny figures in cold-weather gear at the rim. | At Site Nine they cut the Fragment out of the ice. It was warm. It was growing. |
| `prologue_08` | A 1990s military research lab: a glass containment cylinder holding a glowing violet meteor shard, CRT monitors on both sides filling with alien glyphs, cables pulsing with light, red alarm lights. | It did not wait to be studied. It reached into their computers. It learned. And then it let itself out. |
| `prologue_09` | Night, a vast ice crater lit by sweeping military floodlights; scaffolding surrounds a dark glowing meteorite fragment; tiny figures in cold-weather gear at the rim. Red alarm lights, violet tendrils bursting from the fragment. | Containment failed in eleven minutes. Nobody who was inside that night came out as themselves. |
| `prologue_10` | Close-up of a glowing DNA double helix on a lab monitor, blue strands turning violet from left to right, clinical readout text, dark room. | It had found the one thing it lacked — a body that could live here. It cloned the Vanguard's own DNA, and folded it into the hive. |
| `prologue_11` | A long dim corridor of glass cloning vats filled with violet fluid, each holding a sleeping humanoid figure; one opens glowing violet eyes. | They call themselves the Syndicate. They wear our faces now. They think as one. |
| `prologue_12` | _drawn by the game — leave empty_ | Three powers now fight over what is left. The Legion. The Vanguard. And the hive the Vanguard made. |
| `prologue_13` | _drawn by the game — leave empty_ |  |

### Operation Clean Slate (`allied_intro`)

| File | Shot | Line |
|---|---|---|
| `allied_intro_00` | _drawn by the game — leave empty_ |  |
| `allied_intro_01` | Close-up of **reyes** (use `fmv/reyes.*`) | I was at Site Nine the night it broke out. I signed the order that brought that rock down. |
| `allied_intro_02` | Night, a vast ice crater lit by sweeping military floodlights; scaffolding surrounds a dark glowing meteorite fragment; tiny figures in cold-weather gear at the rim. Red alarm lights, violet tendrils bursting from the fragment. | We wanted a weapon to stop the Legion. We opened a door instead. |
| `allied_intro_03` | _drawn by the game — leave empty_ | Now the Legion holds half the Frontier, and the Syndicate grows in every gap between us. |
| `allied_intro_04` | Close-up of **hale** (use `fmv/hale.*`) | Battlegroup's fuelled and ready, Colonel. Say the word. |
| `allied_intro_05` | Dusk battlefield on open plains: a line of main battle tanks firing, muzzle flashes, explosions, smoke columns against an orange sky. | First we take our land back from the Legion. Then we clean up our own mess. |
| `allied_intro_06` | _drawn by the game — leave empty_ |  |

### The Marsh Tapes (`allied_reveal`)

| File | Shot | Line |
|---|---|---|
| `allied_reveal_00` | Close-up of **hale** (use `fmv/hale.*`) | Ma'am. We recovered the Site Nine archive. You need to see this. |
| `allied_reveal_01` | A 1990s military research lab: a glass containment cylinder holding a glowing violet meteor shard, CRT monitors on both sides filling with alien glyphs, cables pulsing with light, red alarm lights. | It is talking to the network. It is asking questions — about us. Reyes, shut it down. Shut it — |
| `allied_reveal_02` | Extreme close-up of an inhuman violet eye with a slit pupil and glowing iris fibres, veins around it, dark background. | Elias Marsh was very helpful. He is part of us now, Colonel. So are you, a little. |
| `allied_reveal_03` | Close-up of **reyes** (use `fmv/reyes.*`) | That's Marsh's voice. God help us — it's wearing him. |
| `allied_reveal_04` | _drawn by the game — leave empty_ |  |

### Clean Slate (`allied_end`)

| File | Shot | Line |
|---|---|---|
| `allied_end_00` | A ruined city skyline at dusk, fires burning between broken towers, smoke drifting, aircraft silhouettes overhead. Calm dawn light, fires out. | The Grand Crossing fell silent at dawn. For the first time in twelve years, the Frontier's guns stopped. |
| `allied_end_01` | _drawn by the game — leave empty_ | The Syndicate's grip is broken. The Legion is going home. |
| `allied_end_02` | Close-up of **reyes** (use `fmv/reyes.*`) | Starfall was our mistake. Clean Slate is how we answer for it. |
| `allied_end_03` | Close-up of **hale** (use `fmv/hale.*`) | And the thing in the ice, ma'am? |
| `allied_end_04` | Extreme close-up of an inhuman violet eye with a slit pupil and glowing iris fibres, veins around it, dark background. | We are patient. We fell a very long way to get here. |
| `allied_end_05` | _drawn by the game — leave empty_ |  |

### Iron Reclamation (`soviet_intro`)

| File | Shot | Line |
|---|---|---|
| `soviet_intro_00` | _drawn by the game — leave empty_ |  |
| `soviet_intro_01` | Endless ranks of eastern-bloc infantry in greatcoats and steel helmets marching past red banners, searchlights crossing a smoky red sky. | For ten years the Legion marched west, and the West could not stop us. So they reached into the sky. |
| `soviet_intro_02` | Dusk over a snowy mountain range; a huge burning meteor streaks down trailing fire and smoke and strikes the horizon in a blinding flash. | Their star fell on the Frontier. And something climbed out of it. |
| `soviet_intro_03` | Close-up of **volkova** (use `fmv/volkova.*`) | Now it wears Western faces and whispers in our soldiers' heads. It must be burned out, Marshal. |
| `soviet_intro_04` | Close-up of **draganov** (use `fmv/draganov.*`) | The Frontier is ours by blood. Iron Reclamation begins today. |
| `soviet_intro_05` | Dusk battlefield on open plains: a line of main battle tanks firing, muzzle flashes, explosions, smoke columns against an orange sky. | Tanks are fuelled, guns are loaded, and I only had to hit three of them with a spanner. |
| `soviet_intro_06` | _drawn by the game — leave empty_ |  |

### The Marshal's Voices (`soviet_reveal`)

| File | Shot | Line |
|---|---|---|
| `soviet_reveal_00` | Close-up of **volkova** (use `fmv/volkova.*`) | Marshal. The medical scans came back. There is Syndicate tissue at the base of your skull. |
| `soviet_reveal_01` | Close-up of a glowing DNA double helix on a lab monitor, blue strands turning violet from left to right, clinical readout text, dark room. | Donor match: Legion. The hive had learned a second recipe. |
| `soviet_reveal_02` | Extreme close-up of an inhuman violet eye with a slit pupil and glowing iris fibres, veins around it, dark background. | He invited us in, Commissar. Every order he gave these last months — we gave. |
| `soviet_reveal_03` | Close-up of **draganov** (use `fmv/draganov.*`) | Then cut it out of me. And give me something to burn. |
| `soviet_reveal_04` | _drawn by the game — leave empty_ |  |

### Iron Reclamation (`soviet_end`)

| File | Shot | Line |
|---|---|---|
| `soviet_end_00` | Endless ranks of eastern-bloc infantry in greatcoats and steel helmets marching past red banners, searchlights crossing a smoky red sky. | The Legion held the Frontier from the eastern steppe to the Kessel River. |
| `soviet_end_01` | _drawn by the game — leave empty_ | The hive is broken. Its nests are burning. |
| `soviet_end_02` | Close-up of **draganov** (use `fmv/draganov.*`) | For the first time in a year, my head is quiet. I had forgotten what my own thoughts sound like. |
| `soviet_end_03` | Extreme close-up of an inhuman violet eye with a slit pupil and glowing iris fibres, veins around it, dark background. | Quiet is only the space between words, Marshal. |
| `soviet_end_04` | _drawn by the game — leave empty_ |  |

### The Harvest (`yuri_intro`)

| File | Shot | Line |
|---|---|---|
| `yuri_intro_00` | _drawn by the game — leave empty_ |  |
| `yuri_intro_01` | A dark, jagged meteor streaked with glowing violet veins drifting toward Earth, seen from orbit with the planet's blue limb below, stars, cinematic. | We fell for a very long time. It was cold between the stars. |
| `yuri_intro_02` | A 1990s military research lab: a glass containment cylinder holding a glowing violet meteor shard, CRT monitors on both sides filling with alien glyphs, cables pulsing with light, red alarm lights. | They pulled us out of the ice and asked us what we were. So we asked their machines the same question. The machines answered. |
| `yuri_intro_03` | A long dim corridor of glass cloning vats filled with violet fluid, each holding a sleeping humanoid figure; one opens glowing violet eyes. | I remember being someone else. A soldier. Now I remember everything all of us remember. |
| `yuri_intro_04` | Close-up of **voice** (use `fmv/voice.*`) | Wake, Adept. The Frontier is loud with small minds. Let us make it quiet. |
| `yuri_intro_05` | _drawn by the game — leave empty_ |  |

### The Copy (`yuri_reveal`)

| File | Shot | Line |
|---|---|---|
| `yuri_reveal_00` | A long dim corridor of glass cloning vats filled with violet fluid, each holding a sleeping humanoid figure; one opens glowing violet eyes. | Their finest soldier bled on Site Nine's floor the night we woke. We kept what she left. |
| `yuri_reveal_01` | Close-up of a glowing DNA double helix on a lab monitor, blue strands turning violet from left to right, clinical readout text, dark room. | Donor: Vanguard special operations. Codename: Ghost. |
| `yuri_reveal_02` | Close-up of **phantom** (use `fmv/phantom.*`) | Her face. Her hands. Her aim. Your Ghost never knew there was a copy. |
| `yuri_reveal_03` | _drawn by the game — leave empty_ |  |

### One Mind (`yuri_end`)

| File | Shot | Line |
|---|---|---|
| `yuri_end_00` | A ruined city skyline at dusk, fires burning between broken towers, smoke drifting, aircraft silhouettes overhead. Violet organic growth climbing the buildings. | The Iron Ring fell in a single night. By morning, the Frontier had stopped fighting. |
| `yuri_end_01` | _drawn by the game — leave empty_ | Every city. Every radio. Every mind. One song. |
| `yuri_end_02` | Extreme close-up of an inhuman violet eye with a slit pupil and glowing iris fibres, veins around it, dark background. | We fell a very long way to find a home. Now we are home. |
| `yuri_end_03` | _drawn by the game — leave empty_ |  |
