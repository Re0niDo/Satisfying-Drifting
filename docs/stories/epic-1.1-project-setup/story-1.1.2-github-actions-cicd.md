# Story: GitHub Actions CI/CD Workflow Setup

**Epic:** Epic 1.1: Project Setup & Configuration  
**Story ID:** 1.1.2  
**Priority:** High  
**Points:** 3  
**Status:** Ready for Development

---

## Description

Set up automated Continuous Integration and Continuous Deployment (CI/CD) pipeline using GitHub Actions to automatically build and deploy the Satisfying Drifting game to GitHub Pages whenever code is pushed to the main branch. This ensures that every commit results in a deployed, testable version of the game without manual intervention.

The workflow will handle dependency installation, TypeScript compilation, production build generation, and deployment to GitHub Pages using the modern artifact-based deployment method (no gh-pages branch required).

**GDD Reference:** Development Strategy - Phase 1: Foundation  
**Architecture Reference:** Deployment Architecture, Deployment Strategy

---

## Acceptance Criteria

### Functional Requirements

- [ ] GitHub Actions workflow file created at `.github/workflows/deploy.yml`
- [ ] Workflow triggers automatically on push to `main` branch
- [ ] Workflow can be manually triggered via `workflow_dispatch`
- [ ] Build job installs dependencies using `npm ci` with caching
- [ ] Build job runs TypeScript compilation and Vite build
- [ ] Build artifacts uploaded to GitHub Pages via artifact upload
- [ ] Deploy job deploys artifacts to GitHub Pages environment
- [ ] Successful deployment URL is visible in GitHub Actions output
- [ ] Failed builds prevent deployment (build errors block deploy job)

### Technical Requirements

- [ ] Workflow uses latest stable GitHub Actions versions (`actions/checkout@v5`, `actions/configure-pages@v5`, `actions/upload-pages-artifact@v4`, `actions/deploy-pages@v4`)
- [ ] Node.js 18 configured for build environment
- [ ] npm caching enabled to speed up subsequent builds
- [ ] Proper permissions configured (contents: read, pages: write, id-token: write)
- [ ] Concurrency control prevents multiple simultaneous deployments
- [ ] Build completes in < 3 minutes on GitHub Actions runners
- [ ] No secrets or environment variables required (static site)

### Configuration Requirements

- [ ] GitHub Pages enabled in repository settings
- [ ] Pages source set to "GitHub Actions" (not gh-pages branch)
- [ ] Repository base path matches Vite configuration (`/Satisfying-Drifting/`)
- [ ] Build status badge added to README.md
- [ ] Deployment environment configured with Pages URL

---

## Technical Specifications

### Files to Create/Modify

**New Files:**

- `.github/workflows/deploy.yml` - Main CI/CD workflow for build and deploy
- `.github/workflows/ci.yml` - Optional: separate CI workflow for PR validation (future)

**Modified Files:**

- `README.md` - Add build status badge and deployment instructions
- `package.json` - Ensure scripts are configured correctly (already done in Story 1.1.1)

### GitHub Actions Workflow Definition

```yaml
# .github/workflows/deploy.yml
name: Build and Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v5
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run TypeScript compilation
        run: npx tsc --noEmit
      
      - name: Build game
        run: npm run build
      
      - name: Setup GitHub Pages
        uses: actions/configure-pages@v5
      
      - name: Upload build artifact
        uses: actions/upload-pages-artifact@v4
        with:
          path: './dist'
  
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### README.md Updates

Add build status badge and deployment information:

```markdown
# Satisfying Drifting

[![Build and Deploy](https://github.com/Re0niDo/Satisfying-Drifting/actions/workflows/deploy.yml/badge.svg)](https://github.com/Re0niDo/Satisfying-Drifting/actions/workflows/deploy.yml)

A 2D drift racing game built with Phaser 3 and TypeScript.

## 🎮 Play Now

**Live Demo:** [https://re0nido.github.io/Satisfying-Drifting/](https://re0nido.github.io/Satisfying-Drifting/)

The game is automatically deployed to GitHub Pages on every commit to the main branch.

## 🚀 Development

### Setup
\`\`\`bash
npm install
\`\`\`

### Run Development Server
\`\`\`bash
npm run dev
\`\`\`

### Build for Production
\`\`\`bash
npm run build
\`\`\`

### Preview Production Build
\`\`\`bash
npm run preview
\`\`\`

## 📦 Deployment

The game is automatically deployed via GitHub Actions:
1. Push to `main` branch triggers the workflow
2. GitHub Actions builds the game
3. Artifact is uploaded to GitHub Pages
4. Game is live at the URL above

Manual deployment: Go to Actions → Build and Deploy → Run workflow
```

### GitHub Repository Settings Configuration

**Pages Configuration:**
1. Go to repository Settings → Pages
2. Under "Build and deployment":
   - Source: **GitHub Actions** (not "Deploy from a branch")
3. No custom domain needed (uses default github.io URL)
4. HTTPS enforcement: Enabled (automatic)

**Environment Configuration:**
1. Settings → Environments → github-pages
2. Deployment branches: Only `main` branch
3. Required reviewers: None (automatic deployment)
4. Environment secrets: None required

### Integration Points

**Build System Integration:**
- Workflow uses npm scripts defined in `package.json` (Story 1.1.1)
- TypeScript compilation runs before build to catch type errors
- Vite build generates optimized production bundle in `dist/`
- Base path configured in `vite.config.ts` matches repository name

**Future Integration:**
- PR validation workflow can be added later (run tests, linting)
- Can add deployment previews for PRs using Netlify/Vercel
- Performance budgets can be enforced in CI (bundle size checks)
- Automated lighthouse scoring for performance monitoring

**Workflow Dependencies:**
- Requires Node.js 18+ (setup-node@v4)
- Requires npm lockfile (package-lock.json) for `npm ci`
- Requires dist/ folder generated by Vite build
- Requires GitHub Pages to be enabled in repository settings

---

## Implementation Tasks

### Dev Agent Record

**Tasks:**

- [ ] Create `.github/workflows/` directory
- [ ] Create `deploy.yml` workflow file with build and deploy jobs
- [ ] Configure workflow triggers (push to main, workflow_dispatch)
- [ ] Set up proper permissions (contents: read, pages: write, id-token: write)
- [ ] Add concurrency control to prevent race conditions
- [ ] Configure build job with checkout, Node.js setup, npm caching
- [ ] Add TypeScript compilation step to catch type errors before build
- [ ] Add Vite build step (`npm run build`)
- [ ] Configure Pages setup action (actions/configure-pages@v5)
- [ ] Add artifact upload step (actions/upload-pages-artifact@v4)
- [ ] Configure deploy job with environment and artifact deployment
- [ ] Add deployment step (actions/deploy-pages@v4)
- [ ] Test workflow by pushing to main branch
- [ ] Verify build completes successfully in GitHub Actions UI
- [ ] Verify deployment succeeds and game is accessible at Pages URL
- [ ] Enable GitHub Pages in repository settings (set source to "GitHub Actions")
- [ ] Update README.md with build status badge
- [ ] Add deployment instructions to README.md
- [ ] Add live demo URL to README.md
- [ ] Verify badge displays correct build status
- [ ] Document manual workflow trigger process in README
- [ ] Commit and push all changes to test full workflow

**Debug Log:**
| Task | File | Change | Reverted? |
|------|------|--------|-----------|
| | | | |

**Completion Notes:**

<!-- Only note deviations from requirements, keep under 50 words -->

**Change Log:**

<!-- Only requirement changes during implementation -->

---

## Game Design Context

**GDD Reference:** Development Strategy - Phase 1: Foundation (Weeks 1-2)

**Game Mechanic:** None (infrastructure story)

**Player Experience Goal:** Players can always access the latest version of the game at a stable URL without manual deployment steps

**Architecture Alignment:**
This story implements the Deployment Strategy section of the Architecture Document:
- Automated build & deploy via GitHub Actions
- No manual dist management (build happens in CI)
- CDN for assets via GitHub Pages
- HTTPS enforced for Web Audio API compatibility

---

## Testing Requirements

### Integration Tests

**Manual Test Cases:**

1. **Workflow Trigger on Push**
   - Make a small change to README.md
   - Commit and push to main branch
   - Expected: Workflow triggers automatically within 30 seconds
   - Verification: Check Actions tab for running workflow

2. **Build Job Success**
   - Monitor workflow execution in Actions tab
   - Expected: Build job completes successfully in < 3 minutes
   - Verification: Green checkmark on build job, no errors in logs

3. **TypeScript Compilation Check**
   - Create a temporary branch and introduce an intentional TypeScript error in `src/main.ts`
   - Push the branch or trigger the workflow manually against the branch (avoid pushing broken code to `main`)
   - Expected: Build job fails during TypeScript compilation step
   - Verification: Red X on workflow, error visible in logs
   - Cleanup: Remove the error before merging; delete the temporary branch when finished

4. **Deployment Success**
   - After successful build, monitor deploy job
   - Expected: Deploy job completes successfully
   - Verification: Green checkmark on deploy job, deployment URL shown

5. **Game Accessibility**
   - Open deployed URL in browser: `https://re0nido.github.io/Satisfying-Drifting/`
   - Expected: Game loads successfully, Phaser canvas visible
   - Performance: Page loads in < 3 seconds
   - Verification: No console errors, game initializes correctly

6. **Manual Workflow Dispatch**
   - Go to Actions → Build and Deploy → Run workflow
   - Select main branch, click "Run workflow"
   - Expected: Workflow triggers manually
   - Verification: New workflow run appears in history

7. **Build Status Badge**
   - View README.md on GitHub repository homepage
   - Expected: Build status badge displays "passing" (green)
   - Click badge to verify it links to Actions workflow

8. **Concurrency Control**
   - Push two commits in quick succession
   - Expected: Second workflow waits for first to complete
   - Verification: Only one deployment active at a time

### Performance Tests

**Metrics to Verify:**
- Build job completes in < 3 minutes on GitHub Actions runners
- npm ci with caching completes in < 30 seconds (after first run)
- TypeScript compilation completes in < 10 seconds
- Vite production build completes in < 45 seconds
- Artifact upload completes in < 30 seconds
- Deployment completes in < 1 minute
- Total workflow time (build + deploy) < 5 minutes

---

## Dependencies

**Story Dependencies:**
- Story 1.1.1 (Project Initialization) must be completed
  - Requires package.json with npm scripts
  - Requires vite.config.ts with correct base path
  - Requires tsconfig.json for TypeScript compilation

**Technical Dependencies:**
- GitHub repository must exist (already created)
- Git history with at least one commit on main branch
- npm lockfile (package-lock.json) must be committed
- GitHub account with repository write access

**Repository Settings:**
- GitHub Pages must be enabled (configured during story)
- Actions must be enabled (default for public repos)
- No branch protection rules that block automated commits

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] `.github/workflows/deploy.yml` created and committed
- [ ] Workflow successfully builds and deploys game to GitHub Pages
- [ ] Game accessible at `https://re0nido.github.io/Satisfying-Drifting/`
- [ ] Build status badge added to README.md and displays correctly
- [ ] README.md includes deployment instructions
- [ ] All 8 manual test cases pass successfully
- [ ] Build completes in < 3 minutes
- [ ] No TypeScript or build errors in workflow logs
- [ ] GitHub Pages source set to "GitHub Actions" in repository settings
- [ ] Deployment URL visible in workflow output
- [ ] Subsequent pushes trigger automatic deployment
- [ ] Manual workflow dispatch works correctly

---

## Notes

### Implementation Notes

- Use `npm ci` instead of `npm install` for reproducible builds (uses lockfile)
- Node.js 18 is LTS version with best GitHub Actions support
- Artifact-based deployment is modern method (no gh-pages branch needed)
- Concurrency control prevents race conditions during rapid pushes
- TypeScript compilation step catches errors before expensive Vite build
- Cache npm dependencies to speed up subsequent builds (30s vs 2min)

### Design Decisions

- **Artifact deployment over gh-pages branch**: Simpler, no orphan branches, recommended by GitHub
- **Single workflow for CI/CD**: Keeps configuration simple, can split later for PR checks
- **Node.js 18**: Stable LTS version, widely supported, good performance
- **Manual trigger enabled**: Allows redeployment without code changes if needed
- **No environment secrets**: Static site needs no API keys or credentials

### Future Considerations

- Add separate CI workflow for pull request validation (linting, tests)
- Add deployment previews for PRs using Netlify or Vercel
- Implement performance budgets (fail build if bundle > 600KB)
- Add automated Lighthouse scoring on deployments
- Consider branch protection rules requiring CI checks to pass
- Add Slack/Discord notifications for deployment status

### Common Pitfalls to Avoid

- **DO NOT** use deprecated actions/checkout@v3 or @v4 (use v5)
- **DO NOT** forget to enable GitHub Pages in repository settings
- **ENSURE** Vite base path matches repository name exactly (case-sensitive)
- **VERIFY** package-lock.json is committed (required for npm ci)
- **DO NOT** use `npm install` in CI (always use `npm ci` for reproducibility)
- **CHECK** that permissions are correctly set (pages: write required for deployment)

### Troubleshooting Guide

**Issue: Workflow doesn't trigger on push**
- Solution: Check branch name is exactly `main` (not `master`)
- Verify Actions are enabled in repository settings

**Issue: Build fails with "Cannot find package-lock.json"**
- Solution: Commit package-lock.json to repository
- Run `npm install` locally to generate it

**Issue: Deployment succeeds but game shows 404 errors**
- Solution: Check Vite base path in vite.config.ts matches repository name
- Verify assets are correctly referenced (use relative paths)

**Issue: GitHub Pages shows old version of game**
- Solution: Hard refresh browser (Ctrl+Shift+R)
- Check workflow completed successfully (not just started)
- Verify deployment job completed (not just build job)

**Issue: "Resource not accessible by integration" error**
- Solution: Check workflow permissions (needs pages: write)
- Verify GitHub Pages is enabled in repository settings

---

**Story Created:** October 29, 2025  
**Created By:** Jordan (Game Scrum Master)  
**Next Story:** 1.1.3 - Initial Asset Structure & Placeholder Assets
