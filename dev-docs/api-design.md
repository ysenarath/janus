# Library Feature API Design

## Core APIs

### Document Management API

```typescript
interface DocumentAPI {
  // Create a new document
  createDocument(data: Partial<Document>): Promise<Document>;
  
  // Create multiple documents
  bulkCreateDocuments(documents: Partial<Document>[]): Promise<BulkOperationResult>;
  
  // Retrieve a document by ID
  getDocument(id: string): Promise<Document>;
  
  // Update an existing document
  updateDocument(id: string, data: Partial<Document>): Promise<Document>;
  
  // Update multiple documents
  bulkUpdateDocuments(updates: Array<{
    id: string;
    data: Partial<Document>;
  }>): Promise<BulkOperationResult>;
  
  // Delete a document
  deleteDocument(id: string): Promise<void>;
  
  // Delete multiple documents
  bulkDeleteDocuments(ids: string[]): Promise<BulkOperationResult>;
  
  // List documents with pagination and filters
  listDocuments(params: {
    page?: number;
    limit?: number;
    filters?: DocumentFilters;
    sort?: SortOptions;
  }): Promise<{
    documents: Document[];
    total: number;
    hasMore: boolean;
  }>;
  
  // Get document statistics
  getStats(): Promise<DocumentStats>;
  
  // Export documents
  exportDocuments(ids: string[]): Promise<Blob>;
  
  // Import documents
  importDocuments(blob: Blob): Promise<BulkOperationResult>;
}

interface DocumentFilters {
  tags?: string[];
  category?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  searchText?: string;
}

interface SortOptions {
  field: 'title' | 'created' | 'modified';
  direction: 'asc' | 'desc';
}

interface BulkOperationResult {
  successful: Array<{
    id: string;
    result: any;
  }>;
  failed: Array<{
    id: string;
    error: string;
  }>;
  summary: {
    total: number;
    succeeded: number;
    failed: number;
  };
}

interface DocumentStats {
  totalCount: number;
  byCategory: Record<string, number>;
  byTag: Record<string, number>;
  sizeDistribution: {
    small: number;    // < 10KB
    medium: number;   // 10KB - 100KB
    large: number;    // > 100KB
  };
  averageSize: number;
}
```

### Vector Search API

```typescript
interface SearchAPI {
  // Perform semantic search with pagination
  semanticSearch(query: string, options?: SearchOptions): Promise<SearchResponse>;
  
  // Hybrid search combining semantic and keyword
  hybridSearch(query: string, options?: SearchOptions): Promise<SearchResponse>;
  
  // Get similar documents
  findSimilar(documentId: string, options?: SearchOptions): Promise<SearchResponse>;
  
  // Update search index for document
  updateDocumentIndex(document: Document): Promise<void>;
  
  // Bulk update search index
  bulkUpdateIndex(documents: Document[]): Promise<BulkUpdateResult>;
  
  // Rebuild entire search index
  rebuildSearchIndex(options?: RebuildOptions): Promise<void>;
  
  // Get search stats
  getSearchStats(): Promise<SearchStats>;
  
  // Manage search cache
  cache: {
    clear(): Promise<void>;
    prewarm(queries: string[]): Promise<void>;
    getStats(): Promise<CacheStats>;
  };
}

interface SearchOptions {
  page?: number;
  limit?: number;
  threshold?: number;
  filters?: DocumentFilters;
  includeMetadata?: boolean;
  rankingStrategy?: 'semantic' | 'hybrid' | 'recent';
  timeout?: number;
}

interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  hasMore: boolean;
  timings?: {
    embedding: number;
    search: number;
    total: number;
  };
  debug?: {
    strategy: string;
    vectorDimensions: number;
    nearestNeighbors: number;
  };
}

interface SearchResult {
  document: Document;
  score: number;
  highlights?: {
    field: string;
    segments: Array<{
      text: string;
      isMatch: boolean;
    }>;
  }[];
  vector?: Float32Array;
}

interface BulkUpdateResult {
  successful: string[];
  failed: Array<{
    id: string;
    error: string;
  }>;
}

interface RebuildOptions {
  batchSize?: number;
  priority?: 'speed' | 'memory';
  onProgress?: (progress: number) => void;
}

interface SearchStats {
  indexSize: number;
  documentCount: number;
  lastRebuild: Date;
  averageSearchTime: number;
  cacheHitRate: number;
  errorRate: number;
}

interface CacheStats {
  size: number;
  hitRate: number;
  missRate: number;
  evictions: number;
}
```

### Storage API

```typescript
interface StorageAPI {
  // Initialize storage
  initialize(config?: StorageConfig): Promise<void>;
  
  // Get storage statistics
  getStats(): Promise<StorageStats>;
  
  // Perform backup
  backup(options?: BackupOptions): Promise<Blob>;
  
  // Restore from backup
  restore(backup: Blob, options?: RestoreOptions): Promise<RestoreResult>;
  
  // Clear all data
  clear(): Promise<void>;
  
  // Optimize storage
  optimize(): Promise<OptimizationResult>;
  
  // Check storage health
  checkHealth(): Promise<HealthStatus>;
}

interface StorageConfig {
  quota?: {
    preferred: number;
    minimum: number;
  };
  persistence?: {
    mode: 'persistent' | 'temporary';
    strategy: 'aggressive' | 'conservative';
  };
  encryption?: {
    enabled: boolean;
    algorithm?: string;
  };
}

interface StorageStats {
  documentsCount: number;
  totalSize: number;
  quotaUsage: number;
  indexSize: number;
  cacheSize: number;
  fragmentationRate: number;
}

interface BackupOptions {
  includeIndexes?: boolean;
  compress?: boolean;
  encrypt?: boolean;
}

interface RestoreOptions {
  conflict?: 'overwrite' | 'skip' | 'rename';
  validateData?: boolean;
}

interface RestoreResult {
  succeeded: number;
  failed: number;
  errors: Error[];
}

interface OptimizationResult {
  spaceReclaimed: number;
  timeSpent: number;
  improvements: string[];
}

interface HealthStatus {
  healthy: boolean;
  issues: Array<{
    component: string;
    severity: 'low' | 'medium' | 'high';
    message: string;
  }>;
}
```

## Worker APIs

### Embedding Worker

```typescript
interface EmbeddingWorkerMessage {
  type: 'GENERATE_EMBEDDING' | 'BATCH_GENERATE' | 'LOAD_MODEL' | 'UNLOAD_MODEL' | 'STATUS';
  payload: {
    text?: string;
    texts?: string[];
    modelConfig?: ModelConfig;
    priority?: 'high' | 'normal' | 'low';
  };
}

interface EmbeddingWorkerResponse {
  type: 'EMBEDDING_COMPLETE' | 'BATCH_COMPLETE' | 'MODEL_LOADED' | 'MODEL_UNLOADED' | 'STATUS' | 'ERROR';
  payload: {
    embedding?: Float32Array;
    embeddings?: Float32Array[];
    error?: string;
    progress?: number;
    memory?: {
      used: number;
      total: number;
    };
    status?: {
      ready: boolean;
      busy: boolean;
      queue: number;
    };
  };
}

interface ModelConfig {
  modelName: string;
  quantized?: boolean;
  maxLength?: number;
  batchSize?: number;
  device?: 'cpu' | 'gpu';
}
```

## Event System

```typescript
interface LibraryEvents {
  // Document events
  'document:created': (document: Document) => void;
  'document:updated': (document: Document) => void;
  'document:deleted': (id: string) => void;
  'document:bulk-operation': (result: BulkOperationResult) => void;
  
  // Search events
  'search:started': (query: string) => void;
  'search:completed': (results: SearchResponse) => void;
  'search:error': (error: Error) => void;
  'search:cache-hit': (query: string) => void;
  
  // Storage events
  'storage:quota-warning': (usage: number) => void;
  'storage:error': (error: Error) => void;
  'storage:optimizing': (progress: number) => void;
  'storage:health-issue': (status: HealthStatus) => void;
  
  // Index events
  'index:building': (progress: number) => void;
  'index:built': () => void;
  'index:error': (error: Error) => void;
  'index:optimizing': (progress: number) => void;
  
  // Worker events
  'worker:status-changed': (status: WorkerStatus) => void;
  'worker:error': (error: Error) => void;
  'worker:memory-pressure': (usage: number) => void;
}

interface WorkerStatus {
  ready: boolean;
  busy: boolean;
  queue: number;
  memory: {
    used: number;
    total: number;
  };
}
```

## Error Handling

```typescript
class LibraryError extends Error {
  constructor(
    message: string,
    public code: ErrorCode,
    public details?: any,
    public retry?: () => Promise<any>
  ) {
    super(message);
  }
}

enum ErrorCode {
  // Document errors
  DOCUMENT_NOT_FOUND = 'DOCUMENT_NOT_FOUND',
  DOCUMENT_INVALID = 'DOCUMENT_INVALID',
  DOCUMENT_TOO_LARGE = 'DOCUMENT_TOO_LARGE',
  
  // Storage errors
  STORAGE_QUOTA_EXCEEDED = 'STORAGE_QUOTA_EXCEEDED',
  STORAGE_UNAVAILABLE = 'STORAGE_UNAVAILABLE',
  STORAGE_CORRUPTED = 'STORAGE_CORRUPTED',
  
  // Search errors
  SEARCH_INDEX_CORRUPTED = 'SEARCH_INDEX_CORRUPTED',
  SEARCH_TIMEOUT = 'SEARCH_TIMEOUT',
  EMBEDDING_FAILED = 'EMBEDDING_FAILED',
  
  // Worker errors
  WORKER_CRASHED = 'WORKER_CRASHED',
  WORKER_MEMORY_EXCEEDED = 'WORKER_MEMORY_EXCEEDED',
  MODEL_LOAD_FAILED = 'MODEL_LOAD_FAILED',
  
  // General errors
  INITIALIZATION_FAILED = 'INITIALIZATION_FAILED',
  INVALID_OPERATION = 'INVALID_OPERATION',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED'
}
```

## Rate Limiting

```typescript
interface RateLimiter {
  // Check if operation is allowed
  checkLimit(operation: string): boolean;
  
  // Get current limits
  getLimits(): RateLimits;
  
  // Reset limits
  resetLimits(): void;
}

interface RateLimits {
  search: {
    maxPerMinute: number;
    remaining: number;
    resetAt: Date;
  };
  embedding: {
    maxConcurrent: number;
    queueLength: number;
    cooldown: number;
  };
  storage: {
    maxWritesPerMinute: number;
    maxSizePerMinute: number;
  };
}
```

## Usage Examples

### Document Management
```typescript
// Bulk create documents
const result = await library.documents.bulkCreateDocuments([
  {
    title: 'Document 1',
    content: 'Content...',
    metadata: { tags: ['example'] }
  },
  {
    title: 'Document 2',
    content: 'Content...',
    metadata: { tags: ['example'] }
  }
]);

// Export/Import
const backup = await library.documents.exportDocuments(['id1', 'id2']);
await library.documents.importDocuments(backup);

// Get statistics
const stats = await library.documents.getStats();
console.log(`Total documents: ${stats.totalCount}`);
```

### Search Operations
```typescript
// Semantic search with pagination
const results = await library.search.semanticSearch('concept explanation', {
  page: 1,
  limit: 10,
  rankingStrategy: 'hybrid',
  filters: {
    category: 'technical'
  }
});

// Cache management
await library.search.cache.prewarm(['common query 1', 'common query 2']);
const cacheStats = await library.search.cache.getStats();

// Monitor search performance
const searchStats = await library.search.getSearchStats();
console.log(`Average search time: ${searchStats.averageSearchTime}ms`);
```

### Storage Management
```typescript
// Initialize with config
await library.storage.initialize({
  quota: {
    preferred: 1024 * 1024 * 100, // 100MB
    minimum: 1024 * 1024 * 50     // 50MB
  },
  persistence: {
    mode: 'persistent',
    strategy: 'aggressive'
  }
});

// Health check
const health = await library.storage.checkHealth();
if (!health.healthy) {
  console.warn('Storage issues:', health.issues);
}

// Optimization
const optimization = await library.storage.optimize();
console.log(`Reclaimed ${optimization.spaceReclaimed} bytes`);
```

This enhanced API design provides comprehensive interfaces for document management, search operations, and storage handling. It includes robust error handling, rate limiting, and detailed statistics tracking. The design emphasizes type safety, scalability, and maintainability while providing flexibility for future extensions.
