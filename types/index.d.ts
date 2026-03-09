/**
 * OpenHermit TypeScript Definitions
 * WebMCP-compliant AI agent discovery library
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
 * OpenHermit namespace
 */
declare global {
  interface Window {
    OpenHermit?: {
      version: string;
      config: OpenHermitConfig;
    };
  }
}

export {};
