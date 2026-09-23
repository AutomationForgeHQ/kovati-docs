# MotionForge capture review

Captured from Colony_NP24 on 23 September 2026. Kovati_DEMO was closed normally first. No generation, runner startup, rental, key change, import or asset edit was requested. Only existing assets and read-only panels were opened; window sizes and panel expansion were adjusted.

## Captures

- `get-started.png` — index, under The loop. The complete setup page shows the step-2 refusal and disabled Create and open.
- `takes.png` — concepts, Takes. Existing MD_WalksForwardStopsWaves shows Astronaut and two cached takes with provenance columns.
- `generate.png` — index, What the price means. Same definition, expanded generation controls and the unpressed local-runner action.
- `kimodo-runner.png` — providers, Setup. The actual stopped-container and unchecked-access state.
- `prompt-track.png` — sequencer, Motion Prompt Track. Existing LS_MD_PromptTrackCheck, three beats. Long section labels are truncated by the editor; a full-size image link accompanies the figure.

## Differences and limitations to review

- `index.mdx`, What the price means, describes a price on the definition window's button. In the Kimodo Generate panel captured here, the button says **Start the Kimodo runner, then generate 2**; **2 takes on Kimodo (local): free, runs on this machine** is beside it. No explanation has been inferred and the existing prose is unchanged.
- `providers.mdx`, Setup, says **Llama 3 access is measured too** and describes the answer being shown. The Kimodo Runner panel currently says **not checked yet - a token alone installs fine and fails later**, with a **Check** link. This captures an unchecked state, not evidence that the documented check is unavailable. No access check was triggered.
- The Uthana examples checked for a paid-button capture were blocked by **RetargetIncomplete**. Their character setup was left alone. The Generate screenshot therefore shows local/free cost, not a numeric paid price.
- Older MD_PromptTrackCheck take rows display dashes in provenance columns. The Takes capture uses the newer MD_WalksForwardStopsWaves, which has populated fields; no missing history was invented or repaired.

No unsafe controls were pressed. In particular: Generate, Create and open, Start, Rebuild, Upload again, Import directly, Choose and import, Delete and other destructive controls were left alone. No keyboard input was sent to Unreal.

Every saved image was rendered by tools/capture-window.ps1 from one target window handle. One incomplete editor-window render was overwritten with a verified capture. No image in this set contained another application, and no privacy-contaminated image required deletion.

## Captions

- index.mdx — /shots/motionforge/get-started.png: The refusal names the step to fix: choose a character that suits the provider in step 2. A ready provider does not mean its clips can reach the game's skeleton.

- index.mdx — /shots/motionforge/generate.png: Read the cost beside the action: these two takes would run free on this machine. The stopped runner changes the button to 'Start the Kimodo runner, then generate 2'; this capture leaves it unpressed.

- concepts.mdx — /shots/motionforge/takes.png: Take 1 is already in the game; Take 2 remains ready on disk. The numbered rows keep the model, seed, length and cost beside each result, while the stage lets you review the motion before choosing a replacement.

- providers.mdx — /shots/motionforge/kimodo-runner.png: Docker running, a runner image and a stored token are separate facts. Here the container is stopped and Llama 3 access is 'not checked yet' — the panel does not present a stored token as proof of access.

- sequencer.mdx — /shots/motionforge/prompt-track.png: Raise the arm, hold it, then lower it: three beats occupy separate sections on the same timeline as the imported clip. Their boundaries preserve where each action belongs in time.

## Verification

The production build and internal-link check passed. All five images loaded at their recorded dimensions in the static preview. Window-handle captures of the preview were used to check page-width rendering. The Sequencer image retains the editor's truncated long section labels; its caption spells out the three beats and provides a full-size link.

During preview checking, one browser capture reported a different documentation page title from the intended page. That temporary image was deleted without opening it. It was never added to the site. Subsequent captures required an exact page-title match.