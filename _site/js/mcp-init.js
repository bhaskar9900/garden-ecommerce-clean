/**
 * MCP Initialization Script
 * Automatically initializes MCP connection with Supabase credentials
 */

(function() {
    // Execute immediately when the script is loaded
    const SUPABASE_URL = 'https://ktaznqxiclyictwlgkeb.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0YXpucXhpY2x5aWN0d2xna2ViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyODE0MzQsImV4cCI6MjA1OTg1NzQzNH0.LkAP572Qn3Du5I3Kkrp7B5RbOR0GtXV8YbaFzPe25YE';

    // Wait for MCP to be available
    const initializeWhenReady = function() {
        if (typeof MCP !== 'undefined') {
            initializeMCP();
        } else {
            // MCP not loaded yet, try again in 100ms
            setTimeout(initializeWhenReady, 100);
        }
    };

    // Initialize MCP with Supabase credentials
    async function initializeMCP() {
        try {
            // Check if already initialized
            try {
                if (MCP.isInitialized && MCP.isInitialized()) {
                    console.log('MCP is already initialized');
                    return;
                }
            } catch (e) {
                // isInitialized method might not exist, continue with initialization
            }

            const result = await MCP.initialize({
                supabaseUrl: SUPABASE_URL,
                supabaseKey: SUPABASE_KEY
            });
            
            if (result && result.success) {
                console.log('MCP initialized successfully');
            } else if (result) {
                console.error('Error initializing MCP:', result.error);
            } else {
                console.error('MCP initialization returned undefined result');
            }
        } catch (error) {
            console.error('Failed to initialize MCP:', error);
        }
    }

    // Start the initialization process
    initializeWhenReady();
})(); 