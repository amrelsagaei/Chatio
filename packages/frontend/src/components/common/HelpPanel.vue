<template>
  <div class="chatio-help-panel">
    <div class="chatio-settings-content">
      <!-- Getting Started Guide and API Keys Setup Grid -->
      <div class="chatio-settings-grid">
        <!-- Getting Started Guide - 100% width with 2x2 grid layout -->
        <div class="chatio-settings-section" style="grid-column: 1 / -1;">
          <div class="chatio-settings-header">
            <h3 class="chatio-settings-title"><i class="fas fa-rocket mr-2"></i>Getting Started Guide</h3>
            <p class="chatio-settings-desc">Complete setup and first steps to master Chatio</p>
          </div>
          <div class="chatio-settings-body">
            <!-- Steps arranged in 2x2 grid with exact 50% width -->
            <div class="grid grid-cols-2 gap-6">
              <!-- Step 1 - First row, first column (50%) -->
              <div class="chatio-welcome-card">
                <h4 class="font-medium mb-4 flex items-center text-primary">
                  <div class="flex items-center mr-3">
                    <div class="w-1 h-8 bg-gradient-to-b from-primary to-primary/80 rounded-full mr-3"></div>
                    <span class="text-primary font-bold text-lg">01</span>
                  </div>
                  Configure Your First AI Provider
                </h4>
                <div class="grid grid-cols-1 gap-4 text-sm text-secondary">
                  <div>
                    <p class="mb-3 font-medium"><strong>Recommended for Beginners:</strong></p>
                    <div class="space-y-2">
                      <div class="flex items-center">
                        <i class="fab fa-google mr-3 text-primary"></i>
                        <span><strong>Google Gemini</strong> - Free tier available</span>
                      </div>
                      <div class="flex items-center">
                        <i class="fas fa-server mr-3 text-primary"></i>
                        <span><strong>Local LLMs</strong> - Completely free & private</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p class="mb-3 font-medium"><strong>For Professional Use:</strong></p>
                    <div class="space-y-2">
                      <div class="flex items-center">
                        <i class="fas fa-brain mr-3 text-primary"></i>
                        <span><strong>OpenAI GPT-4o</strong> - Best overall performance</span>
                      </div>
                      <div class="flex items-center">
                        <i class="fas fa-robot mr-3 text-primary"></i>
                        <span><strong>Claude 3.5 Sonnet</strong> - Great for code analysis</span>
                      </div>
                    </div>
            </div>
          </div>
        </div>

              <!-- Step 2 - First row, second column (50%) -->
              <div class="chatio-welcome-card">
                <h4 class="font-medium mb-4 flex items-center text-primary">
                  <div class="flex items-center mr-3">
                    <div class="w-1 h-8 bg-gradient-to-b from-primary to-primary/80 rounded-full mr-3"></div>
                    <span class="text-primary font-bold text-lg">02</span>
                  </div>
                  Configure Settings for Optimal Performance
                </h4>
                <div class="space-y-4 text-sm text-secondary">
                  <div>
                    <strong class="flex items-center mb-2">
                      <i class="fas fa-terminal mr-2 text-primary"></i>
                      System Prompt:
                    </strong>
                    <p>Set a custom system prompt for your specific needs (e.g., "You are a penetration testing expert...")</p>
                  </div>
                  <div>
                    <strong class="flex items-center mb-2">
                      <i class="fas fa-comments mr-2 text-primary"></i>
                      Context Messages:
                    </strong>
                    <p>Set to 15-20 messages for good context without high costs</p>
                  </div>
                  <div>
                    <strong class="flex items-center mb-2">
                      <i class="fas fa-save mr-2 text-primary"></i>
                      Auto-save:
                    </strong>
                    <p>Keep enabled to automatically save your conversation history</p>
                  </div>
                </div>
              </div>
              
              <!-- Step 3 - Second row, first column (50%) -->
              <div class="chatio-welcome-card">
                <h4 class="font-medium mb-4 flex items-center text-primary">
                  <div class="flex items-center mr-3">
                    <div class="w-1 h-8 bg-gradient-to-b from-primary to-primary/80 rounded-full mr-3"></div>
                    <span class="text-primary font-bold text-lg">03</span>
                  </div>
                  Start Your First Security Analysis
                </h4>
                <div class="grid grid-cols-1 gap-4 text-sm text-secondary">
                  <div>
                    <strong class="flex items-center mb-3">
                      <i class="fas fa-graduation-cap mr-2 text-primary"></i>
                      For Beginners:
                    </strong>
                    <ul class="space-y-1 ml-4">
                      <li class="flex items-start"><i class="fas fa-circle text-xs mt-2 mr-2 text-primary/50"></i>Ask general security questions</li>
                      <li class="flex items-start"><i class="fas fa-circle text-xs mt-2 mr-2 text-primary/50"></i>Request explanations of concepts</li>
                      <li class="flex items-start"><i class="fas fa-circle text-xs mt-2 mr-2 text-primary/50"></i>Learn about common vulnerabilities</li>
                    </ul>
                  </div>
                  <div>
                    <strong class="flex items-center mb-3">
                      <i class="fas fa-user-tie mr-2 text-primary"></i>
                      For Experienced Users:
                    </strong>
                    <ul class="space-y-1 ml-4">
                      <li class="flex items-start"><i class="fas fa-circle text-xs mt-2 mr-2 text-primary/50"></i>Upload code files for security review</li>
                      <li class="flex items-start"><i class="fas fa-circle text-xs mt-2 mr-2 text-primary/50"></i>Share screenshots for visual analysis</li>
                      <li class="flex items-start"><i class="fas fa-circle text-xs mt-2 mr-2 text-primary/50"></i>Describe specific attack scenarios</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <!-- Step 4 - Second row, second column (50%) -->
              <div class="chatio-welcome-card">
                <h4 class="font-medium mb-4 flex items-center text-primary">
                  <div class="flex items-center mr-3">
                    <div class="w-1 h-8 bg-gradient-to-b from-primary to-primary/80 rounded-full mr-3"></div>
                    <span class="text-primary font-bold text-lg">04</span>
                  </div>
                  Master Advanced Features
                </h4>
                <div class="space-y-4 text-sm text-secondary">
                  <div>
                    <strong class="flex items-center mb-3">
                      <i class="fas fa-bullseye mr-2 text-primary"></i>
                      Targeting Your Prompts:
                    </strong>
                    <ul class="space-y-1">
                      <li class="flex items-start"><i class="fas fa-chevron-right text-xs mt-1 mr-2 text-primary/50"></i>Include target information (OS, technology stack)</li>
                      <li class="flex items-start"><i class="fas fa-chevron-right text-xs mt-1 mr-2 text-primary/50"></i>Specify your testing scope and objectives</li>
                    </ul>
                  </div>
                  <div>
                    <strong class="flex items-center mb-3">
                      <i class="fas fa-file-upload mr-2 text-primary"></i>
                      File & Image Analysis:
                    </strong>
                    <ul class="space-y-1">
                      <li class="flex items-start"><i class="fas fa-chevron-right text-xs mt-1 mr-2 text-primary/50"></i>Upload code files for security review</li>
                      <li class="flex items-start"><i class="fas fa-chevron-right text-xs mt-1 mr-2 text-primary/50"></i>Share network diagrams for analysis</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- API Keys Setup Guide - 100% width with structured rows -->
        <div class="chatio-settings-section" style="grid-column: 1 / -1;">
          <div class="chatio-settings-header">
            <h3 class="chatio-settings-title"><i class="fas fa-key mr-2"></i>API Keys Setup Guide</h3>
            <p class="chatio-settings-desc">Complete step-by-step guide to obtain API keys for all supported providers</p>
          </div>
          <div class="chatio-settings-body">
            <!-- API Keys in 2x2 grid: OpenAI, Anthropic, Google Gemini, DeepSeek (50% each) -->
            <div class="grid grid-cols-2 gap-4 mb-4">
              <!-- OpenAI API Key Guide - 50% width -->
              <div class="chatio-welcome-card relative overflow-hidden">
                <div class="absolute top-0 right-0 w-16 h-16 bg-primary/10 rounded-bl-3xl"></div>
                <div class="flex items-center mb-3">
                  <div class="w-10 h-10 bg-primary rounded-xl flex items-center justify-center mr-3 shadow-lg">
                    <i class="chatio-openai-icon text-white text-lg"></i>
                  </div>
                  <h4 class="font-semibold text-lg text-primary">OpenAI</h4>
                </div>
                <div class="space-y-3 text-sm text-secondary">
                  <div class="bg-primary/5 p-3 rounded-lg">
                    <strong>Step 1:</strong> Visit <a href="https://platform.openai.com" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">platform.openai.com</a> and sign up/login
                  </div>
                  <div class="bg-primary/5 p-3 rounded-lg">
                    <strong>Step 2:</strong> Navigate to API section → API Keys
                  </div>
                  <div class="bg-primary/5 p-3 rounded-lg">
                    <strong>Step 3:</strong> Click "Create new secret key" and copy it
                  </div>
                  <div class="bg-primary/5 p-3 rounded-lg">
                    <strong>Step 4:</strong> Add billing information (required for usage)
                  </div>
                  <div class="mt-3 p-3 bg-amber-100 rounded-lg border border-amber-300">
                    <strong class="text-amber-900"><i class="fas fa-dollar-sign mr-2 text-amber-800"></i>Pricing:</strong> <span class="text-amber-900">Pay-per-use (~$0.002/1K tokens for GPT-3.5, ~$0.03/1K for GPT-4)</span>
                  </div>
                  <div class="mt-2 p-3 bg-amber-200 rounded-lg border border-amber-400">
                    <strong class="text-amber-900"><i class="fas fa-gift mr-2 text-amber-900"></i>Free Trial:</strong> <span class="text-amber-900">$5 credit for new accounts (expires after 3 months)</span>
                  </div>
                </div>
              </div>

              <!-- Anthropic API Key Guide - 50% width -->
              <div class="chatio-welcome-card relative overflow-hidden">
                <div class="absolute top-0 right-0 w-16 h-16 bg-primary/10 rounded-bl-3xl"></div>
                <div class="flex items-center mb-3">
                  <div class="w-10 h-10 bg-primary rounded-xl flex items-center justify-center mr-3 shadow-lg">
                    <i class="chatio-anthropic-icon text-white text-lg"></i>
                  </div>
                  <h4 class="font-semibold text-lg text-primary">Anthropic Claude</h4>
                </div>
                <div class="space-y-3 text-sm text-secondary">
                  <div class="bg-primary/5 p-3 rounded-lg">
                    <strong>Step 1:</strong> Go to <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">console.anthropic.com</a> and create account
                  </div>
                  <div class="bg-primary/5 p-3 rounded-lg">
                    <strong>Step 2:</strong> Navigate to API Keys section
                  </div>
                  <div class="bg-primary/5 p-3 rounded-lg">
                    <strong>Step 3:</strong> Click "Create Key" and name it
                  </div>
                  <div class="bg-primary/5 p-3 rounded-lg">
                    <strong>Step 4:</strong> Copy the generated key (starts with 'sk-ant-')
                  </div>
                  <div class="mt-3 p-3 bg-amber-100 rounded-lg border border-amber-300">
                    <strong class="text-amber-900"><i class="fas fa-dollar-sign mr-2 text-amber-800"></i>Pricing:</strong> <span class="text-amber-900">Pay-per-use (~$0.008/1K tokens for Haiku, ~$0.025/1K for Sonnet)</span>
                  </div>
                  <div class="mt-2 p-3 bg-amber-200 rounded-lg border border-amber-400">
                    <strong class="text-amber-900"><i class="fas fa-gift mr-2 text-amber-900"></i>Free Trial:</strong> <span class="text-amber-900">$5 credit for new accounts</span>
                  </div>
                </div>
              </div>

              <!-- Google Gemini API Key Guide - 50% width -->
              <div class="chatio-welcome-card relative overflow-hidden">
                <div class="absolute top-0 right-0 w-16 h-16 bg-primary/10 rounded-bl-3xl"></div>
                <div class="flex items-center mb-3">
                  <div class="w-10 h-10 bg-primary rounded-xl flex items-center justify-center mr-3 shadow-lg">
                    <i class="chatio-google-icon text-white text-lg"></i>
                  </div>
                  <h4 class="font-semibold text-lg text-primary">Google Gemini</h4>
                </div>
                <div class="space-y-3 text-sm text-secondary">
                  <div class="bg-primary/5 p-3 rounded-lg">
                    <strong>Step 1:</strong> Visit <a href="https://aistudio.google.com" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">aistudio.google.com</a> and sign in with Google
                  </div>
                  <div class="bg-primary/5 p-3 rounded-lg">
                    <strong>Step 2:</strong> Click "Get API key" in the left sidebar
                  </div>
                  <div class="bg-primary/5 p-3 rounded-lg">
                    <strong>Step 3:</strong> Create new API key or use existing project
                  </div>
                  <div class="bg-primary/5 p-3 rounded-lg">
                    <strong>Step 4:</strong> Copy the generated key (starts with 'AIza')
                  </div>
                  <div class="mt-3 p-3 bg-amber-200 rounded-lg border border-amber-400">
                    <strong class="text-amber-900"><i class="fas fa-unlock mr-2 text-amber-900"></i>Free Tier:</strong> <span class="text-amber-900">15 requests/min, 1M tokens/min, 1.5K requests/day</span>
                  </div>
                  <div class="mt-2 p-3 bg-amber-100 rounded-lg border border-amber-300">
                    <strong class="text-amber-900"><i class="fas fa-dollar-sign mr-2 text-amber-800"></i>Paid:</strong> <span class="text-amber-900">$0.125-$2.50/1M tokens depending on model</span>
                  </div>
                </div>
              </div>
              
              <!-- DeepSeek API Key Guide - 50% width -->
              <div class="chatio-welcome-card relative overflow-hidden">
                <div class="absolute top-0 right-0 w-16 h-16 bg-primary/10 rounded-bl-3xl"></div>
                <div class="flex items-center mb-3">
                  <div class="w-10 h-10 bg-primary rounded-xl flex items-center justify-center mr-3 shadow-lg">
                    <i class="chatio-deepseek-icon text-white text-lg"></i>
                  </div>
                  <h4 class="font-semibold text-lg text-primary">DeepSeek</h4>
                </div>
                <div class="space-y-3 text-sm text-secondary">
                  <div class="bg-primary/5 p-3 rounded-lg">
                    <strong>Step 1:</strong> Go to <a href="https://platform.deepseek.com" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">platform.deepseek.com</a> and register
                  </div>
                  <div class="bg-primary/5 p-3 rounded-lg">
                    <strong>Step 2:</strong> Verify your email and phone number
                  </div>
                  <div class="bg-primary/5 p-3 rounded-lg">
                    <strong>Step 3:</strong> Navigate to API Keys section
                  </div>
                  <div class="bg-primary/5 p-3 rounded-lg">
                    <strong>Step 4:</strong> Create new key and copy it
                  </div>
                  <div class="mt-3 p-3 bg-amber-200 rounded-lg border border-amber-400">
                    <strong class="text-amber-900"><i class="fas fa-gift mr-2 text-amber-900"></i>Free Credits:</strong> <span class="text-amber-900">$5 credit for new users</span>
                  </div>
                  <div class="mt-2 p-3 bg-amber-100 rounded-lg border border-amber-300">
                    <strong class="text-amber-900"><i class="fas fa-dollar-sign mr-2 text-amber-800"></i>Pricing:</strong> <span class="text-amber-900">Very competitive rates (~$0.0014/1M tokens)</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Local LLM Setup Guide - 100% Width -->
            <div class="chatio-welcome-card relative overflow-hidden mb-4">
              <div class="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-bl-3xl"></div>
              <div class="flex items-center mb-4">
                <div class="w-10 h-10 bg-primary rounded-xl flex items-center justify-center mr-3 shadow-lg">
                  <i class="fas fa-server text-white text-lg"></i>
                </div>
                <h4 class="font-semibold text-xl text-primary">Local LLM Setup (Ollama)</h4>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-secondary">
                <div class="space-y-3">
                  <h5 class="font-medium text-primary">Installation</h5>
                  <div class="bg-primary/5 p-3 rounded-lg">
                    <strong>Step 1:</strong> Download Ollama from <a href="https://ollama.ai" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">ollama.ai</a>
                  </div>
                  <div class="bg-primary/5 p-3 rounded-lg">
                    <strong>Step 2:</strong> Install and start the service
                  </div>
                  <div class="bg-primary/5 p-3 rounded-lg">
                    <strong>Step 3:</strong> Default runs on <code>localhost:11434</code>
                  </div>
                </div>
                <div class="space-y-3">
                  <h5 class="font-medium text-primary">Popular Models</h5>
                  <div class="space-y-1">
                    <div class="flex items-center justify-between bg-primary/5 p-2 rounded">
                      <code class="text-xs">ollama pull llama3.2</code>
                      <button @click="copyToClipboard('ollama pull llama3.2')" class="ml-2 text-xs text-amber-600 transition-colors">
                        <i class="fas fa-copy"></i>
                      </button>
                    </div>
                    <div class="flex items-center justify-between bg-primary/5 p-2 rounded">
                      <code class="text-xs">ollama pull mistral</code>
                      <button @click="copyToClipboard('ollama pull mistral')" class="ml-2 text-xs text-amber-600 transition-colors">
                        <i class="fas fa-copy"></i>
                      </button>
                    </div>
                    <div class="flex items-center justify-between bg-primary/5 p-2 rounded">
                      <code class="text-xs">ollama pull codellama</code>
                      <button @click="copyToClipboard('ollama pull codellama')" class="ml-2 text-xs text-amber-600 transition-colors">
                        <i class="fas fa-copy"></i>
                      </button>
                    </div>
                    <div class="flex items-center justify-between bg-primary/5 p-2 rounded">
                      <code class="text-xs">ollama pull llava</code>
                      <button @click="copyToClipboard('ollama pull llava')" class="ml-2 text-xs text-amber-600 transition-colors">
                        <i class="fas fa-copy"></i>
                      </button>
                    </div>
                    <div class="flex items-center justify-between bg-primary/5 p-2 rounded">
                      <code class="text-xs">ollama pull qwen2.5-coder</code>
                      <button @click="copyToClipboard('ollama pull qwen2.5-coder')" class="ml-2 text-xs text-amber-600 transition-colors">
                        <i class="fas fa-copy"></i>
                      </button>
                    </div>
                  </div>
                </div>
                <div class="space-y-3">
                  <h5 class="font-medium text-primary">Benefits</h5>
                  <ul class="space-y-1">
                    <li>• 100% Free to use</li>
                    <li>• Complete privacy</li>
                    <li>• No API limits</li>
                    <li>• Works offline</li>
                    <li>• Multiple model support</li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- API Security Best Practices - 100% Width -->
            <div class="p-6 bg-amber-100 rounded-lg border border-amber-300 shadow-sm">
              <h4 class="font-medium mb-4 flex items-center text-primary">
                <i class="fas fa-shield-alt mr-3 text-amber-800"></i>
                <i class="fas fa-lock mr-2 text-amber-800"></i>
                API Security Best Practices
              </h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-800">
                <ul class="space-y-2">
                  <li class="flex items-start"><i class="fas fa-check-circle mr-3 text-amber-700 mt-0.5"></i>Never share your API keys publicly</li>
                  <li class="flex items-start"><i class="fas fa-check-circle mr-3 text-amber-700 mt-0.5"></i>Store keys securely (Chatio uses local storage)</li>
                  <li class="flex items-start"><i class="fas fa-check-circle mr-3 text-amber-700 mt-0.5"></i>Monitor your API usage and billing</li>
                  <li class="flex items-start"><i class="fas fa-check-circle mr-3 text-amber-700 mt-0.5"></i>Set usage limits in provider dashboards</li>
                </ul>
                <ul class="space-y-2">
                  <li class="flex items-start"><i class="fas fa-check-circle mr-3 text-amber-700 mt-0.5"></i>Rotate keys periodically for security</li>
                  <li class="flex items-start"><i class="fas fa-check-circle mr-3 text-amber-700 mt-0.5"></i>Use different keys for different applications</li>
                  <li class="flex items-start"><i class="fas fa-check-circle mr-3 text-amber-700 mt-0.5"></i>Enable billing alerts to avoid surprises</li>
                  <li class="flex items-start"><i class="fas fa-check-circle mr-3 text-amber-700 mt-0.5"></i>Review API access logs regularly</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Features and Troubleshooting Grid -->
      <div class="chatio-settings-grid">
        <!-- Features Overview -->
        <div class="chatio-settings-section">
          <div class="chatio-settings-header">
            <h3 class="chatio-settings-title"><i class="fas fa-shield-alt mr-2"></i>What Chatio Can Help You With</h3>
            <p class="chatio-settings-desc">Comprehensive security testing assistance</p>
          </div>
          <div class="chatio-settings-body">
            <div class="space-y-4">
              <div class="flex items-start gap-3">
                <div class="w-10 h-10 bg-primary rounded-xl flex items-center justify-center flex-shrink-0 mt-1 shadow-lg">
                  <i class="fas fa-bug text-white text-sm"></i>
                </div>
                <div>
                  <h4 class="font-medium text-primary">Vulnerability Analysis</h4>
                  <p class="text-sm text-secondary">Deep dive into OWASP Top 10, zero-days, and custom vulnerability research with exploitation techniques and impact assessment.</p>
                </div>
              </div>
              
              <div class="flex items-start gap-3">
                <div class="w-10 h-10 bg-primary rounded-xl flex items-center justify-center flex-shrink-0 mt-1 shadow-lg">
                  <i class="fas fa-code text-white text-sm"></i>
                </div>
                <div>
                  <h4 class="font-medium text-primary">Secure Code Review</h4>
                  <p class="text-sm text-secondary">Analyze source code for security flaws, suggest fixes, and understand complex attack vectors across multiple programming languages.</p>
                </div>
              </div>
              
              <div class="flex items-start gap-3">
                <div class="w-10 h-10 bg-primary rounded-xl flex items-center justify-center flex-shrink-0 mt-1 shadow-lg">
                  <i class="fas fa-search text-white text-sm"></i>
                </div>
                <div>
                  <h4 class="font-medium text-primary">Reconnaissance & OSINT</h4>
                  <p class="text-sm text-secondary">Guidance on information gathering, target profiling, social media analysis, and advanced reconnaissance methodologies.</p>
                </div>
              </div>
              
              <div class="flex items-start gap-3">
                <div class="w-10 h-10 bg-primary rounded-xl flex items-center justify-center flex-shrink-0 mt-1 shadow-lg">
                  <i class="fas fa-network-wired text-white text-sm"></i>
                </div>
                <div>
                  <h4 class="font-medium text-primary">Network Penetration Testing</h4>
                  <p class="text-sm text-secondary">Complete network assessment strategies, from port scanning to privilege escalation and lateral movement techniques.</p>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <div class="w-10 h-10 bg-primary rounded-xl flex items-center justify-center flex-shrink-0 mt-1 shadow-lg">
                  <i class="fas fa-mobile-alt text-white text-sm"></i>
                </div>
                <div>
                  <h4 class="font-medium text-primary">Mobile & API Security</h4>
                  <p class="text-sm text-secondary">iOS/Android app testing, API security assessment, and modern mobile attack vectors including runtime manipulation.</p>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <div class="w-10 h-10 bg-primary rounded-xl flex items-center justify-center flex-shrink-0 mt-1 shadow-lg">
                  <i class="fas fa-cloud text-white text-sm"></i>
                </div>
                <div>
                  <h4 class="font-medium text-primary">Cloud Security</h4>
                  <p class="text-sm text-secondary">AWS, Azure, GCP security assessments, container security, serverless vulnerabilities, and cloud misconfigurations.</p>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <div class="w-10 h-10 bg-primary rounded-xl flex items-center justify-center flex-shrink-0 mt-1 shadow-lg">
                  <i class="fas fa-user-secret text-white text-sm"></i>
                </div>
                <div>
                  <h4 class="font-medium text-primary">Social Engineering</h4>
                  <p class="text-sm text-secondary">Phishing campaign design, pretexting strategies, physical security testing, and human psychology attack vectors.</p>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <div class="w-10 h-10 bg-primary rounded-xl flex items-center justify-center flex-shrink-0 mt-1 shadow-lg">
                  <i class="fas fa-cogs text-white text-sm"></i>
                </div>
                <div>
                  <h4 class="font-medium text-primary">Tool Usage & Automation</h4>
                  <p class="text-sm text-secondary">Master Burp Suite, Metasploit, Nmap, custom scripts, and automation frameworks for efficient testing workflows.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Advanced Troubleshooting -->
        <div class="chatio-settings-section">
          <div class="chatio-settings-header">
            <h3 class="chatio-settings-title"><i class="fas fa-wrench mr-2"></i>Troubleshooting & Solutions</h3>
            <p class="chatio-settings-desc">Solve common issues quickly with detailed guides</p>
          </div>
          <div class="chatio-settings-body">
            <div class="space-y-3">
              <details class="group">
                <summary class="font-medium cursor-pointer hover:text-primary-600 dark:hover:text-primary-400 flex items-center justify-between p-3 chatio-welcome-card text-primary">
                  <span class="flex items-center">
                    <i class="fas fa-key mr-2"></i>
                    API Key & Authentication Issues
                  </span>
                  <i class="fas fa-chevron-down group-open:rotate-180 transition-transform"></i>
                </summary>
                <div class="mt-2 p-4 text-sm chatio-welcome-card text-secondary">
                  <div class="space-y-3">
                    <div>
                      <strong class="text-amber-600">Problem:</strong> "Invalid API key" error
                      <ul class="mt-1 ml-4 space-y-1">
                        <li>• Verify key format: OpenAI (sk-...), Anthropic (sk-ant-...), Google (AIza...)</li>
                        <li>• Check for extra spaces or characters when copying</li>
                        <li>• Ensure key has proper permissions and isn't expired</li>
                        <li>• Test key in provider's official playground first</li>
                      </ul>
                    </div>
                    <div>
                      <strong class="text-amber-600">Problem:</strong> "Insufficient quota" or billing errors
                      <ul class="mt-1 ml-4 space-y-1">
                        <li>• Add payment method in provider dashboard</li>
                        <li>• Check usage limits and increase if necessary</li>
                        <li>• Review billing settings and credit balance</li>
                        <li>• Consider switching to a different model temporarily</li>
                  </ul>
                    </div>
                  </div>
                </div>
              </details>
              
              <details class="group">
                <summary class="font-medium cursor-pointer hover:text-primary-600 dark:hover:text-primary-400 flex items-center justify-between p-3 chatio-welcome-card text-primary">
                  <span class="flex items-center">
                    <i class="fas fa-globe mr-2"></i>
                    Connection & Network Problems
                  </span>
                  <i class="fas fa-chevron-down group-open:rotate-180 transition-transform"></i>
                </summary>
                <div class="mt-2 p-4 text-sm chatio-welcome-card text-secondary">
                  <div class="space-y-3">
                    <div>
                      <strong class="text-amber-600">Network Issues:</strong>
                      <ul class="mt-1 ml-4 space-y-1">
                        <li>• Check your internet connection stability</li>
                        <li>• Verify firewall/proxy settings allow API access</li>
                        <li>• Try disabling VPN temporarily if using one</li>
                        <li>• Test with different networks (mobile hotspot)</li>
                      </ul>
                    </div>
                    <div>
                      <strong class="text-amber-600">Caido Integration:</strong>
                      <ul class="mt-1 ml-4 space-y-1">
                        <li>• Ensure Caido is running and plugin is enabled</li>
                        <li>• Check Caido's proxy settings aren't blocking requests</li>
                        <li>• Restart Caido and reload the plugin</li>
                        <li>• Verify plugin permissions in Caido settings</li>
                  </ul>
                    </div>
                  </div>
                </div>
              </details>
              
              <details class="group">
                <summary class="font-medium cursor-pointer hover:text-primary-600 dark:hover:text-primary-400 flex items-center justify-between p-3 chatio-welcome-card text-primary">
                  <span class="flex items-center">
                    <i class="fas fa-tachometer-alt mr-2"></i>
                    Performance & Speed Optimization
                  </span>
                  <i class="fas fa-chevron-down group-open:rotate-180 transition-transform"></i>
                </summary>
                <div class="mt-2 p-4 text-sm chatio-welcome-card text-secondary">
                  <div class="space-y-3">
                    <div>
                      <strong class="text-amber-600">Speed up responses:</strong>
                      <ul class="mt-1 ml-4 space-y-1">
                        <li>• Reduce context messages (Settings → Context Messages)</li>
                        <li>• Use faster models: GPT-3.5 > GPT-4, Haiku > Sonnet</li>
                        <li>• Shorten prompts and be more specific</li>
                        <li>• Consider local models for instant responses</li>
                      </ul>
                    </div>
                    <div>
                      <strong class="text-amber-600">Reduce costs:</strong>
                      <ul class="mt-1 ml-4 space-y-1">
                        <li>• Use cheaper models for simple questions</li>
                        <li>• Set usage limits in provider dashboards</li>
                        <li>• Monitor token usage patterns</li>
                        <li>• Consider free tier options (Google Gemini, Local LLMs)</li>
                  </ul>
                    </div>
                  </div>
                </div>
              </details>
              
              <details class="group">
                <summary class="font-medium cursor-pointer hover:text-primary-600 dark:hover:text-primary-400 flex items-center justify-between p-3 chatio-welcome-card text-primary">
                  <span class="flex items-center">
                    <i class="fas fa-database mr-2"></i>
                    Chat History & Data Management
                  </span>
                  <i class="fas fa-chevron-down group-open:rotate-180 transition-transform"></i>
                </summary>
                <div class="mt-2 p-4 text-sm chatio-welcome-card text-secondary">
                  <div class="space-y-3">
                    <div>
                      <strong class="text-amber-600">Chat not saving:</strong>
                      <ul class="mt-1 ml-4 space-y-1">
                        <li>• Enable auto-save in Settings → Chat Configuration</li>
                    <li>• Check browser storage permissions</li>
                        <li>• Clear browser cache if experiencing issues</li>
                        <li>• Export important chats as backup</li>
                      </ul>
                    </div>
                    <div>
                      <strong class="text-amber-600">Data management:</strong>
                      <ul class="mt-1 ml-4 space-y-1">
                        <li>• Regular exports prevent data loss</li>
                        <li>• Organize chats with descriptive titles</li>
                        <li>• Delete old chats to free up storage</li>
                        <li>• Use "Clear All Data" for fresh start</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </details>

              <details class="group">
                <summary class="font-medium cursor-pointer hover:text-primary-600 dark:hover:text-primary-400 flex items-center justify-between p-3 chatio-welcome-card text-primary">
                  <span class="flex items-center">
                    <i class="fas fa-image mr-2"></i>
                    File Upload & Image Issues
                  </span>
                  <i class="fas fa-chevron-down group-open:rotate-180 transition-transform"></i>
                </summary>
                <div class="mt-2 p-4 text-sm chatio-welcome-card text-secondary">
                  <div class="space-y-3">
                    <div>
                      <strong class="text-amber-600">Image analysis not working:</strong>
                      <ul class="mt-1 ml-4 space-y-1">
                        <li>• Ensure you're using a vision-capable model</li>
                        <li>• OpenAI: GPT-4o, GPT-4-turbo support images</li>
                        <li>• Local: Use llava, llama3.2-vision, or bakllava models</li>
                        <li>• Check file size limits (typically 20MB max)</li>
                      </ul>
                    </div>
                    <div>
                      <strong class="text-amber-600">File upload problems:</strong>
                      <ul class="mt-1 ml-4 space-y-1">
                        <li>• Supported formats: PNG, JPG, PDF, TXT, JSON, code files</li>
                        <li>• Large files may take longer to process</li>
                        <li>• Try smaller file sizes if experiencing issues</li>
                        <li>• Copy-paste content directly for text files</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </details>

              <details class="group">
                <summary class="font-medium cursor-pointer hover:text-primary-600 dark:hover:text-primary-400 flex items-center justify-between p-3 chatio-welcome-card text-primary">
                  <span class="flex items-center">
                    <i class="fas fa-home mr-2"></i>
                    Local LLM (Ollama) Issues
                  </span>
                  <i class="fas fa-chevron-down group-open:rotate-180 transition-transform"></i>
                </summary>
                <div class="mt-2 p-4 text-sm chatio-welcome-card text-secondary">
                  <div class="space-y-3">
                    <div>
                      <strong class="text-amber-600">Connection failed:</strong>
                      <ul class="mt-1 ml-4 space-y-1">
                        <li>• Verify Ollama is running: <button @click="copyToClipboard('ollama serve')" class="inline-flex items-center text-primary hover:text-amber-600 cursor-pointer"><code>ollama serve</code> <i class="fas fa-copy ml-1 text-xs"></i></button></li>
                        <li>• Check URL is correct: <button @click="copyToClipboard('http://localhost:11434')" class="inline-flex items-center text-primary hover:text-amber-600 cursor-pointer"><code>http://localhost:11434</code> <i class="fas fa-copy ml-1 text-xs"></i></button></li>
                        <li>• Test with: <button @click="copyToClipboard('curl http://localhost:11434/api/tags')" class="inline-flex items-center text-primary hover:text-amber-600 cursor-pointer"><code>curl http://localhost:11434/api/tags</code> <i class="fas fa-copy ml-1 text-xs"></i></button></li>
                        <li>• Restart Ollama service if needed</li>
                      </ul>
                    </div>
                    <div>
                      <strong class="text-amber-600">Model issues:</strong>
                      <ul class="mt-1 ml-4 space-y-1">
                        <li>• Download models: <button @click="copyToClipboard('ollama pull modelname')" class="inline-flex items-center text-primary hover:text-amber-600 cursor-pointer"><code>ollama pull modelname</code> <i class="fas fa-copy ml-1 text-xs"></i></button></li>
                        <li>• List available: <button @click="copyToClipboard('ollama list')" class="inline-flex items-center text-primary hover:text-amber-600 cursor-pointer"><code>ollama list</code> <i class="fas fa-copy ml-1 text-xs"></i></button></li>
                        <li>• Update model list in settings after pulling new models</li>
                        <li>• Use vision models (llava) for image analysis</li>
                  </ul>
                    </div>
                  </div>
                </div>
              </details>
            </div>
          </div>
        </div>
      </div>

      <!-- Full Width About Card - JWT Analyzer Style -->
      <div class="chatio-about-card">
        <div class="chatio-about-header">
          <div class="chatio-about-title">
            <h3>Chatio</h3>
            <p>Version 1.0.0</p>
          </div>
          <a
            href="https://github.com/amrelsagaei/chatio"
            target="_blank"
            rel="noopener noreferrer"
            class="chatio-github-btn"
          >
            <i class="fab fa-github"></i>
            Star on GitHub
          </a>
        </div>
        <div class="chatio-about-body">
          <div class="chatio-about-description">
            <p class="text-primary" style="line-height: 1.6; font-size: 16px; margin-bottom: 1.5rem;">
              <strong>Chatio</strong> is the ultimate AI-powered security testing companion designed specifically for penetration testers, security researchers, and ethical hackers. Seamlessly integrated with Caido, it provides intelligent assistance throughout your entire security assessment workflow.
            </p>
          </div>

          <div class="grid grid-cols-2 gap-6 mb-6">
            <!-- AI Providers Support -->
            <div class="chatio-welcome-card">
              <h4 class="font-medium mb-3 flex items-center text-primary">
                <i class="fas fa-brain mr-2"></i>
                Supported AI Providers
              </h4>
              <div class="grid grid-cols-1 gap-3 text-sm text-secondary">
                <div class="flex items-center justify-between p-2 rounded-lg bg-primary/5">
                  <span class="flex items-center"><i class="fas fa-robot mr-2 text-primary"></i>OpenAI</span>
                  <span class="text-xs bg-primary text-white px-2 py-1 rounded-full">GPT-4o, GPT-4-turbo, GPT-3.5-turbo</span>
                </div>
                <div class="flex items-center justify-between p-2 rounded-lg bg-primary/5">
                  <span class="flex items-center"><i class="fas fa-brain mr-2 text-primary"></i>Anthropic</span>
                  <span class="text-xs bg-primary text-white px-2 py-1 rounded-full">Claude-3.5-sonnet, Claude-3-opus, Claude-3-haiku</span>
                </div>
                <div class="flex items-center justify-between p-2 rounded-lg bg-primary/5">
                  <span class="flex items-center"><i class="fab fa-google mr-2 text-primary"></i>Google</span>
                  <span class="text-xs bg-primary text-white px-2 py-1 rounded-full">Gemini-1.5-pro, Gemini-1.5-flash</span>
                </div>
                <div class="flex items-center justify-between p-2 rounded-lg bg-primary/5">
                  <span class="flex items-center"><i class="fas fa-microchip mr-2 text-primary"></i>DeepSeek</span>
                  <span class="text-xs bg-primary text-white px-2 py-1 rounded-full">DeepSeek-V2.5, DeepSeek-Coder</span>
                </div>
                <div class="flex items-center justify-between p-2 rounded-lg bg-primary/5">
                  <span class="flex items-center"><i class="fas fa-server mr-2 text-primary"></i>Local LLMs</span>
                  <span class="text-xs bg-primary text-white px-2 py-1 rounded-full">Any compatible model (Llama, Mistral, etc.)</span>
                </div>
              </div>
            </div>
            
            <!-- Key Features -->
            <div class="chatio-welcome-card">
              <h4 class="font-medium mb-3 flex items-center text-primary">
                <i class="fas fa-star mr-2"></i>
                Key Features
              </h4>
              <ul class="text-sm space-y-2 text-secondary">
                <li class="flex items-center p-1"><i class="fas fa-shield-alt mr-2 text-amber-600"></i>Security-focused prompts</li>
                <li class="flex items-center p-1"><i class="fas fa-image mr-2 text-amber-600"></i>Image analysis support</li>
                <li class="flex items-center p-1"><i class="fas fa-file-alt mr-2 text-amber-600"></i>File upload & analysis</li>
                <li class="flex items-center p-1"><i class="fas fa-history mr-2 text-amber-600"></i>Chat history management</li>
                <li class="flex items-center p-1"><i class="fas fa-download mr-2 text-amber-600"></i>Export conversations</li>
                <li class="flex items-center p-1"><i class="fas fa-lock mr-2 text-amber-600"></i>Local storage (private)</li>
              </ul>
            </div>
          </div>

          <!-- Advanced Features Section -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div class="chatio-welcome-card">
              <h4 class="font-medium mb-3 flex items-center text-primary">
                <i class="fas fa-cogs mr-2"></i>
                Advanced Features
              </h4>
              <div class="space-y-3 text-sm text-secondary">
                <div>
                  <strong>Multi-Provider Support:</strong> Switch between different AI providers based on your needs and budget.
                </div>
                <div>
                  <strong>Context Management:</strong> Intelligent conversation context to maintain relevant discussion threads.
                </div>
                <div>
                  <strong>Custom System Prompts:</strong> Tailor the AI's behavior for specific testing scenarios.
                </div>
                <div>
                  <strong>Image Analysis:</strong> Upload screenshots, diagrams, and visual evidence for analysis.
                </div>
                <div>
                  <strong>File Processing:</strong> Analyze code files, logs, and documents directly in chat.
                </div>
              </div>
            </div>
            
            <div class="chatio-welcome-card">
              <h4 class="font-medium mb-3 flex items-center text-primary">
                <i class="fas fa-lightbulb mr-2"></i>
                Pro Tips for Maximum Effectiveness
              </h4>
              <div class="space-y-3 text-sm text-secondary">
                <div>
                  <strong>Be Specific:</strong> Include target details, environment info, and specific objectives.
                </div>
                <div>
                  <strong>Provide Context:</strong> Share relevant code snippets, error messages, or network info.
                </div>
                <div>
                  <strong>Use Templates:</strong> Start with quick prompts and customize for your scenario.
                </div>
                <div>
                  <strong>Combine Tools:</strong> Use Chatio alongside Caido's other features for comprehensive testing.
                </div>
                <div>
                  <strong>Export Results:</strong> Save important findings and methodologies for future reference.
                </div>
              </div>
            </div>
          </div>

          <div class="chatio-contact-section">
            <h4 class="text-lg font-semibold mb-4 text-primary">Connect</h4>
            <div class="flex items-center justify-between">
              <div class="chatio-contact-links">
                <a 
                  @click.prevent="copyToClipboard('https://amrelsagaei.com')" 
                  class="chatio-contact-link"
                >
                  <i class="fas fa-globe"></i>
                  Website
                </a>
                <a 
                  @click.prevent="copyToClipboard('info@amralsagaei.com')"
                  class="chatio-contact-link"
                >
                  <i class="fas fa-envelope"></i>
                  Email
                </a>
                <a 
                  @click.prevent="copyToClipboard('https://www.linkedin.com/in/amrelsagaei')" 
                  class="chatio-contact-link"
                >
                  <i class="fab fa-linkedin"></i>
                  LinkedIn
                </a>
              </div>
              
              <div class="chatio-made-with-love text-muted text-right">
                Made with <i class="fas fa-heart text-red-500"></i> by <a 
                  @click.prevent="copyToClipboard('https://amrelsagaei.com')"
                  class="text-primary font-medium cursor-pointer no-underline transition-colors hover:text-accent"
                > Amr Elsagaei</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// Quick prompts for getting started
const quickPrompts = [
  {
    title: "SQL Injection Analysis",
    description: "Deep dive into SQL injection vulnerabilities and exploitation",
    text: "Analyze this SQL injection vulnerability. Provide exploitation techniques, payloads, and mitigation strategies for both authentication bypass and data extraction scenarios."
  },
  {
    title: "Web Application Security Review",
    description: "Comprehensive security assessment of web applications",
    text: "Perform a complete security review of this web application code. Check for OWASP Top 10 vulnerabilities, authentication flaws, authorization issues, and business logic vulnerabilities."
  },
  {
    title: "XSS Exploitation Techniques",
    description: "Advanced Cross-Site Scripting attack vectors and bypasses",
    text: "Help me craft XSS payloads for this scenario. Include DOM-based, stored, and reflected XSS techniques, WAF bypasses, and advanced payload obfuscation methods."
  },
  {
    title: "Network Penetration Testing",
    description: "Complete network reconnaissance and exploitation guide",
    text: "Guide me through network penetration testing methodology. Include reconnaissance, scanning, enumeration, vulnerability assessment, and post-exploitation techniques."
  },
  {
    title: "Active Directory Exploitation",
    description: "Windows domain attacks and privilege escalation",
    text: "Help me with Active Directory penetration testing. Cover Kerberos attacks, lateral movement techniques, privilege escalation, and persistence methods in Windows domains."
  },
  {
    title: "API Security Testing",
    description: "REST/GraphQL API vulnerability assessment",
    text: "Analyze this API for security vulnerabilities. Check authentication, authorization, rate limiting, input validation, and business logic flaws in REST/GraphQL APIs."
  },
  {
    title: "Mobile Application Testing",
    description: "iOS and Android security assessment techniques",
    text: "Guide me through mobile application security testing. Include static analysis, dynamic analysis, runtime manipulation, and platform-specific vulnerability assessment."
  },
  {
    title: "Cloud Security Assessment",
    description: "AWS, Azure, GCP security configuration review",
    text: "Help me assess cloud infrastructure security. Cover misconfigurations, IAM issues, storage security, network controls, and cloud-specific attack vectors."
  },
  {
    title: "Buffer Overflow Exploitation",
    description: "Binary exploitation and memory corruption",
    text: "Explain buffer overflow exploitation techniques. Include stack-based and heap-based overflows, ROP chains, ASLR bypasses, and modern exploitation mitigation bypasses."
  },
  {
    title: "Social Engineering Campaigns",
    description: "Phishing and human-factor security testing",
    text: "Help me design effective social engineering campaigns. Include phishing email templates, pretexting scenarios, and physical security testing approaches."
  },
  {
    title: "Wireless Network Testing",
    description: "WiFi and wireless protocol security assessment",
    text: "Guide me through wireless network penetration testing. Cover WPA/WPA2/WPA3 attacks, enterprise WiFi testing, and wireless protocol vulnerabilities."
  },
  {
    title: "Malware Analysis & Reverse Engineering",
    description: "Static and dynamic malware analysis techniques",
    text: "Help me analyze this malware sample. Include static analysis techniques, dynamic behavior analysis, unpacking methods, and reverse engineering approaches."
  }
];

// Caido SDK for toasts
const showToast = (message: string, variant: 'success' | 'error' = 'success') => {
  try {
    // Try Caido SDK first
    if ((window as any).caidoSDK?.window?.showToast) {
      (window as any).caidoSDK.window.showToast(message, {
        variant,
        duration: 3000
      });
      return;
    }
    
    // Fallback: Try parent window Caido SDK
    if ((window.parent as any)?.caidoSDK?.window?.showToast) {
      (window.parent as any).caidoSDK.window.showToast(message, {
        variant,
        duration: 3000
      });
      return;
    }
    
    // Fallback: Create custom toast notification
    createCustomToast(message, variant);
  } catch (error) {
    console.log(`${variant.toUpperCase()}: ${message}`);
    // Create custom toast as final fallback
    createCustomToast(message, variant);
  }
};

// Custom toast implementation for when Caido SDK isn't available
const createCustomToast = (message: string, variant: 'success' | 'error' = 'success') => {
  // Remove existing toasts
  const existingToasts = document.querySelectorAll('.chatio-custom-toast');
  existingToasts.forEach(toast => toast.remove());
  
  // Create toast element
  const toast = document.createElement('div');
  toast.className = 'chatio-custom-toast';
  
  // Enhanced shadow effects for different variants
  const shadowEffects = {
    success: `
      0 8px 25px rgba(0, 0, 0, 0.25),
      0 16px 40px rgba(0, 0, 0, 0.15),
      0 4px 12px rgba(0, 0, 0, 0.35),
      0 2px 8px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.2)
    `,
    error: `
      0 8px 25px rgba(0, 0, 0, 0.25),
      0 16px 40px rgba(0, 0, 0, 0.15),
      0 4px 12px rgba(0, 0, 0, 0.35),
      0 2px 8px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.2)
    `
  };
  
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    padding: 12px 20px;
    border-radius: 8px;
    color: white;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 14px;
    font-weight: 500;
    animation: slideIn 0.3s ease-out;
    background: ${variant === 'success' ? '#10b981' : '#ef4444'};
    border: 1px solid ${variant === 'success' ? '#059669' : '#dc2626'};
    box-shadow: ${shadowEffects[variant]};
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  `;
  
  // Add icon
  const icon = variant === 'success' ? '✓' : '✕';
  toast.innerHTML = `<span style="margin-right: 8px;">${icon}</span>${message}`;
  
  // Add animation styles if not already present
  if (!document.getElementById('chatio-toast-styles')) {
    const style = document.createElement('style');
    style.id = 'chatio-toast-styles';
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(100%) scale(0.8);
          opacity: 0;
        }
        to {
          transform: translateX(0) scale(1);
          opacity: 1;
        }
      }
      @keyframes slideOut {
        from {
          transform: translateX(0) scale(1);
          opacity: 1;
        }
        to {
          transform: translateX(100%) scale(0.8);
          opacity: 0;
        }
      }
      .chatio-custom-toast:hover {
        transform: translateY(-2px) !important;
        transition: transform 0.2s ease !important;
      }
    `;
    document.head.appendChild(style);
  }
  
  // Add to DOM
  document.body.appendChild(toast);
  
  // Auto remove after 3 seconds
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, 3000);
};

// Copy to clipboard functionality
const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text)
    .then(() => {
      showToast('Link copied to clipboard', 'success');
    })
    .catch(err => {
      console.error('Failed to copy text:', err);
      
      // Fallback method
      try {
        const tempInput = document.createElement('input');
        tempInput.value = text;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
        
        showToast('Link copied to clipboard', 'success');
      } catch (e) {
        console.error('Fallback copy method failed:', e);
        showToast('Failed to copy to clipboard', 'error');
      }
    });
};

// Emits
const emit = defineEmits<{
  promptSelected: [prompt: string];
}>();

// Methods
const selectPrompt = (prompt: string) => {
  emit('promptSelected', prompt);
};
</script>

<style scoped>
/* Component styles are handled by design-system.css */
details[open] summary {
  margin-bottom: 0.5rem;
}

summary::-webkit-details-marker {
  display: none;
}
</style> 