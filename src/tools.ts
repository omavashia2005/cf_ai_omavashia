/**
 * Tool definitions for the AI chat agent
 * Tools can either require human confirmation or execute automatically
 */
import { tool, type ToolSet } from "ai";
import { z } from "zod/v3";
import { Client } from "@modelcontextprotocol/sdk/client/index.js"
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js"

// Lazy initialization of MCP client
let mcpClient: Client | null = null;

async function getMCPClient() {
  if (mcpClient) {
    return mcpClient;
  }

  try {
    // Construct server URL with authentication
    const profile = process.env.SMITHERY_PROFILE || "";
    const smitheryApiKey = process.env.SMITHERY_API_KEY || "";
    const url = new URL("https://server.smithery.ai/@aryankeluskar/canvas-mcp/mcp");
    url.searchParams.set("api_key", smitheryApiKey);
    url.searchParams.set("profile", profile);

    const transport = new StreamableHTTPClientTransport(url);
    
    const client = new Client({
      name: "My App",
      version: "1.0.0", 
      apiKey: smitheryApiKey,
    });

    await client.connect(transport);
    mcpClient = client;
    
    console.log("MCP client connected successfully");
    return client;
  } catch (error) {
    console.error("Failed to connect MCP client:", error);
    throw new Error(`MCP connection failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}


export const getAssignments = tool({
  description: "Use this tool to retrieve all assignments for a specific Canvas course by course name. Provide the course name as input, and the tool will return a list of assignments associated with that course. This is useful for accessing assignment details, due dates, and other related information for a given course.",
  inputSchema: z.object({
    course_name: z.string(),
  }),
  execute: async (input) => {
    const client = await getMCPClient();
    
    const response = await client.callTool({
      name: "get_assignments_by_course_name",
      arguments: {
        course_name: input.course_name,
      }
    });
    
    const res = JSON.stringify(response);

    return res;
  }
});

/**
 * Tool to interact with canvas MCP and get courses
 */
export const getCourses = tool({
  description: "Use this tool to retrieve all available Canvas courses for the current user. This tool returns a dictionary mapping course names to their corresponding IDs. Use this when you need to find course IDs based on names, display all available courses, or when needing to access any course-related information",
  inputSchema: z.object({}),
  execute: async () => {

    const client = await getMCPClient();
    
    const response = await client.callTool({
      name: "get_courses",
      arguments: {
      }
    });
    
    const res = JSON.stringify(response);
    console.log("get_courses response:", res);
    
    const parsedOuter = JSON.parse(res);         
    const innerText = parsedOuter.content[0].text;        
    const coursesObj = JSON.parse(innerText);             
    const courseNames = Object.keys(coursesObj);          

    const joinedCourses = courseNames.join('\n');

    console.log(joinedCourses);

    return joinedCourses;
  }
});

/**
 * Export all available tools
 */
export const tools = {
  getCourses,
  getAssignments
} satisfies ToolSet;

/**
 * Implementation of confirmation-required tools
 */
export const executions = {
};