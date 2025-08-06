

const getSelectedText = (editor: any) => {
  if (editor) {
    const { from, to } = editor.state.selection.main;
    return editor.state.sliceDoc(from, to);
  }
  return undefined;
};

export const getCurrentReplayEditors = () => {
  if (window.location.hash.split("?")[0] !== "#/replay") {
    return {
      requestEditor: undefined,
      responseEditor: undefined,
      request: undefined,
      response: undefined,
      requestSelectedText: undefined,
      responseSelectedText: undefined,
      focused: undefined,
      currentlySelectedReplayTab: "",
      currentlySelectedReplayTabSessionId: "",
    };
  }

  const requestEditor = (
    document.querySelector(".c-request__body .cm-content") as any
  )?.cmView?.view;
  const responseEditor = (
    document.querySelector(".c-response__body .cm-content") as any
  )?.cmView?.view;
  const focusedEditor = (
    document.querySelector(".cm-editor.cm-focused .cm-content") as any
  )?.cmView?.view;
  
  let focused = undefined;
  if (focusedEditor === requestEditor) {
    focused = "request";
  } else if (focusedEditor === responseEditor) {
    focused = "response";
  }

  return {
    requestEditor,
    responseEditor,
    request: requestEditor?.state.doc.toString(),
    response: responseEditor?.state.doc.toString(),
    requestSelectedText: getSelectedText(requestEditor),
    responseSelectedText: getSelectedText(responseEditor),
    focused,
    currentlySelectedReplayTab: getCurrentlySelectedReplayTab(),
    currentlySelectedReplayTabSessionId: getCurrentlySelectedReplayTabSessionId(),
  };
};

export const getCurrentInterceptEditors = () => {
  if (window.location.hash.split("?")[0] !== "#/intercept") {
    return {
      requestEditor: undefined,
      responseEditor: undefined,
      request: undefined,
      response: undefined,
      requestSelectedText: undefined,
      responseSelectedText: undefined,
      focused: undefined,
    };
  }

  const requestEditor = (
    document.querySelector(".c-writable-request .cm-content") as any
  )?.cmView?.view;
  const responseEditor = (
    document.querySelector(".c-writable-response .cm-content") as any
  )?.cmView?.view;
  const focusedEditor = (
    document.querySelector(".cm-editor.cm-focused .cm-content") as any
  )?.cmView?.view;
  
  let focused = undefined;
  if (focusedEditor === requestEditor) {
    focused = "request";
  } else if (focusedEditor === responseEditor) {
    focused = "response";
  }

  return {
    requestEditor,
    responseEditor,
    request: requestEditor?.state.doc.toString(),
    response: responseEditor?.state.doc.toString(),
    requestSelectedText: getSelectedText(requestEditor),
    responseSelectedText: getSelectedText(responseEditor),
    focused,
  };
};

export const getCurrentHttpHistoryEditors = () => {
  if (window.location.hash.split("?")[0] !== "#/http-history") {
    return {
      requestEditor: undefined,
      responseEditor: undefined,
      request: undefined,
      response: undefined,
      requestSelectedText: undefined,
      responseSelectedText: undefined,
      focused: undefined,
    };
  }

  const requestEditor = (
    document.querySelector(".c-request .cm-content") as any
  )?.cmView?.view;
  const responseEditor = (
    document.querySelector(".c-response .cm-content") as any
  )?.cmView?.view;
  const focusedEditor = (
    document.querySelector(".cm-editor.cm-focused .cm-content") as any
  )?.cmView?.view;
  
  let focused = undefined;
  if (focusedEditor === requestEditor) {
    focused = "request";
  } else if (focusedEditor === responseEditor) {
    focused = "response";
  }

  return {
    requestEditor,
    responseEditor,
    request: requestEditor?.state.doc.toString(),
    response: responseEditor?.state.doc.toString(),
    requestSelectedText: getSelectedText(requestEditor),
    responseSelectedText: getSelectedText(responseEditor),
    focused,
  };
};



// Get current sidebar tab - Updated for latest Caido version
export const getCurrentSidebarTab = () => {
  // Try multiple selectors to ensure compatibility with different Caido versions
  const selectors = [
    // Current/updated Caido selectors based on latest version
    '.bg-surface-900[role="menuitem"]', // Based on the screenshot showing bg-surface-900 class
    '[aria-current="page"]', // ARIA current page indicator
    '[data-is-selected="true"]', // Generic selected item
    // More specific sidebar selectors
    'nav [role="menuitem"].bg-surface-900', // Navigation menu item with bg-surface-900
    '.sidebar [role="menuitem"][aria-current="page"]', // Sidebar navigation
    // Legacy selectors for backwards compatibility
    '.c-sidebar-item[data-is-active="true"] .c-sidebar__label',
    '.c-sidebar-item[data-is-active="true"]',
    // Alternative selectors
    '.c-sidebar__item--active .c-sidebar__label',
    '.c-sidebar__item--active'
  ];
  
  for (const selector of selectors) {
    try {
      const activeTab = document.querySelector(selector);
      if (activeTab && activeTab.textContent && activeTab.textContent.trim()) {
        const tabText = activeTab.textContent.trim();
        // Filter out empty or invalid tab names
        if (tabText.length > 0 && !tabText.includes('undefined')) {
          console.log(`Chatio Debug: Found tab "${tabText}" using selector: ${selector}`);
          return tabText;
        }
      }
    } catch (error) {
      // Continue to next selector if this one fails
      continue;
    }
  }
  
  // Enhanced fallback detection
  try {
    // Check URL patterns
    const url = window.location.href;
    if (url.includes('replay')) return 'Replay';
    if (url.includes('history')) return 'HTTP History';  
    if (url.includes('intercept')) return 'Intercept';
    if (url.includes('scope')) return 'Scope';
    
    // Check for specific page indicators in the DOM
    const pageIndicators = [
      { selector: '.replay-container, [data-testid*="replay"], .c-replay', tab: 'Replay' },
      { selector: '.history-container, [data-testid*="history"], .c-history', tab: 'HTTP History' },
      { selector: '.intercept-container, [data-testid*="intercept"], .c-intercept', tab: 'Intercept' },
      { selector: '.scope-container, [data-testid*="scope"], .c-scope', tab: 'Scope' }
    ];
    
    for (const indicator of pageIndicators) {
      if (document.querySelector(indicator.selector)) {
        console.log(`Chatio Debug: Detected tab "${indicator.tab}" via DOM indicator`);
        return indicator.tab;
      }
    }
    
    // Try to find any element with text that matches known tab names
    const allElements = document.querySelectorAll('*');
    const knownTabs = ['Replay', 'HTTP History', 'Intercept', 'Scope', 'Files', 'Automate'];
    
    for (const element of allElements) {
      const text = element.textContent?.trim();
      if (text && knownTabs.includes(text)) {
        // Check if this element looks like an active tab (has certain classes or attributes)
        if (element.classList.contains('bg-surface-900') || 
            element.getAttribute('aria-current') === 'page' ||
            element.getAttribute('data-is-selected') === 'true') {
          console.log(`Chatio Debug: Found active tab "${text}" via text matching`);
          return text;
        }
      }
    }
  } catch (error) {
    console.warn('Chatio: Failed to detect current tab:', error);
  }
  
  console.warn('Chatio: Could not detect current tab');
  return "";
};

// Get currently selected replay tab
export const getCurrentlySelectedReplayTab = () => {
  const activeTab = document.querySelector(
    '.c-tab-list__tab [data-is-selected="true"]',
  );
  return activeTab ? activeTab.textContent : "";
};

// Get currently selected replay tab session ID
export const getCurrentlySelectedReplayTabSessionId = () => {
  const activeTab = document.querySelector(
    '.c-tab-list__tab [data-is-selected="true"]',
  );
  return activeTab ? activeTab.getAttribute("data-session-id") : "";
};





// Quick action functions for manipulating requests
export const QuickActionFunctions = {
  // Replace entire request content
  replaceRequestContent: (content: string) => {
    const { requestEditor } = getCurrentReplayEditors();
    if (requestEditor) {
      requestEditor.dispatch({
        changes: { from: 0, to: requestEditor.state.doc.length, insert: content }
      });
      requestEditor.focus();
      return true;
    }
    
    // Try intercept tab as fallback
    const { requestEditor: interceptEditor } = getCurrentInterceptEditors();
    if (interceptEditor) {
      interceptEditor.dispatch({
        changes: { from: 0, to: interceptEditor.state.doc.length, insert: content }
      });
      interceptEditor.focus();
      return true;
    }
    
    return false;
  },

  // Replace request body only
  replaceRequestBody: (body: string) => {
    const { requestEditor } = getCurrentReplayEditors();
    if (!requestEditor) {
      // Try intercept tab as fallback
      const { requestEditor: interceptEditor } = getCurrentInterceptEditors();
      if (!interceptEditor) return false;
      return QuickActionFunctions._replaceBodyInEditor(interceptEditor, body);
    }
    
    return QuickActionFunctions._replaceBodyInEditor(requestEditor, body);
  },

  // Helper function to replace body in specific editor
  _replaceBodyInEditor: (editor: any, body: string) => {
    const lines = editor.state.doc.toJSON();
    let bodyStartIndex = 0;
    
    // Find first empty line which delimits headers from body
    for (let i = 0; i < lines.length; i++) {
      if (lines[i] === '') {
        bodyStartIndex = i;
        break;
      }
    }

    // Calculate the character position where body starts
    const bodyStartPos = lines.slice(0, bodyStartIndex + 1).join('\n').length + 1;
    
    // Replace everything after headers with new body
    editor.dispatch({
      changes: {
        from: bodyStartPos,
        to: editor.state.doc.length,
        insert: body
      }
    });
    editor.focus();
    return true;
  },

  // Add or update header
  addOrUpdateHeader: (header: string, replace: boolean = true) => {
    const { requestEditor } = getCurrentReplayEditors();
    if (!requestEditor) {
      // Try intercept tab as fallback
      const { requestEditor: interceptEditor } = getCurrentInterceptEditors();
      if (!interceptEditor) return false;
      return QuickActionFunctions._addHeaderToEditor(interceptEditor, header, replace);
    }
    
    return QuickActionFunctions._addHeaderToEditor(requestEditor, header, replace);
  },

  // Helper function to add header to specific editor
  _addHeaderToEditor: (editor: any, header: string, replace: boolean) => {
    const lines = editor.state.doc.toJSON();
    const headerName = header.split(':')[0].trim().toLowerCase();
    
    // Find where headers end (first empty line)
    let headerEndIndex = 0;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i] === '') {
        headerEndIndex = i;
        break;
      }
    }
    
    // If replace is true, remove existing header if it exists and add new one in its place
    if (replace) {
      for (let i = 0; i < headerEndIndex; i++) {
        if (lines[i].toLowerCase().startsWith(headerName + ':')) {
          // Replace the existing header
          const startOfLine = lines.slice(0, i).join('\n').length + (i > 0 ? 1 : 0);
          const endOfLine = startOfLine + lines[i].length;
          editor.dispatch({
            changes: { from: startOfLine, to: endOfLine, insert: header }
          });
          editor.focus();
          return true;
        }
      }
    }
    
    // If no existing header was found or replace is false, add at end of headers
    const insertPos = lines.slice(0, headerEndIndex).join('\n').length;
    const prefix = headerEndIndex > 0 ? '\r\n' : '';
    editor.dispatch({
      changes: { from: insertPos, insert: prefix + header }
    });
    editor.focus();
    return true;
  },

  // Change request method
  changeRequestMethod: (method: string) => {
    const { requestEditor } = getCurrentReplayEditors();
    if (!requestEditor) {
      // Try intercept tab as fallback
      const { requestEditor: interceptEditor } = getCurrentInterceptEditors();
      if (!interceptEditor) return false;
      return QuickActionFunctions._changeMethodInEditor(interceptEditor, method);
    }
    
    return QuickActionFunctions._changeMethodInEditor(requestEditor, method);
  },

  // Helper function to change method in specific editor
  _changeMethodInEditor: (editor: any, method: string) => {
    const lines = editor.state.doc.toJSON();
    if (lines.length === 0) return false;
    
    const firstLine = lines[0];
    const parts = firstLine.split(' ');
    if (parts.length < 2) return false;
    
    // Replace method (first part) with new method
    parts[0] = method.toUpperCase();
    const newFirstLine = parts.join(' ');
    
    // Calculate end position of first line
    const endOfFirstLine = firstLine.length;
    
    editor.dispatch({
      changes: { from: 0, to: endOfFirstLine, insert: newFirstLine }
    });
    editor.focus();
    return true;
  },

  // Remove all headers
  removeAllHeaders: () => {
    const { requestEditor } = getCurrentReplayEditors();
    if (!requestEditor) {
      // Try intercept tab as fallback
      const { requestEditor: interceptEditor } = getCurrentInterceptEditors();
      if (!interceptEditor) return false;
      return QuickActionFunctions._removeHeadersFromEditor(interceptEditor);
    }
    
    return QuickActionFunctions._removeHeadersFromEditor(requestEditor);
  },

  // Helper function to remove headers from specific editor
  _removeHeadersFromEditor: (editor: any) => {
    const lines = editor.state.doc.toJSON();
    if (lines.length === 0) return false;
    
    // Find where headers end (first empty line or end of request)
    let headerEndIndex = lines.length;
    for (let i = 1; i < lines.length; i++) { // Start from 1 to skip first line (method)
      if (lines[i] === '') {
        headerEndIndex = i;
        break;
      }
    }
    
    if (headerEndIndex <= 1) return false; // No headers to remove
    
    // Keep first line (method) and everything after empty line
    const firstLine = lines[0];
    const restOfContent = headerEndIndex < lines.length ? lines.slice(headerEndIndex).join('\n') : '';
    const newContent = firstLine + '\n' + restOfContent;
    
    editor.dispatch({
      changes: { from: 0, to: editor.state.doc.length, insert: newContent }
    });
    editor.focus();
    return true;
  }
};



// Helper function to get the active request editor
export const getRequestEditor = () => {
  // Try Replay tab first
  const { requestEditor: replayEditor } = getCurrentReplayEditors();
  if (replayEditor) return replayEditor;
  
  // Try Intercept tab
  const { requestEditor: interceptEditor } = getCurrentInterceptEditors();
  if (interceptEditor) return interceptEditor;
  
  // Try HTTP History tab
  const { requestEditor: historyEditor } = getCurrentHttpHistoryEditors();
  if (historyEditor) return historyEditor;
  
  return null;
};

// Check if user is currently in an editable tab (Replay, Intercept, HTTP History, Scope, Files, etc.)
export function isInEditableTab(): boolean {
  try {
    const sidebarTab = getCurrentSidebarTab();
    
    // Debug logging to help troubleshoot
    console.log('Chatio Debug: Current detected tab:', sidebarTab);
    
    // List of all editable/actionable tabs where Quick Actions should be available
    const editableTabs = [
      "Replay", 
      "Intercept", 
      "HTTP History", 
      "Scope", 
      "Scopes",  // Alternative name
      "Files", 
      "Match & Replace",
      "Filters",  // Added for HTTP History filters
      "Filter",   // Alternative name
      "Workflows",
      "Search",
      "Automate"  // Most important editable tab!
    ];
    
    // Allow Quick Actions on all editable tabs
    if (editableTabs.includes(sidebarTab)) {
      console.log('Chatio Debug: Tab is editable, allowing QuickActions');
      return true;
    }
    
    // Additional fallback detection for common tabs
    if (!sidebarTab || sidebarTab === "") {
      console.warn('Chatio Debug: No tab detected, checking DOM for common tab indicators');
      
      // Check if we're in common editable areas by looking for specific DOM elements
      const replayIndicator = document.querySelector('[data-testid*="replay"], .replay-container, .c-replay');
      const historyIndicator = document.querySelector('[data-testid*="history"], .history-container, .c-history');
      const interceptIndicator = document.querySelector('[data-testid*="intercept"], .intercept-container, .c-intercept');
      
      if (replayIndicator || historyIndicator || interceptIndicator) {
        console.log('Chatio Debug: Found editable area indicator, allowing QuickActions');
        return true;
      }
    }
    
    console.log('Chatio Debug: Tab not recognized as editable:', sidebarTab);
    return false;
  } catch (error) {
    console.error('Chatio: Error checking editable tab:', error);
    return false;
  }
}

// Get current request content from the active editor
export function getCurrentRequestContent(): string {
  try {
    const editor = getRequestEditor();
    if (editor && editor.state && editor.state.doc) {
      return editor.state.doc.toString();
    }
    return '';
  } catch (error) {
    console.error('Error getting current request content:', error);
    return '';
  }
}

// Wrapper functions for QuickActionFunctions to maintain compatibility
export function changeRequestMethod(method: string): boolean {
  return QuickActionFunctions.changeRequestMethod(method);
}

export function addOrUpdateHeader(name: string, value: string): boolean {
  const header = `${name}: ${value}`;
  return QuickActionFunctions.addOrUpdateHeader(header, true);
}

export function removeAllHeaders(): boolean {
  return QuickActionFunctions.removeAllHeaders();
}

export function changeRequestBody(body: string): boolean {
  return QuickActionFunctions.replaceRequestBody(body);
}

// Add URL parameters to the request
export function addUrlParameters(params: { [key: string]: string }): boolean {
  try {
    const editor = getRequestEditor();
    if (!editor || !editor.state || !editor.state.doc) return false;
    
    const lines = editor.state.doc.toJSON();
    if (lines.length === 0) return false;
    
    const firstLine = lines[0];
    const parts = firstLine.split(' ');
    if (parts.length < 2) return false;
    
    const method = parts[0];
    let url = parts[1];
    const protocol = parts.slice(2).join(' ');
    
    // Parse existing URL
    const urlParts = url.split('?');
    const basePath = urlParts[0];
    const existingParams = urlParts[1] || '';
    
    // Create URLSearchParams object
    const searchParams = new URLSearchParams(existingParams);
    
    // Add new parameters
    Object.entries(params).forEach(([key, value]) => {
      searchParams.set(key, value);
    });
    
    // Reconstruct URL
    const newUrl = basePath + (searchParams.toString() ? '?' + searchParams.toString() : '');
    const newFirstLine = [method, newUrl, protocol].join(' ');
    
    // Update the first line
    const endOfFirstLine = firstLine.length;
    editor.dispatch({
      changes: { from: 0, to: endOfFirstLine, insert: newFirstLine }
    });
    editor.focus();
    return true;
  } catch (error) {
    console.error('Error adding URL parameters:', error);
    return false;
  }
}

// Execute quick action based on AI response
export async function executeQuickAction(sdk: any, command: string, context?: string) {
  try {
    // Call backend directly - it will handle AI provider fallbacks
    const response = await sdk.backend.executeQuickAction(command, context || '');
    
    if (!response || !response.action) {
      throw new Error('Invalid response from AI');
    }
    
    // Execute the action based on the response
    let result = false;
    switch (response.action) {
      case 'change_method':
        if (response.method) {
          result = changeRequestMethod(response.method.toUpperCase());
        }
        break;
        
      case 'add_header':
        if (response.header && response.value) {
          result = addOrUpdateHeader(response.header, response.value);
        }
        break;
        
      case 'remove_headers':
        result = removeAllHeaders();
        break;
        
      case 'change_body':
        if (response.body !== undefined) {
          result = changeRequestBody(response.body);
        }
        break;
        
      case 'remove_body':
        result = changeRequestBody('');
        break;
        
      default:
        throw new Error(`Unknown action: ${response.action}`);
    }
    
    if (!result) {
      throw new Error('Failed to execute action on request editor');
    }
    
    return { success: true, message: response.message || 'Action executed successfully' };
  } catch (error) {
    console.error('Execute quick action error:', error);
    throw error;
  }
} 