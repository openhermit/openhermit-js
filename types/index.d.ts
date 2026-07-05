/**
 * OpenHermit TypeScript Definitions
 * WebMCP-compliant AI agent discovery library
 *
 * Supports both the W3C WebMCP Declarative API (HTML form annotations)
 * and the Imperative API (navigator.modelContext.registerTool with AbortSignal).
 */

export interface OpenHermitConfig {
  /** Your OpenHermit API key (required) */
  apiKey: string;
  /** Custom API base URL (optional, defaults to https://www.openhermit.com) */
  apiBase?: string;
}

export interface WebMCPAction {
  /** Unique tool name in snake_case */
  tool_name: string;
  /** Human-readable action description */
  tool_description: string;
  /** Action type (contact_form, booking, signup, etc.) */
  type: string;
  /** Display name for the action */
  name: string;
  /** CSS selector for the form/element */
  selector: string;
  /** Array of field definitions */
  fields?: WebMCPField[];
  /** Third-party provider (calendly, typeform, etc.) */
  third_party?: string;
  /** WebMCP attributes to inject */
  webmcp_attributes?: Record<string, any>;
}

export interface WebMCPField {
  /** Field name attribute */
  name: string;
  /** Field label text */
  label: string;
  /** Field type (text, email, textarea, etc.) */
  type: string;
  /** Whether field is required */
  required: boolean;
}

export interface AgentEvent {
  /** Event type (view, interaction, completion, error) */
  event_type: 'view' | 'interaction' | 'completion' | 'error';
  /** Action tool name */
  action_tool_name: string;
  /** Detected agent name */
  agent_name: string | null;
  /** User agent string */
  user_agent: string;
  /** Current page URL */
  page_url: string;
  /** Event metadata */
  metadata?: Record<string, any>;
}

export interface BusinessInfo {
  /** Business name */
  business_name?: string;
  /** Contact phone number */
  phone?: string;
  /** Contact email */
  email?: string;
  /** Physical address */
  address?: string;
  /** Opening hours */
  hours?: string;
}

/**
 * W3C WebMCP Imperative Tool Definition
 * Used with navigator.modelContext.registerTool()
 */
export interface WebMCPToolDefinition {
  /** Tool name in snake_case */
  name: string;
  /** Human-readable description of what the tool does */
  description: string;
  /** JSON Schema defining the tool's input parameters */
  inputSchema: {
    type: 'object';
    properties: Record<string, {
      type: string;
      description?: string;
      format?: string;
      enum?: string[];
      anyOf?: Array<{ const: string; title?: string }>;
    }>;
    required?: string[];
  };
  /**
   * Function called when an agent invokes this tool.
   * Returns a WebMCP-shaped result: { content: [{ type: 'text', text: string }] }.
   */
  execute: (params: Record<string, any>) => WebMCPToolResult | Promise<WebMCPToolResult>;
}

/**
 * WebMCP tool result shape returned by a tool's execute() function.
 * See https://webmachinelearning.github.io/webmcp/
 */
export interface WebMCPToolResult {
  content: Array<{
    type: 'text';
    text: string;
  }>;
}

/**
 * Options for navigator.modelContext.registerTool()
 * Chrome 148+ uses AbortSignal for tool unregistration
 */
export interface RegisterToolOptions {
  /** AbortSignal — aborting this signal unregisters the tool */
  signal?: AbortSignal;
}

/**
 * WebMCP SubmitEvent extensions (Chrome 146+)
 */
export interface WebMCPSubmitEvent extends SubmitEvent {
  /** True when the form submission was triggered by an AI agent */
  agentInvoked?: boolean;
  /** Pass a promise that resolves with the tool's result data */
  respondWith?: (response: Promise<any>) => void;
}

/**
 * WebMCP Tool Events (Chrome 146+)
 */
export interface ToolActivatedEvent extends Event {
  /** Name of the tool that was activated */
  toolName: string;
}

export interface ToolCancelEvent extends Event {
  /** Name of the tool whose execution was cancelled */
  toolName: string;
}

/**
 * navigator.modelContext API (Chrome 146+ with WebMCP flag)
 */
export interface ModelContext {
  /** Register a tool for AI agent discovery */
  registerTool(tool: WebMCPToolDefinition, options?: RegisterToolOptions): void;
  /**
   * @deprecated Removed in Chrome 148. Use AbortSignal instead.
   * Kept for transition compatibility only.
   */
  unregisterTool?(toolName: string): void;
}

/**
 * Global augmentations.
 *
 * NOTE: OpenHermit ships as a side-effecting IIFE loaded via a <script> tag.
 * It reads its configuration from the script tag's `data-api-key` /
 * `data-api-base` attributes (via document.currentScript) and runs on load.
 * It does NOT expose a `window.OpenHermit` object or an importable `init()`
 * API, so no such types are declared here. The interfaces above document the
 * shapes the library produces and the WebMCP browser APIs it relies on.
 */
declare global {
  interface Navigator {
    modelContext?: ModelContext;
  }

  interface WindowEventMap {
    'toolactivated': ToolActivatedEvent;
    'toolcancel': ToolCancelEvent;
  }
}

export {};
