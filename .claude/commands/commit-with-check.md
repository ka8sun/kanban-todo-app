# Commit with Check

Run tests and linting before committing changes to ensure code quality.

## Process

1. **Run Tests**
   - Execute all test suites
   - Capture any failures or errors
   - Report test results

2. **Run Linting**
   - Execute linter and type checker
   - Capture any linting errors
   - Report linting results

3. **Fix Issues** (if any found)
   - Fix test failures
   - Fix linting errors
   - Re-run tests and linting to verify fixes

4. **Create Commit**
   - Check git status
   - Generate appropriate commit message
   - Create commit with all changes

## Usage

```
/project:commit-with-check
```

This command ensures all quality checks pass before creating a commit, maintaining code quality standards.
