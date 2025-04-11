/**
 * Database Explorer JavaScript
 * This file handles the database explorer functionality using the MCP configuration
 */

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const connectBtn = document.getElementById('connect-btn');
    const connectionStatus = document.getElementById('connection-status');
    const supabaseUrlInput = document.getElementById('supabase-url');
    const supabaseKeyInput = document.getElementById('supabase-key');
    const tablesList = document.getElementById('tables-list');
    const sqlQueryTextarea = document.getElementById('sql-query');
    const runQueryBtn = document.getElementById('run-query-btn');
    const clearQueryBtn = document.getElementById('clear-query-btn');
    const resultsContainer = document.getElementById('results-container');
    
    // Check if connection values are in localStorage
    if (localStorage.getItem('supabaseUrl')) {
        supabaseUrlInput.value = localStorage.getItem('supabaseUrl');
    }
    if (localStorage.getItem('supabaseKey')) {
        supabaseKeyInput.value = localStorage.getItem('supabaseKey');
    }
    
    // Connect to database
    connectBtn.addEventListener('click', async function() {
        const supabaseUrl = supabaseUrlInput.value.trim();
        const supabaseKey = supabaseKeyInput.value.trim();
        
        if (!supabaseUrl || !supabaseKey) {
            showMessage(resultsContainer, 'Please enter both Supabase URL and Anon Key', 'error');
            return;
        }
        
        try {
            connectionStatus.className = 'connection-status';
            connectionStatus.textContent = 'Connecting...';
            
            // Save to localStorage for convenience
            localStorage.setItem('supabaseUrl', supabaseUrl);
            localStorage.setItem('supabaseKey', supabaseKey);
            
            // Initialize MCP with credentials
            const success = await MCP.initialize({
                supabaseUrl,
                supabaseKey
            });
            
            if (success) {
                connectionStatus.className = 'connection-status status-connected';
                connectionStatus.textContent = 'Connected';
                
                // Fetch and display tables
                loadTables();
            } else {
                connectionStatus.className = 'connection-status status-disconnected';
                connectionStatus.textContent = 'Connection failed';
                showMessage(resultsContainer, 'Failed to connect to the database. Please check your credentials.', 'error');
            }
        } catch (error) {
            connectionStatus.className = 'connection-status status-disconnected';
            connectionStatus.textContent = 'Connection error';
            showMessage(resultsContainer, `Error: ${error.message}`, 'error');
            console.error('Connection error:', error);
        }
    });
    
    // Load tables
    async function loadTables() {
        if (!MCP.checkInitialized()) {
            showMessage(tablesList, 'Please connect to the database first', 'info');
            return;
        }
        
        try {
            tablesList.innerHTML = '<div class="results-message">Loading tables...</div>';
            
            // Approach 1: Try using the RPC function
            let result = await MCP.listTables();
            
            // If the RPC method fails, try direct SQL query using query()
            if (!result || !result.success || !result.data || Object.keys(result.data).length === 0) {
                console.log('RPC list_tables failed, trying direct SQL query');
                
                // Use direct SQL query as first fallback
                const sqlQuery = `SELECT table_schema AS schema_name, table_name 
                                  FROM information_schema.tables 
                                  WHERE table_schema NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
                                  ORDER BY table_schema, table_name;`;
                
                const sqlResult = await MCP.query(sqlQuery);
                
                if (sqlResult.success && sqlResult.data && sqlResult.data.length > 0) {
                    // Transform the raw SQL result to the expected format
                    const groupedTables = {};
                    
                    sqlResult.data.forEach(item => {
                        const schema = item.schema_name;
                        const table = item.table_name;
                        
                        if (!groupedTables[schema]) {
                            groupedTables[schema] = [];
                        }
                        
                        groupedTables[schema].push(table);
                    });
                    
                    result = {
                        success: true,
                        data: groupedTables
                    };
                } else {
                    // Try the third approach using directQuery
                    console.log('Standard query failed, trying directQuery');
                    const directResult = await MCP.directQuery(sqlQuery);
                    
                    if (directResult.success && directResult.data && directResult.data.length > 0) {
                        // Transform the raw SQL result to the expected format
                        const groupedTables = {};
                        
                        directResult.data.forEach(item => {
                            const schema = item.schema_name || item.table_schema;
                            const table = item.table_name;
                            
                            if (!groupedTables[schema]) {
                                groupedTables[schema] = [];
                            }
                            
                            groupedTables[schema].push(table);
                        });
                        
                        result = {
                            success: true,
                            data: groupedTables
                        };
                    }
                }
            }
            
            if (!result || !result.success) {
                tablesList.innerHTML = `<div class="results-message">Error: ${result?.error || 'Failed to load tables'}</div>`;
                return;
            }
            
            const tables = result.data;
            
            if (!tables || Object.keys(tables).length === 0) {
                tablesList.innerHTML = '<div class="results-message">No tables found</div>';
                return;
            }
            
            console.log('Tables data:', tables);  // Debug log
            
            let tablesHtml = '';
            
            // Render schemas and tables
            Object.keys(tables).forEach(schema => {
                const schemaId = `schema-${schema.replace(/\s/g, '-')}`;
                const tablesList = tables[schema];
                
                // Ensure the tables for this schema is an array
                if (!Array.isArray(tablesList)) {
                    console.error(`Tables for schema ${schema} is not an array:`, tablesList);
                    return; // Skip this schema
                }
                
                tablesHtml += `
                    <div class="schema-item">
                        <div class="schema-name" data-schema="${schemaId}">
                            ${schema} <span class="table-count">(${tablesList.length})</span>
                            <i class="fas fa-chevron-down"></i>
                        </div>
                        <div class="schema-tables" id="${schemaId}">
                            ${tablesList.map(table => 
                                `<div class="table-item" data-schema="${schema}" data-table="${table}">${table}</div>`
                            ).join('')}
                        </div>
                    </div>
                `;
            });
            
            if (tablesHtml) {
                tablesList.innerHTML = tablesHtml;
                
                // Add event listeners to schema headers and tables
                document.querySelectorAll('.schema-name').forEach(schemaName => {
                    schemaName.addEventListener('click', function() {
                        const schemaId = this.getAttribute('data-schema');
                        const schemaTablesElement = document.getElementById(schemaId);
                        schemaTablesElement.classList.toggle('show');
                        this.querySelector('i').classList.toggle('fa-chevron-down');
                        this.querySelector('i').classList.toggle('fa-chevron-up');
                    });
                });
                
                document.querySelectorAll('.table-item').forEach(tableItem => {
                    tableItem.addEventListener('click', function() {
                        const schema = this.getAttribute('data-schema');
                        const table = this.getAttribute('data-table');
                        
                        // Set query to select all from the table
                        sqlQueryTextarea.value = `SELECT * FROM "${schema}"."${table}" LIMIT 100;`;
                        
                        // Optionally, run the query automatically
                        runQuery();
                    });
                });
            } else {
                tablesList.innerHTML = '<div class="results-message">No tables found</div>';
            }
        } catch (error) {
            console.error('Error loading tables:', error);
            tablesList.innerHTML = `<div class="results-message">Error loading tables: ${error.message}</div>`;
        }
    }
    
    // Run SQL query
    runQueryBtn.addEventListener('click', runQuery);
    
    async function runQuery() {
        const query = sqlQueryTextarea.value.trim();
        
        if (!query) {
            showMessage(resultsContainer, 'Please enter a SQL query', 'info');
            return;
        }
        
        if (!MCP.checkInitialized()) {
            showMessage(resultsContainer, 'Please connect to the database first', 'info');
            return;
        }
        
        try {
            showMessage(resultsContainer, 'Running query...', 'info');
            
            const result = await MCP.query(query);
            
            if (!result.success) {
                showMessage(resultsContainer, `Error: ${result.error}`, 'error');
                return;
            }
            
            console.log('Query result:', result); // Debug log
            
            if (!result.data || result.data.length === 0) {
                showMessage(resultsContainer, 'Query executed successfully. No results returned.', 'success');
                return;
            }
            
            // Display results as a table
            displayResultsTable(result.data);
            
        } catch (error) {
            showMessage(resultsContainer, `Error: ${error.message}`, 'error');
            console.error('Query error:', error);
        }
    }
    
    // Display results as a table
    function displayResultsTable(data) {
        if (!data || data.length === 0) {
            return;
        }
        
        // Get column names from first row
        const columns = Object.keys(data[0]);
        
        let tableHtml = `
            <div class="results-message success">
                Query returned ${data.length} ${data.length === 1 ? 'row' : 'rows'}
            </div>
            <div style="overflow-x: auto;">
                <table class="results-table">
                    <thead>
                        <tr>
                            ${columns.map(col => `<th>${col}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        // Add data rows
        data.forEach(row => {
            tableHtml += '<tr>';
            columns.forEach(col => {
                const value = row[col];
                let displayValue = '';
                
                if (value === null) {
                    displayValue = '<em>NULL</em>';
                } else if (typeof value === 'object') {
                    // Handle JSON objects and arrays
                    displayValue = JSON.stringify(value);
                } else {
                    displayValue = String(value);
                }
                
                tableHtml += `<td>${displayValue}</td>`;
            });
            tableHtml += '</tr>';
        });
        
        tableHtml += `
                    </tbody>
                </table>
            </div>
        `;
        
        resultsContainer.innerHTML = tableHtml;
    }
    
    // Clear query
    clearQueryBtn.addEventListener('click', function() {
        sqlQueryTextarea.value = '';
        sqlQueryTextarea.focus();
    });
    
    // Utility function to show messages
    function showMessage(container, message, type = 'info') {
        container.innerHTML = `
            <div class="results-message ${type === 'error' ? 'error' : type === 'success' ? 'success' : ''}">
                ${message}
            </div>
        `;
    }
    
    // Check URL parameters for auto-connect
    function checkUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const autoConnect = urlParams.get('connect');
        
        if (autoConnect === 'true' && supabaseUrlInput.value && supabaseKeyInput.value) {
            connectBtn.click();
        }
    }
    
    // If we have credentials saved, attempt to auto-connect
    if (supabaseUrlInput.value && supabaseKeyInput.value) {
        checkUrlParams();
    }
}); 