# Developer Task Tracking Guide

## Problem
The `game-developer` agent sometimes forgets to mark tasks as complete in User Story files during implementation.

## Solutions Implemented

### 1. Enhanced Agent Configuration ✅
**File:** `.bmad-2d-phaser-game-dev/agents/game-developer.md`

Added `checkpoint-enforcement` section to the `task-execution` configuration:

```yaml
task-execution:
  checkpoint-enforcement:
    - 'MANDATORY: After EACH task completion, IMMEDIATELY update story file checkboxes'
    - 'NEVER proceed to next task without marking previous task [x] complete'
    - 'If multiple files changed, update Debug Log before moving on'
    - 'End of session: Review ALL checkboxes match actual completion state'
```

### 2. Updated Checklist ✅
**File:** `.bmad-2d-phaser-game-dev/checklists/game-story-dod-checklist.md`

Added explicit checkpoints for task tracking:
- Task checkboxes must follow proper syntax
- Progress tracking mechanism required in story files

## How to Use

### When Creating Stories (as game-sm)
Ensure each story includes:
- Clear task list with proper checkbox syntax: `[ ]`, `[-]`, `[x]`
- Implementation task section with ordered, trackable tasks
- Debug Log table for tracking changes

### When Implementing Stories (as game-developer)
Follow this workflow:

1. **Start Task:** Mark task with `[-]` in story file
2. **Implement:** Write code, create tests
3. **Complete Task:** Immediately mark with `[x]` in story file
4. **Update Log:** Add entry to Debug Log if multiple files changed
5. **Repeat:** Move to next task

### Checkpoint Reminders

**After EACH task:**
- ✅ Update checkbox in story file
- ✅ Update Debug Log if needed
- ✅ Commit changes if appropriate

**End of session:**
- ✅ Review ALL checkboxes match actual completion
- ✅ Verify story file is up-to-date
- ✅ Update Completion Notes if any deviations

## Additional Tips

### Explicit Reminders
When activating the agent, you can add explicit reminders:

```
As game-developer, implement story X. 
Remember: Update checkboxes [x] after EACH task completion.
```

### Use `*status` Command
The game-developer agent has a `*status` command to show current story progress. Use it periodically:

```
*status
```

### Before Finishing
Always run the story checklist before considering a story complete:

```
*checklist game-story-dod-checklist
```

## Checkbox Syntax Reference

- `[ ]` = Not started
- `[-]` = In progress
- `[x]` = Complete

## Example Story Task Section

```markdown
## Implementation Tasks

### Task 1: Setup Scene Structure
- [x] Create MenuScene.ts file in src/scenes/
- [x] Define MenuScene class extending Phaser.Scene
- [x] Add scene key constant to AssetConfig

### Task 2: Implement UI Elements
- [-] Create title text element with game font
- [ ] Add "Start Game" button with hover effects
- [ ] Add "Settings" button with hover effects
```

## Troubleshooting

**If tasks are still being missed:**
1. Check that AGENTS.md was regenerated with the new configuration
2. Verify the agent is actually loading the updated configuration
3. Add explicit task tracking reminders in your prompts
4. Use the `*status` command frequently during development
5. Set calendar reminders to check story progress regularly

**To regenerate AGENTS.md:**
```bash
npx bmad-method install -f -i codex
```

## Files Modified
- `.bmad-2d-phaser-game-dev/agents/game-developer.md` - Added checkpoint enforcement
- `AGENTS.md` - Regenerated with new agent configuration
- `.bmad-2d-phaser-game-dev/checklists/game-story-dod-checklist.md` - Added task tracking requirements
