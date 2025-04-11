/**
 * MCP Configuration
 * Master Control Program for database operations
 */

// Initialize the MCP singleton
const MCP = (function() {
    // Private variables
    let _supabaseClient = null;
    let _initialized = false;
    
    // Configuration
    const config = {
        supabaseUrl: 'https://ktaznqxiclyictwlgkeb.supabase.co',
        supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0YXpucXhpY2x5aWN0d2xna2ViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyODE0MzQsImV4cCI6MjA1OTg1NzQzNH0.LkAP572Qn3Du5I3Kkrp7B5RbOR0GtXV8YbaFzPe25YE'
    };
    
    /**
     * Initialize the MCP with Supabase credentials
     */
    async function initialize(credentials = {}) {
        try {
            const supabaseUrl = credentials.supabaseUrl || config.supabaseUrl;
            const supabaseKey = credentials.supabaseKey || config.supabaseKey;
            
            if (!supabaseUrl || !supabaseKey) {
                return {
                    success: false,
                    error: 'Supabase URL and Key are required'
                };
            }
            
            // Initialize Supabase client
            _supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
            
            // Test connection
            const { data, error } = await _supabaseClient.rpc('ping');
            
            if (error) throw error;
            
            _initialized = true;
            
            return {
                success: true,
                data: 'Connection established successfully'
            };
        } catch (error) {
            console.error('Failed to initialize MCP:', error);
            return {
                success: false,
                error: error.message || 'Failed to connect to database'
            };
        }
    }
    
    /**
     * Check if MCP is initialized
     */
    function checkInitialized() {
        if (!_initialized || !_supabaseClient) {
            throw new Error('MCP not initialized. Call initialize() first.');
        }
        return true;
    }
    
    /**
     * Get all available schemas
     */
    async function getSchemas() {
        try {
            checkInitialized();
            
            const { data, error } = await _supabaseClient.rpc('get_schemas');
            
            if (error) throw error;
            
            return {
                success: true,
                data: data || []
            };
        } catch (error) {
            console.error('Failed to get schemas:', error);
            return {
                success: false,
                error: error.message || 'Failed to get schemas'
            };
        }
    }
    
    /**
     * List all tables in the database
     */
    async function listTables() {
        try {
            checkInitialized();
            
            const { data, error } = await _supabaseClient.rpc('list_tables');
            
            if (error) throw error;
            
            // Group tables by schema
            const result = {};
            
            if (data && Array.isArray(data)) {
                data.forEach(item => {
                    const schema = item.schema_name;
                    const table = item.table_name;
                    
                    if (!result[schema]) {
                        result[schema] = [];
                    }
                    
                    result[schema].push(table);
                });
            }
            
            return {
                success: true,
                data: result
            };
        } catch (error) {
            console.error('Failed to list tables:', error);
            return {
                success: false,
                error: error.message || 'Failed to list tables'
            };
        }
    }
    
    /**
     * Get schema of a specific table
     */
    async function getTableSchema(schema, table) {
        try {
            checkInitialized();
            
            if (!schema || !table) {
                throw new Error('Schema and table names are required');
            }
            
            const { data, error } = await _supabaseClient.rpc('get_table_schema', {
                p_schema: schema,
                p_table: table
            });
            
            if (error) throw error;
            
            return {
                success: true,
                data: data || []
            };
        } catch (error) {
            console.error(`Failed to get schema for ${schema}.${table}:`, error);
            return {
                success: false,
                error: error.message || 'Failed to get table schema'
            };
        }
    }
    
    /**
     * Execute a SQL query
     */
    async function query(sql) {
        try {
            checkInitialized();
            
            if (!sql) {
                throw new Error('SQL query is required');
            }
            
            // For safety, check if this is a read-only query
            const isSafeQuery = /^\s*(SELECT|WITH|EXPLAIN|SHOW|DESCRIBE)/i.test(sql);
            
            let data, error;
            
            if (isSafeQuery) {
                console.log('Executing read query:', sql);
                // For SELECT queries, we can use the from().select() API
                try {
                    // First try using the execute_query RPC if available
                    const rpcResult = await _supabaseClient.rpc('execute_query', {
                        p_query: sql
                    });
                    
                    if (rpcResult.error) {
                        console.warn('RPC execute_query failed:', rpcResult.error);
                        
                        // Fall back to direct SQL query using the REST API
                        const { data: sqlData, error: sqlError } = await _supabaseClient
                            .from('_query')
                            .select('*')
                            .or(`and(sql.eq."${sql.replace(/"/g, '\\"')}")`);
                            
                        data = sqlData;
                        error = sqlError;
                    } else {
                        data = rpcResult.data;
                    }
                } catch (queryError) {
                    console.warn('Query execution error:', queryError);
                    error = queryError;
                }
            } else {
                error = new Error('Only SELECT queries are allowed for security reasons');
            }
            
            if (error) throw error;
            
            // Handle cases where data might not be an array
            if (data && !Array.isArray(data)) {
                if (typeof data === 'object') {
                    // Convert object to array with a single item
                    data = [data];
                } else {
                    // Wrap primitive value in array and object
                    data = [{ result: data }];
                }
            }
            
            return {
                success: true,
                data: data || []
            };
        } catch (error) {
            console.error('Failed to execute query:', error);
            return {
                success: false,
                error: error.message || 'Failed to execute query'
            };
        }
    }
    
    /**
     * Execute a SQL query directly (not using RPC)
     */
    async function directQuery(sql) {
        try {
            checkInitialized();
            
            if (!sql) {
                throw new Error('SQL query is required');
            }
            
            // For safety, check if this is a read-only query
            if (!(/^\s*(SELECT|WITH|EXPLAIN|SHOW|DESCRIBE)/i.test(sql))) {
                throw new Error('Only SELECT queries are allowed for security reasons');
            }
            
            console.log('Executing direct SQL query:', sql);
            
            // Use Supabase REST API's natural SQL capabilities
            const { data, error, status } = await _supabaseClient.from('_').select().then(
                () => {}, // Empty then to trigger catch
                // This will fail as intended, but we can catch and use the internal client
                async () => {
                    // Access the internal client and execute the query directly
                    try {
                        const response = await fetch(`${config.supabaseUrl}/rest/v1/rpc/execute_query`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'apikey': config.supabaseKey,
                                'Authorization': `Bearer ${config.supabaseKey}`
                            },
                            body: JSON.stringify({
                                p_query: sql
                            })
                        });
                        
                        const responseData = await response.json();
                        
                        if (!response.ok) {
                            return { 
                                error: { 
                                    message: responseData.error || responseData.message || 'Query failed',
                                    details: responseData
                                }
                            };
                        }
                        
                        return { data: responseData };
                    } catch (err) {
                        return { error: err };
                    }
                }
            );
            
            if (error) throw error;
            
            return {
                success: true,
                data: data || []
            };
        } catch (error) {
            console.error('Failed to execute direct query:', error);
            return {
                success: false,
                error: error.message || 'Failed to execute query'
            };
        }
    }
    
    // Return public API
    return {
        initialize,
        getSchemas,
        listTables,
        getTableSchema,
        query,
        directQuery,
        isInitialized: () => _initialized,
        checkInitialized
    };
})();

// Automatically initialize when this script is loaded
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Initializing MCP PostgreSQL connection...');
    const result = await MCP.initialize();
    if (result.success) {
        console.log('Connected to gardening eccommers Supabase project');
    } else {
        console.error('Failed to connect to Supabase:', result.error);
    }
}); 