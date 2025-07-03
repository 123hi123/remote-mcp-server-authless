# Building a Remote MCP Server on Cloudflare (With API Key Authentication)

This example allows you to deploy a remote MCP server with API key authentication on Cloudflare Workers. The server now requires a valid API key to access the MCP tools, providing better security for your deployment.

## Get started: 

[![Deploy to Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/cloudflare/ai/tree/main/demos/remote-mcp-authless)

This will deploy your MCP server to a URL like: `remote-mcp-server-authless.<your-account>.workers.dev/sse`

Alternatively, you can use the command line below to get the remote MCP Server created on your local machine:
```bash
npm create cloudflare@latest -- my-mcp-server --template=cloudflare/ai/demos/remote-mcp-authless
```

## API Key Authentication

The MCP server now includes API key authentication. By default, the API key is set to `"password"`, but you can customize this by:

1. **Environment Variable**: Set `MCP_API_KEY` in your Cloudflare Worker's environment variables
2. **Wrangler Config**: Modify the `vars.MCP_API_KEY` value in `wrangler.jsonc`

### Setting a Custom API Key

To set a custom API key, update the `wrangler.jsonc` file:

```json
{
  "vars": {
    "MCP_API_KEY": "your-secure-api-key-here"
  }
}
```

### Authentication Methods

The server accepts API keys via multiple methods:

- **Authorization Header**: `Authorization: Bearer your-api-key`
- **X-API-Key Header**: `X-API-Key: your-api-key`
- **Query Parameter**: `?api_key=your-api-key`

## Customizing your MCP Server

To add your own [tools](https://developers.cloudflare.com/agents/model-context-protocol/tools/) to the MCP server, define each tool inside the `init()` method of `src/index.ts` using `this.server.tool(...)`. 

## Connect to Cloudflare AI Playground

You can connect to your MCP server from the Cloudflare AI Playground, which is a remote MCP client:

1. Go to https://playground.ai.cloudflare.com/
2. Enter your deployed MCP server URL (`remote-mcp-server-authless.<your-account>.workers.dev/sse`)
3. Provide your API key when prompted
4. You can now use your MCP tools directly from the playground!

## Connect Claude Desktop to your MCP server

You can also connect to your remote MCP server from local MCP clients, by using the [mcp-remote proxy](https://www.npmjs.com/package/mcp-remote). 

To connect to your MCP server from Claude Desktop, follow [Anthropic's Quickstart](https://modelcontextprotocol.io/quickstart/user) and within Claude Desktop go to Settings > Developer > Edit Config.

Update with this configuration:

```json
{
  "mcpServers": {
    "calculator": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "http://localhost:8787/sse",  // or remote-mcp-server-authless.your-account.workers.dev/sse
        "password"  // Replace with your actual API key
      ]
    }
  }
}
```

**Note**: The third argument in the `args` array is your API key. Make sure to replace `"password"` with your actual API key.

Restart Claude and you should see the tools become available after authentication.

## Health Check

You can check if your server is running by visiting the root endpoint:
- `GET /` or `GET /health` - Returns server status (no authentication required)

## Security Features

- All MCP endpoints (`/sse`, `/mcp`) now require valid API key authentication
- Multiple authentication methods supported for flexibility
- Configurable API keys via environment variables
- Health check endpoint remains publicly accessible
