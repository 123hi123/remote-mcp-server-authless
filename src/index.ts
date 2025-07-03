import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

// Define our MCP agent with tools
export class MyMCP extends McpAgent {
	server = new McpServer({
		name: "Secured Calculator",
		version: "1.0.0",
	});

	async init() {
		// Simple addition tool
		this.server.tool(
			"add",
			{ a: z.number(), b: z.number() },
			async ({ a, b }) => ({
				content: [{ type: "text", text: String(a + b) }],
			})
		);

		// Calculator tool with multiple operations
		this.server.tool(
			"calculate",
			{
				operation: z.enum(["add", "subtract", "multiply", "divide"]),
				a: z.number(),
				b: z.number(),
			},
			async ({ operation, a, b }) => {
				let result: number;
				switch (operation) {
					case "add":
						result = a + b;
						break;
					case "subtract":
						result = a - b;
						break;
					case "multiply":
						result = a * b;
						break;
					case "divide":
						if (b === 0)
							return {
								content: [
									{
										type: "text",
										text: "Error: Cannot divide by zero",
									},
								],
							};
						result = a / b;
						break;
				}
				return { content: [{ type: "text", text: String(result) }] };
			}
		);
	}
}

// Authentication function to verify API key
function verifyApiKey(request: Request, env: Env): boolean {
	// Get the API key from environment variables (fallback to default if not set)
	const validApiKey = env.MCP_API_KEY || "password";
	
	// Check for API key in Authorization header
	const authHeader = request.headers.get("Authorization");
	if (authHeader) {
		const [scheme, token] = authHeader.split(" ");
		if (scheme === "Bearer" && token === validApiKey) {
			return true;
		}
	}
	
	// Check for API key in X-API-Key header
	const apiKeyHeader = request.headers.get("X-API-Key");
	if (apiKeyHeader === validApiKey) {
		return true;
	}
	
	// Check for API key in query parameters
	const url = new URL(request.url);
	const apiKeyParam = url.searchParams.get("api_key");
	if (apiKeyParam === validApiKey) {
		return true;
	}
	
	return false;
}

// Create unauthorized response
function createUnauthorizedResponse(): Response {
	return new Response(
		JSON.stringify({
			error: "Unauthorized",
			message: "Valid API key required. Please provide the key via Authorization header, X-API-Key header, or api_key query parameter."
		}),
		{
			status: 401,
			headers: {
				"Content-Type": "application/json",
				"WWW-Authenticate": "Bearer"
			}
		}
	);
}

export default {
	fetch(request: Request, env: Env, ctx: ExecutionContext) {
		const url = new URL(request.url);

		// For health check endpoint, no auth required
		if (url.pathname === "/" || url.pathname === "/health") {
			return new Response(
				JSON.stringify({
					status: "ok",
					name: "Secured Calculator MCP Server",
					version: "1.0.0",
					auth: "required"
				}),
				{
					headers: { "Content-Type": "application/json" }
				}
			);
		}

		// Verify API key for protected endpoints
		if (!verifyApiKey(request, env)) {
			return createUnauthorizedResponse();
		}

		if (url.pathname === "/sse" || url.pathname === "/sse/message") {
			return MyMCP.serveSSE("/sse").fetch(request, env, ctx);
		}

		if (url.pathname === "/mcp") {
			return MyMCP.serve("/mcp").fetch(request, env, ctx);
		}

		return new Response("Not found", { status: 404 });
	},
};
