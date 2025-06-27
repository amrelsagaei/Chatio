import type { FrontendSDK } from '../types'

// Action parameter interfaces
export interface ActionParameter {
  name: string
  type: 'string' | 'number' | 'boolean' | 'array' | 'object'
  required: boolean
  description: string
  default?: any
}

// Action definition interface
export interface ActionDefinition {
  name: string
  description: string
  category: ActionCategory
  parameters: ActionParameter[]
  execute: (sdk: FrontendSDK, params: any) => Promise<boolean>
  examples: string[]
}

// Action categories - only what we need
export type ActionCategory = 
  | 'editor' 
  | 'replay' 
  | 'scope' 
  | 'filter' 
  | 'automation'

// Result interface
export interface ActionResult {
  success: boolean
  message: string
  data?: any
}

// Helper functions for editor manipulation
const getActiveEditor = (sdk: FrontendSDK) => {
  try {
    const sdkEditor = sdk.window?.getActiveEditor()
    if (sdkEditor) return sdkEditor
  } catch (error) {
    console.warn('SDK getActiveEditor failed:', error)
  }
  
  const focusedEditor = document.querySelector('.cm-editor.cm-focused .cm-content') as any
  if (focusedEditor?.cmView?.view) {
    return {
      getEditorView: () => focusedEditor.cmView.view,
      replaceSelectedText: (text: string) => {
        const editor = focusedEditor.cmView.view
        const { from, to } = editor.state.selection.main
        editor.dispatch({
          changes: { from, to, insert: text }
        })
      },
      focus: () => focusedEditor.cmView.view.focus()
    }
  }
  
  return null
}

const getCurrentReplayTabSessionId = () => {
  const activeTab = document.querySelector('.c-tree-item--active[data-session-id]')
  return activeTab?.getAttribute('data-session-id') || ''
}

// PRIORITY ACTIONS ONLY - Everything else removed
const actionImplementations: Record<string, ActionDefinition> = {
  activeEditorReplaceSelection: {
    name: 'activeEditorReplaceSelection',
    description: 'Replace selected text in the active editor',
    category: 'editor',
    parameters: [
      { name: 'text', type: 'string', required: true, description: 'Text to replace selection with' }
    ],
    examples: [
      'Replace selected text with "Hello World"',
      'Insert payload into selected area'
    ],
    execute: async (sdk: FrontendSDK, { text }: { text: string }) => {
      try {
        const editor = getActiveEditor(sdk)
        if (!editor) return false
        editor.replaceSelectedText(text)
        editor.focus()
        return true
      } catch (error) {
        return false
      }
    }
  },

  activeEditorReplaceByString: {
    name: 'activeEditorReplaceByString',
    description: 'Replace text by string match in active editor',
    category: 'editor',
    parameters: [
      { name: 'match', type: 'string', required: true, description: 'String to find and replace' },
      { name: 'replace', type: 'string', required: true, description: 'Replacement string' }
    ],
    examples: [
      'Replace "GET" with "POST"',
      'Replace parameter values'
    ],
    execute: async (sdk: FrontendSDK, { match, replace }: { match: string, replace: string }) => {
      try {
        const editor = getActiveEditor(sdk)?.getEditorView()
        if (!editor) return false
        
        const currentText = editor.state.doc.toJSON().join("\r\n")
        const newText = currentText.replace(match, replace)
        editor.dispatch({
          changes: { from: 0, to: editor.state.doc.length, insert: newText }
        })
        editor.focus()
        return true
      } catch (error) {
        return false
      }
    }
  },

  activeEditorReplaceBody: {
    name: 'activeEditorReplaceBody',
    description: 'Replace the body content in active editor',
    category: 'editor',
    parameters: [
      { name: 'body', type: 'string', required: true, description: 'New body content' }
    ],
    examples: [
      'Replace request body with JSON payload',
      'Set new GraphQL query body'
    ],
    execute: async (sdk: FrontendSDK, { body }: { body: string }) => {
      try {
        const editor = getActiveEditor(sdk)?.getEditorView()
        if (!editor) return false
        
        const lines = editor.state.doc.toJSON()
        let bodyStartIndex = 0
        
        // Find first empty line which delimits headers from body
        for (let i = 0; i < lines.length; i++) {
          if (lines[i] === '') {
            bodyStartIndex = i
            break
          }
        }

        // Calculate the character position where body starts
        const bodyStartPos = lines.slice(0, bodyStartIndex + 1).join('\n').length + 1
        
        // Replace everything after headers with new body
        editor.dispatch({
          changes: {
            from: bodyStartPos,
            to: editor.state.doc.length,
            insert: body
          }
        })
        editor.focus()
        return true
      } catch (error) {
        return false
      }
    }
  },

  activeEditorAddHeader: {
    name: 'activeEditorAddHeader',
    description: 'Add or update header in active editor',
    category: 'editor',
    parameters: [
      { name: 'header', type: 'string', required: true, description: 'Header in format "Name: Value"' },
      { name: 'replace', type: 'boolean', required: false, description: 'Replace existing header', default: true }
    ],
    examples: [
      'Add Content-Type header',
      'Update Authorization header'
    ],
    execute: async (sdk: FrontendSDK, { header, replace = true }: { header: string, replace?: boolean }) => {
      try {
        const editor = getActiveEditor(sdk)?.getEditorView()
        if (!editor) return false
        
        const lines = editor.state.doc.toJSON()
        const [headerName] = header.split(':', 1)
        
        if (!headerName) return false
        
        // Find if header already exists
        let headerLineIndex = -1
        let firstEmptyLineIndex = -1
        
        for (let i = 0; i < lines.length; i++) {
          if (lines[i] === '') {
            firstEmptyLineIndex = i
            break
          }
          if (lines[i].toLowerCase().startsWith(headerName.toLowerCase() + ':')) {
            headerLineIndex = i
          }
        }
        
        if (headerLineIndex >= 0 && replace) {
          // Replace existing header
          const lineStart = lines.slice(0, headerLineIndex).join('\n').length + (headerLineIndex > 0 ? 1 : 0)
          const lineEnd = lineStart + lines[headerLineIndex].length
          
          editor.dispatch({
            changes: { from: lineStart, to: lineEnd, insert: header }
          })
        } else if (firstEmptyLineIndex >= 0) {
          // Add new header before empty line
          const insertPos = lines.slice(0, firstEmptyLineIndex).join('\n').length + (firstEmptyLineIndex > 0 ? 1 : 0)
          editor.dispatch({
            changes: { from: insertPos, to: insertPos, insert: header + '\n' }
          })
        }
        
        editor.focus()
        return true
      } catch (error) {
        return false
      }
    }
  },

  replayRequestReplace: {
    name: 'replayRequestReplace',
    description: 'Replace content in replay request editor',
    category: 'replay',
    parameters: [
      { name: 'text', type: 'string', required: true, description: 'New request content' }
    ],
    examples: [
      'Replace entire request',
      'Set new request content'
    ],
    execute: async (sdk: FrontendSDK, { text }: { text: string }) => {
      try {
        const replayEditor = document.querySelector(".c-request__body .cm-content") as any
        if (replayEditor?.cmView?.view) {
          const editor = replayEditor.cmView.view
          editor.dispatch({
            changes: { from: 0, to: editor.state.doc.length, insert: text }
          })
          editor.focus()
          return true
        }
        return false
      } catch (error) {
        return false
      }
    }
  },

  renameReplayTab: {
    name: 'renameReplayTab',
    description: 'Rename the current replay tab',
    category: 'replay',
    parameters: [
      { name: 'newName', type: 'string', required: true, description: 'New name for the tab' },
      { name: 'sessionId', type: 'string', required: false, description: 'Session ID (auto-detected if not provided)' }
    ],
    examples: [
      'Rename tab to "Login Request"',
      'Set descriptive tab name'
    ],
    execute: async (sdk: FrontendSDK, { newName, sessionId }: { newName: string, sessionId?: string }) => {
      try {
        const id = sessionId || getCurrentReplayTabSessionId()
        if (!id) return false
        
        // Use SDK method if available
        if (sdk.replay?.renameSession) {
          await sdk.replay.renameSession(id, newName)
          return true
        } else if (sdk.sessions?.rename) {
          await sdk.sessions.rename(id, newName)
          return true
        }
        
        // Try DOM manipulation as fallback
        const activeTab = document.querySelector('.c-tree-item--active .c-tree-item__name')
        if (activeTab) {
          activeTab.textContent = newName
          return true
        }
        
        return false
      } catch (error) {
        return false
      }
    }
  },

  addScope: {
    name: 'addScope',
    description: 'Add a new scope configuration',
    category: 'scope',
    parameters: [
      { name: 'name', type: 'string', required: true, description: 'Scope name' },
      { name: 'allowlist', type: 'array', required: true, description: 'Array of allowed URLs/patterns' },
      { name: 'denylist', type: 'array', required: false, description: 'Array of denied URLs/patterns', default: [] }
    ],
    examples: [
      'Add scope for specific domain',
      'Create testing scope with multiple endpoints'
    ],
    execute: async (sdk: FrontendSDK, { name, allowlist, denylist = [] }: { name: string, allowlist: string[], denylist?: string[] }) => {
      try {
        if (sdk.scopes?.create) {
          await sdk.scopes.create({ name, allowlist, denylist })
          return true
        } else if (sdk.scopes?.createScope) {
          await sdk.scopes.createScope({ name, allowlist, denylist })
          return true
        }
        
        const mutation = `
          mutation CreateScope($input: ScopeInput!) {
            createScope(input: $input) {
              id
              name
            }
          }
        `;
        
        const variables = {
          input: { name, allowlist, denylist }
        };
        
        const result = await sdk.graphql.query(mutation, variables);
        return !!result?.data?.createScope;
      } catch (error) {
        return false
      }
    }
  },

  deleteScope: {
    name: 'deleteScope',
    description: 'Delete a scope by name or ID',
    category: 'scope',
    parameters: [
      { name: 'name', type: 'string', required: false, description: 'Scope name' },
      { name: 'id', type: 'string', required: false, description: 'Scope ID' }
    ],
    examples: [
      'Delete scope by name',
      'Remove specific scope configuration'
    ],
    execute: async (sdk: FrontendSDK, { name, id }: { name?: string, id?: string }) => {
      try {
        if (id) {
          if (sdk.scopes?.delete) {
            await sdk.scopes.delete(id)
            return true
          }
        } else if (name) {
          // Find scope by name first, then delete - handle various name formats
          let scopes = null
          if (sdk.scopes?.getAll) {
            scopes = await sdk.scopes.getAll()
          }
          
          if (scopes && Array.isArray(scopes)) {
            // Try exact match first
            let scope = scopes.find((s: any) => s.name === name)
            
            // If not found, try case-insensitive match
            if (!scope) {
              scope = scopes.find((s: any) => s.name.toLowerCase() === name.toLowerCase())
            }
            
            // If still not found, try partial match
            if (!scope) {
              scope = scopes.find((s: any) => s.name.includes(name) || name.includes(s.name))
            }
            
            if (scope && sdk.scopes?.delete) {
              await sdk.scopes.delete(scope.id)
              return true
            }
          }
        }
        return false
      } catch (error) {
        return false
      }
    }
  },

  updateScope: {
    name: 'updateScope',
    description: 'Update an existing scope configuration',
    category: 'scope',
    parameters: [
      { name: 'name', type: 'string', required: true, description: 'Scope name to update' },
      { name: 'allowList', type: 'array', required: true, description: 'Updated allowlist' },
      { name: 'denyList', type: 'array', required: true, description: 'Updated denylist' }
    ],
    examples: [
      'Update scope allowlist',
      'Modify scope configuration'
    ],
    execute: async (sdk: FrontendSDK, { name, allowList, denyList }: { name: string, allowList: string[], denyList: string[] }) => {
      try {
        let scopes = null
        if (sdk.scopes?.getAll) {
          scopes = await sdk.scopes.getAll()
        }
        
        if (scopes && Array.isArray(scopes)) {
          // Try exact match first
          let scope = scopes.find((s: any) => s.name === name)
          
          // If not found, try case-insensitive match
          if (!scope) {
            scope = scopes.find((s: any) => s.name.toLowerCase() === name.toLowerCase())
          }
          
          // If still not found, try partial match
          if (!scope) {
            scope = scopes.find((s: any) => s.name.includes(name) || name.includes(s.name))
          }
          
          if (scope && sdk.scopes?.update) {
            await sdk.scopes.update(scope.id, {
              name: scope.name, // Keep original name
              allowList: allowList,  
              denyList: denyList  
            })
            return true
          }
        }
        return false
      } catch (error) {
        return false
      }
    }
  },

  addToScope: {
    name: 'addToScope',
    description: 'Add new domains/URLs to an existing scope (merges with existing allowlist)',
    category: 'scope',
    parameters: [
      { name: 'scopeName', type: 'string', required: true, description: 'Name of the scope to update' },
      { name: 'newDomains', type: 'array', required: true, description: 'New domains/URLs to add' }
    ],
    examples: [
      'Add google.com to Netflix scope',
      'Add multiple domains to existing scope'
    ],
    execute: async (sdk: FrontendSDK, { scopeName, newDomains }: { scopeName: string, newDomains: string[] }) => {
      try {
        let scopes = null
        if (sdk.scopes?.getAll) {
          scopes = await sdk.scopes.getAll()
        }
        
        if (scopes && Array.isArray(scopes)) {
          // Find scope by name with flexible matching
          let scope = scopes.find((s: any) => s.name === scopeName)
          
          if (!scope) {
            scope = scopes.find((s: any) => s.name.toLowerCase() === scopeName.toLowerCase())
          }
          
          if (!scope) {
            scope = scopes.find((s: any) => s.name.includes(scopeName) || scopeName.includes(s.name))
          }
          
          if (scope && sdk.scopes?.update) {
            // Merge new domains with existing allowlist
            const existingAllowlist = scope.allowlist || []
            const mergedAllowlist = [...new Set([...existingAllowlist, ...newDomains])]
            
            await sdk.scopes.update(scope.id, {
              name: scope.name,
              allowlist: mergedAllowlist,
              denylist: scope.denylist || []
            })
            return true
          }
        }
        return false
      } catch (error) {
        return false
      }
    }
  },

  addFilter: {
    name: 'addFilter',
    description: 'Add a new HTTPQL filter',
    category: 'filter',
    parameters: [
      { name: 'name', type: 'string', required: true, description: 'Filter name' },
      { name: 'query', type: 'string', required: true, description: 'HTTPQL query' },
      { name: 'alias', type: 'string', required: true, description: 'Filter alias/shortcut' }
    ],
    examples: [
      'Add filter for specific host',
      'Create status code filter'
    ],
    execute: async (sdk: FrontendSDK, { name, query, alias }: { name: string, query: string, alias: string }) => {
      try {
        let formattedQuery = query;
        
        // Handle dismiss/hide/exclude patterns
        if (query.toLowerCase().includes('dismiss') || query.toLowerCase().includes('hide') || query.toLowerCase().includes('exclude')) {
          // Extract file patterns like .md, .js, .css etc
          const fileExtensionMatch = query.match(/\.([a-zA-Z0-9]+)/g);
          if (fileExtensionMatch) {
            const extensions = fileExtensionMatch.map(ext => ext.slice(1)); // Remove the dot
            const pathConditions = extensions.map(ext => `req.path.cont:".${ext}"`).join(' or ');
            formattedQuery = `not (${pathConditions})`;
          } else {
            // General dismiss pattern
            const dismissTerm = query.toLowerCase().replace(/dismiss|hide|exclude|all|the|files?/g, '').trim();
            if (dismissTerm) {
              formattedQuery = `not req.path.cont:"${dismissTerm}"`;
            }
          }
        }
        // Handle specific HTTPQL patterns
        else if (query.includes('host:') && !query.includes('.eq:') && !query.includes('.cont:')) {
          formattedQuery = formattedQuery.replace(/host:([^\s]+)/g, 'req.host.eq:"$1"');
        }
        else if (query.includes('status:') && !query.includes('.eq:')) {
          formattedQuery = formattedQuery.replace(/status:(\d+)/g, 'resp.status.eq:$1');
        }
        else if (query.includes('method:') && !query.includes('.eq:')) {
          formattedQuery = formattedQuery.replace(/method:([^\s]+)/g, 'req.method.eq:"$1"');
        }
        // Handle file extension filters
        else if (query.match(/\.[a-zA-Z0-9]+/)) {
          const extensions = query.match(/\.[a-zA-Z0-9]+/g);
          if (extensions) {
            const pathConditions = extensions.map(ext => `req.path.cont:"${ext}"`).join(' or ');
            formattedQuery = pathConditions;
          }
        }
        // Handle status code filters
        else if (/^\d{3}$/.test(query.trim())) {
          formattedQuery = `resp.status.eq:${query.trim()}`;
        }
        // Handle API endpoint filters
        else if (query.toLowerCase().includes('api')) {
          formattedQuery = `req.path.cont:"api"`;
        }
        // Handle general search - only if no HTTPQL operators detected
        else if (!formattedQuery.includes('.eq:') && !formattedQuery.includes('.cont:') && !formattedQuery.includes('.gte:') && !formattedQuery.includes('.lt:') && !formattedQuery.includes('not ')) {
          formattedQuery = `req.host.cont:"${query}" or req.path.cont:"${query}" or resp.body.cont:"${query}"`;
        }
        
        if (sdk.filters?.create) {
          await sdk.filters.create({
            name,
            query: formattedQuery,
            alias
          })
          return true
        } else if (sdk.httpFilters?.create) {
          await sdk.httpFilters.create({
            name,
            query: formattedQuery,
            alias
          })
          return true
        }
        return false
      } catch (error) {
        return false
      }
    }
  },

  deleteFilter: {
    name: 'deleteFilter',
    description: 'Delete a filter by name or ID',
    category: 'filter',
    parameters: [
      { name: 'name', type: 'string', required: false, description: 'Filter name' },
      { name: 'id', type: 'string', required: false, description: 'Filter ID' }
    ],
    examples: [
      'Delete filter by name',
      'Remove specific filter'
    ],
    execute: async (sdk: FrontendSDK, { name, id }: { name?: string, id?: string }) => {
      try {
        if (id) {
          if (sdk.filters?.delete) {
            await sdk.filters.delete(id)
            return true
          }
        } else if (name) {
          // Find filter by name first
          let filters = null
          if (sdk.filters?.getAll) {
            filters = await sdk.filters.getAll()
          }
          
          if (filters && Array.isArray(filters)) {
            const filter = filters.find((f: any) => f.name === name)
            if (filter && sdk.filters?.delete) {
              await sdk.filters.delete(filter.id)
              return true
            }
          }
        }
        return false
      } catch (error) {
        return false
      }
    }
  },

  updateFilter: {
    name: 'updateFilter',
    description: 'Update an existing filter',
    category: 'filter',
    parameters: [
      { name: 'id', type: 'string', required: true, description: 'Filter ID' },
      { name: 'name', type: 'string', required: true, description: 'Updated filter name' },
      { name: 'alias', type: 'string', required: true, description: 'Updated alias' },
      { name: 'query', type: 'string', required: true, description: 'Updated HTTPQL query' }
    ],
    examples: [
      'Update filter query',
      'Modify filter configuration'
    ],
    execute: async (sdk: FrontendSDK, { id, name, alias, query }: { id: string, name: string, alias: string, query: string }) => {
      try {
        if (sdk.filters?.update) {
          await sdk.filters.update(id, { name, alias, query })
          return true
        }
        return false
      } catch (error) {
        return false
      }
    }
  },

  createHostedFile: {
    name: 'createHostedFile',
    description: 'Create a new hosted file',
    category: 'automation',
    parameters: [
      { name: 'name', type: 'string', required: true, description: 'File name' },
      { name: 'content', type: 'string', required: true, description: 'File content' }
    ],
    examples: [
      'Create wordlist file',
      'Upload payload file'
    ],
    execute: async (sdk: FrontendSDK, { name, content }: { name: string, content: string }) => {
      try {
        const file = new File([content], name, { type: 'text/plain' })
        
        if ((sdk as any).files?.create) {
          await (sdk as any).files.create(file)
          return true
        } else if ((sdk as any).hostedFiles?.create) {
          await (sdk as any).hostedFiles.create(file)
          return true
        }
        
        return false
      } catch (error) {
        return false
      }
    }
  },

  removeHostedFile: {
    name: 'removeHostedFile',
    description: 'Remove a hosted file by name or ID',
    category: 'automation',
    parameters: [
      { name: 'id', type: 'string', required: false, description: 'File ID' },
      { name: 'name', type: 'string', required: false, description: 'File name' }
    ],
    examples: [
      'Remove file by name',
      'Delete specific hosted file'
    ],
    execute: async (sdk: FrontendSDK, { id, name }: { id?: string, name?: string }) => {
      try {
        if (id) {
          if ((sdk as any).files?.delete) {
            await (sdk as any).files.delete(id)
            return true
          }
        } else if (name) {
          if (name === '*') {
            let files = null
            if ((sdk as any).files?.getAll) {
              files = await (sdk as any).files.getAll()
            }
            
            if (files && Array.isArray(files)) {
              for (const file of files) {
                if ((sdk as any).files?.delete) {
                  await (sdk as any).files.delete(file.id)
                }
              }
              return true
            }
          } else {
            let files = null
            if ((sdk as any).files?.getAll) {
              files = await (sdk as any).files.getAll()
            }
            
            if (files && Array.isArray(files)) {
              const file = files.find((f: any) => f.name === name)
              if (file && (sdk as any).files?.delete) {
                await (sdk as any).files.delete(file.id)
                return true
              }
            }
          }
        }
        return false
      } catch (error) {
        return false
      }
    }
  },

  searchHttpHistory: {
    name: 'searchHttpHistory',
    description: 'Navigate to HTTP History and apply search directly',
    category: 'filter',
    parameters: [
      { name: 'query', type: 'string', required: true, description: 'Search query to apply' }
    ],
    examples: [
      'Search HTTP History directly',
      'Navigate and search for specific content'
    ],
    execute: async (sdk: FrontendSDK, { query }: { query: string }) => {
      try {
        let httpqlQuery = query;
        
        if (!query.includes('.eq:') && !query.includes('.cont:') && !query.includes('.gte:') && !query.includes('.lt:')) {
          if (/^\d{3}$/.test(query.trim())) {
            httpqlQuery = `resp.status.eq:${query.trim()}`;
          } else if (query.toLowerCase().includes('api')) {
            httpqlQuery = `req.path.cont:"${query}" or req.host.cont:"${query}"`;
          } else if (query.toLowerCase().includes('login')) {
            httpqlQuery = `req.raw.cont:"${query}"`;
          } else {
            httpqlQuery = `req.raw.cont:"${query}"`;
          }
        }
        
        window.location.hash = '#/http-history';
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        sdk.httpHistory.setQuery(httpqlQuery);
        
        return true;
        
      } catch (error) {
        return false;
      }
    }
  },

  // Simple text replacement in current request (not rule creation)
  replaceInCurrentRequest: {
    name: 'replaceInCurrentRequest',
    description: 'Replace text in the currently active request (use for "replace X with Y")',
    category: 'editor',
    parameters: [
      { name: 'find', type: 'string', required: true, description: 'Text to find and replace' },
      { name: 'replace', type: 'string', required: true, description: 'Text to replace with' }
    ],
    examples: [
      'Replace "GET" with "POST"',
      'Replace parameter value'
    ],
    execute: async (sdk: FrontendSDK, { find, replace }: { find: string, replace: string }) => {
      try {
        const editor = getActiveEditor(sdk)?.getEditorView();
        if (!editor) {
          return false;
        }
        
        const currentText = editor.state.doc.toJSON().join("\r\n");
        const newText = currentText.replace(new RegExp(find, 'g'), replace);
        
        editor.dispatch({
          changes: { from: 0, to: editor.state.doc.length, insert: newText }
        });
        
        editor.focus();
        return true;
        
      } catch (error) {
        return false;
      }
    }
  }
}

// Main action execution function
export async function executeAction(sdk: FrontendSDK, actionName: string, params: any): Promise<ActionResult> {
  const action = actionImplementations[actionName]
  
  if (!action) {
    return {
      success: false,
      message: `Action "${actionName}" is not supported. Available actions: ${Object.keys(actionImplementations).join(', ')}`
    }
  }

  try {
    // Validate required parameters
    for (const param of action.parameters) {
      if (param.required && (params[param.name] === undefined || params[param.name] === null)) {
        return {
          success: false,
          message: `Missing required parameter: ${param.name}`
        }
      }
    }

    // Execute the action
    const success = await action.execute(sdk, params)
    
    return {
      success,
      message: success ? `Successfully executed ${actionName}` : `Failed to execute ${actionName}`
    }
  } catch (error) {
    return {
      success: false,
      message: `Error executing ${actionName}: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

// Get all available actions
export function getAllActions(): ActionDefinition[] {
  return Object.values(actionImplementations)
}

// Get actions by category
export function getActionsByCategory(category: ActionCategory): ActionDefinition[] {
  return getAllActions().filter(action => action.category === category)
}

// Get action by name
export function getAction(name: string): ActionDefinition | undefined {
  return actionImplementations[name]
}

// Generate action documentation
export function generateActionDocs(): string {
  const actions = getAllActions()
  const categories = [...new Set(actions.map(a => a.category))]
  
  let docs = '# Available Priority Actions\n\n'
  
  for (const category of categories) {
    docs += `## ${category.charAt(0).toUpperCase() + category.slice(1)} Actions\n\n`
    
    const categoryActions = getActionsByCategory(category)
    for (const action of categoryActions) {
      docs += `### ${action.name}\n`
      docs += `${action.description}\n\n`
      docs += `**Parameters:**\n`
      
      if (action.parameters.length === 0) {
        docs += `- None\n\n`
      } else {
        for (const param of action.parameters) {
          const required = param.required ? ' (required)' : ' (optional)'
          docs += `- \`${param.name}\`: ${param.type}${required} - ${param.description}\n`
        }
        docs += '\n'
      }
      
      docs += `**Examples:**\n`
      for (const example of action.examples) {
        docs += `- ${example}\n`
      }
      docs += '\n'
    }
  }
  
  return docs
}

// Get supported action names for AI prompt
export function getSupportedActionNames(): string[] {
  return Object.keys(actionImplementations)
} 