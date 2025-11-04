# 🧠  Cloudflare Canvas Agent!
> Built for the Optional Cloudflare AI Challenge 

An AI-powered chat agent built on **Cloudflare’s Agents Platform**, integrating the [**Canvas LMS MCP server**](https://github.com/aryankeluskar/canvas-mcp) to enable intelligent, context-aware interactions with academic course data. 

This project extends and modifies the official [`agents-starter`](https://github.com/cloudflare/agents-starter) template with full **MCP integration**, **stateful workflows**, and **tool-driven AI reasoning**, deployable entirely on **Cloudflare Pages**.

#### Context via tool calling (MCP)
![App Screenshot](./assets/Screenshot%201.png)

#### Remembers conversations
![App Screenshot](./assets/Screenshot%202.png)

## 🚀 Features

* **Canvas LMS Integration (via MCP):**
  Securely connects to the user’s Canvas shell through the [Model Context Protocol (MCP)](https://modelcontextprotocol.io), enabling chained tool calls per session for course and assignment retrieval.

* **AI-Driven Chat Interface:**
  Real-time conversation with an **LLM (gpt-4o via Cloudflare AI Gateway)**. Streaming, human-in-the-loop responses powered by the `agents` SDK.

* **Built-In Memory & State Management:**
  Persistent context and state tracking using Durable Objects allowing multi-turn reasoning and recall of prior tool outputs.

* **Modern Cloudflare Stack:**
  Frontend hosted on **Cloudflare Pages**, backend workflows running on **Cloudflare Workers**, and AI inference through **AI Gateway**.

* **Extensible Tool System:**
  Easily register new tools (e.g., Firecrawl for web scraping, GitHub MCP for repo search) with `zod` validation and automated confirmation prompts.

## 🧩 Tech Stack

| Layer                     | Technology                                                                |
| ------------------------- | ------------------------------------------------------------------------- |
| **Frontend**              | React + Vite on Cloudflare Pages                                       |
| **Backend / Agent Logic** | Cloudflare Workers AI + AI Gateway                                           |
| **LLM**              | OpenAI gpt-4o via Cloudflare AI Gateway |
| **Memory / State**        | Durable Objects           |
| **Tooling / Schema**      | MCP SDK, Zod, TypeScript                                                  |
| **Build / Deployment**    | Vite + Cloudflare Pages                                      |


## ✅ Challenge Requirements
- LLM (recommend using Llama 3.3 on Workers AI), or an external LLM of your choice

  *  OpenAI gpt-4o via Cloudflare Workers + AI Gateway ✅

- Workflow / coordination (recommend using Workflows, Workers or Durable Objects)

  *  Cloudflare Workers for tool calling + Durable Objects for memory  ✅

- User input via chat or voice (recommend using Pages or Realtime)

  * Simple chat interface deployable on Cloudflare Pages ✅

- Memory or state
  * Durable Objects for memory  ✅

- Prompts in `PROMPTS.md`


## 💻 Setup
1. Clone this repository 
    ```sh
    git clone https://github.com/omavashia2005/cf_ai_test2.git
    ```

2. `cd` into this repository in your editor of choice

3. Once in, install all dependencies. Make sure you're on Node version 22+ (ensure using `node -v`)
    ```sh
    npm install 
    ```

4. Set up environment variables in a file named `.dev.vars`
    Required variables (example `.dev.vars`):
    ```
    OPENAI_API_KEY=
    CLOUDFLARE_PROFILE=
    CLOUDFLARE_PROJECT_NAME=
    CANVAS_API_KEY=
    SMITHERY_PROFILE=
    SMITHERY_API_KEY=
    ```
    Check resources for documentation on how to set this up

5. Run the project
    ```sh
    npm run start
    ```

  The project will now be live _locally_ at http://localhost:5174

## 📖 Resources
1. [Get an OpenAI API Key](https://platform.openai.com/docs/overview)
2. [Setup Cloudflare AI Gateway](https://developers.cloudflare.com/ai-gateway/)
3. Canvas Student API Key:

    Account > Settings > Approved Integrations > New Access Token

4. Go to [this mcp server](https://smithery.ai/server/@aryankeluskar/canvas-mcp). 
    * Sign Up/Login to a Smithery account
    * In "configure", add your Canvas API key from step 3
5. [Get your Smithery API key](https://smithery.ai/account/api-keys)
6. [Get your Smithery MCP Profile](https://smithery.ai/account/profiles)

## Project Structure
```
cf_ai_canvas_agent/
├── src/                  # Core source code
│   ├── tools.ts          # MCP tools and API integrations
│   ├── server.ts         # Worker entrypoint (Cloudflare)
│   ├── app.tsx           # Frontend (React)
├── README.md
└── PROMPTS.md            # Prompts used to generate AI code
```