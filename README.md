# Git MCP Server

MCP server providing git operations as tools for agents.

## Tools

| Tool | Description |
|------|-------------|
| `git_status` | Get repository status (staged, unstaged, untracked files) |
| `git_diff` | Get diff of changes (staged or unstaged) |
| `git_log` | Get commit history with configurable limit |
| `git_branches` | List all branches (local and remote) |
| `git_current_branch` | Get current branch name |
| `git_show` | Show details of a specific commit |
| `git_add` | Stage files for commit |
| `git_commit` | Create a commit with a message |
| `git_search` | Search commits by message pattern |
| `git_file_log` | Get commit history for a specific file |

## Usage

```bash
# Development
cd git-mcp-server && npm run dev

# Build
npm run build

# Run
node dist/index.js
```

## Registered as

`git` in mcporter config at `/root/.openclaw/workspace/config/mcporter.json`

## Requirements

- Node.js 18+
- TypeScript
- simple-git v3
- @modelcontextprotocol/sdk
