import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import * as z from "zod/v4";
import simpleGit from "simple-git";
const SERVER_NAME = "git-mcp-server";
const SERVER_VERSION = "1.0.0";
const server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
});
const getGit = (repoPath) => {
    return simpleGit(repoPath || "/root/.openclaw/workspace");
};
server.registerTool("git_status", {
    description: "Get git repository status",
    inputSchema: z.object({
        repoPath: z.string().optional().describe("Optional path to git repository"),
    }),
}, async (args) => {
    const git = getGit(args.repoPath);
    const status = await git.status();
    return {
        content: [{
                type: "text",
                text: JSON.stringify({
                    current: status.current,
                    staged: status.staged,
                    unstaged: status.not_added,
                    files: status.files,
                    ahead: status.ahead,
                    behind: status.behind,
                    detached: status.detached,
                }, null, 2),
            }],
    };
});
server.registerTool("git_diff", {
    description: "Get diff of changes",
    inputSchema: z.object({
        staged: z.boolean().optional().default(false).describe("Show staged changes only"),
        repoPath: z.string().optional().describe("Optional path to git repository"),
    }),
}, async (args) => {
    const git = getGit(args.repoPath);
    const diff = args.staged
        ? await git.diff(["--staged"])
        : await git.diff();
    return {
        content: [{ type: "text", text: diff || "(no changes)" }],
    };
});
server.registerTool("git_log", {
    description: "Get commit history",
    inputSchema: z.object({
        limit: z.number().optional().default(10).describe("Number of commits"),
        repoPath: z.string().optional().describe("Optional path to git repository"),
    }),
}, async (args) => {
    const git = getGit(args.repoPath);
    const log = await git.log(["--max-count", String(args.limit)]);
    return {
        content: [{ type: "text", text: JSON.stringify(log.all, null, 2) }],
    };
});
server.registerTool("git_branches", {
    description: "List all branches",
    inputSchema: z.object({
        repoPath: z.string().optional().describe("Optional path to git repository"),
    }),
}, async (args) => {
    const git = getGit(args.repoPath);
    const branches = await git.branch(["-a", "-v"]);
    return {
        content: [{
                type: "text",
                text: JSON.stringify({
                    branches: branches.all,
                    current: branches.current,
                    detached: branches.detached,
                }, null, 2),
            }],
    };
});
server.registerTool("git_current_branch", {
    description: "Get current branch name",
    inputSchema: z.object({
        repoPath: z.string().optional().describe("Optional path to git repository"),
    }),
}, async (args) => {
    const git = getGit(args.repoPath);
    const current = await git.revparse(["--abbrev-ref", "HEAD"]);
    return {
        content: [{ type: "text", text: current }],
    };
});
server.registerTool("git_show", {
    description: "Show commit details",
    inputSchema: z.object({
        commit: z.string().optional().default("HEAD").describe("Commit hash or reference"),
        repoPath: z.string().optional().describe("Optional path to git repository"),
    }),
}, async (args) => {
    const git = getGit(args.repoPath);
    const show = await git.show(["--stat", args.commit]);
    return {
        content: [{ type: "text", text: show }],
    };
});
server.registerTool("git_add", {
    description: "Stage files",
    inputSchema: z.object({
        files: z.array(z.string()).min(1).describe("Files to stage"),
        repoPath: z.string().optional().describe("Optional path to git repository"),
    }),
}, async (args) => {
    const git = getGit(args.repoPath);
    await git.add(args.files);
    return {
        content: [{ type: "text", text: `Staged: ${args.files.join(", ")}` }],
    };
});
server.registerTool("git_commit", {
    description: "Create a commit",
    inputSchema: z.object({
        message: z.string().min(1).describe("Commit message"),
        repoPath: z.string().optional().describe("Optional path to git repository"),
    }),
}, async (args) => {
    const git = getGit(args.repoPath);
    const result = await git.commit(args.message);
    return {
        content: [{ type: "text", text: `Committed: ${result.commit}` }],
    };
});
server.registerTool("git_search", {
    description: "Search commits by message",
    inputSchema: z.object({
        pattern: z.string().describe("Search pattern"),
        repoPath: z.string().optional().describe("Optional path to git repository"),
    }),
}, async (args) => {
    const git = getGit(args.repoPath);
    const log = await git.log(["--grep", args.pattern, "--max-count=50"]);
    return {
        content: [{ type: "text", text: JSON.stringify(log.all, null, 2) }],
    };
});
server.registerTool("git_file_log", {
    description: "Get commit history for a file",
    inputSchema: z.object({
        file: z.string().describe("File path"),
        limit: z.number().optional().default(10).describe("Number of commits"),
        repoPath: z.string().optional().describe("Optional path to git repository"),
    }),
}, async (args) => {
    const git = getGit(args.repoPath);
    const log = await git.log(["--max-count", String(args.limit), "--", args.file]);
    return {
        content: [{ type: "text", text: JSON.stringify(log.all, null, 2) }],
    };
});
const transport = new StdioServerTransport();
server.connect(transport).catch(console.error);
console.error("Git MCP Server running on stdio");
