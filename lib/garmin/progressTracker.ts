/**
 * Progress tracking utilities for bulk import operations
 * Provides real-time progress updates and statistics
 */

export interface ProgressState {
  phase: 'reading' | 'transforming' | 'importing' | 'complete' | 'error'
  totalItems: number
  processedItems: number
  successCount: number
  errorCount: number
  currentBatch: number
  totalBatches: number
  startTime: number
  lastUpdateTime: number
  estimatedTimeRemaining?: number
  currentItem?: string
  errors: ProgressError[]
}

export interface ProgressError {
  itemId: string | number
  error: string
  timestamp: number
  phase: string
}

export interface ProgressUpdate {
  progress: ProgressState
  percentage: number
  elapsedTime: number
  itemsPerSecond: number
  message: string
}

export type ProgressCallback = (update: ProgressUpdate) => void

/**
 * Progress tracker for bulk import operations
 */
export class ProgressTracker {
  private state: ProgressState
  private callback?: ProgressCallback

  constructor(totalItems: number, callback?: ProgressCallback) {
    this.state = {
      phase: 'reading',
      totalItems,
      processedItems: 0,
      successCount: 0,
      errorCount: 0,
      currentBatch: 0,
      totalBatches: 0,
      startTime: Date.now(),
      lastUpdateTime: Date.now(),
      errors: []
    }
    this.callback = callback
  }

  /**
   * Updates the current phase of the import process
   */
  setPhase(phase: ProgressState['phase'], message?: string): void {
    this.state.phase = phase
    this.state.lastUpdateTime = Date.now()
    
    if (message) {
      this.state.currentItem = message
    }
    
    this.notifyProgress()
  }

  /**
   * Sets the total number of batches for batch processing
   */
  setBatchInfo(totalBatches: number): void {
    this.state.totalBatches = totalBatches
    this.notifyProgress()
  }

  /**
   * Updates progress for the current batch
   */
  updateBatch(batchIndex: number, batchSize: number): void {
    this.state.currentBatch = batchIndex + 1
    this.state.processedItems = Math.min(
      this.state.processedItems + batchSize,
      this.state.totalItems
    )
    this.state.lastUpdateTime = Date.now()
    
    this.calculateEstimatedTime()
    this.notifyProgress()
  }

  /**
   * Records a successful item processing
   */
  recordSuccess(itemId?: string | number): void {
    this.state.successCount++
    if (itemId) {
      this.state.currentItem = `Processed: ${itemId}`
    }
    this.state.lastUpdateTime = Date.now()
    this.notifyProgress()
  }

  /**
   * Records an error during processing
   */
  recordError(error: string, itemId?: string | number): void {
    this.state.errorCount++
    
    const progressError: ProgressError = {
      itemId: itemId || 'unknown',
      error,
      timestamp: Date.now(),
      phase: this.state.phase
    }
    
    this.state.errors.push(progressError)
    
    // Keep only the last 50 errors to prevent memory issues
    if (this.state.errors.length > 50) {
      this.state.errors = this.state.errors.slice(-50)
    }
    
    this.state.lastUpdateTime = Date.now()
    this.notifyProgress()
  }

  /**
   * Marks the import as complete
   */
  complete(): void {
    this.state.phase = 'complete'
    this.state.processedItems = this.state.totalItems
    this.state.lastUpdateTime = Date.now()
    this.state.estimatedTimeRemaining = 0
    this.notifyProgress()
  }

  /**
   * Marks the import as failed with error
   */
  fail(error: string): void {
    this.state.phase = 'error'
    this.recordError(error)
    this.state.lastUpdateTime = Date.now()
    this.notifyProgress()
  }

  /**
   * Gets the current progress state
   */
  getProgress(): ProgressUpdate {
    const elapsedTime = Date.now() - this.state.startTime
    const percentage = this.state.totalItems > 0 
      ? Math.round((this.state.processedItems / this.state.totalItems) * 100)
      : 0
    
    const itemsPerSecond = elapsedTime > 0 
      ? Math.round((this.state.processedItems / elapsedTime) * 1000)
      : 0

    const message = this.generateProgressMessage()

    return {
      progress: { ...this.state },
      percentage,
      elapsedTime,
      itemsPerSecond,
      message
    }
  }

  /**
   * Gets a summary of the import results
   */
  getSummary(): {
    totalItems: number
    successCount: number
    errorCount: number
    successRate: number
    totalTime: number
    phase: string
    errors: ProgressError[]
  } {
    const totalTime = Date.now() - this.state.startTime
    const successRate = this.state.totalItems > 0 
      ? Math.round((this.state.successCount / this.state.totalItems) * 100)
      : 0

    return {
      totalItems: this.state.totalItems,
      successCount: this.state.successCount,
      errorCount: this.state.errorCount,
      successRate,
      totalTime,
      phase: this.state.phase,
      errors: [...this.state.errors]
    }
  }

  /**
   * Calculates estimated time remaining based on current progress
   */
  private calculateEstimatedTime(): void {
    const elapsedTime = Date.now() - this.state.startTime
    const remainingItems = this.state.totalItems - this.state.processedItems
    
    if (this.state.processedItems > 0 && remainingItems > 0) {
      const avgTimePerItem = elapsedTime / this.state.processedItems
      this.state.estimatedTimeRemaining = Math.round(avgTimePerItem * remainingItems)
    } else {
      this.state.estimatedTimeRemaining = undefined
    }
  }

  /**
   * Generates a human-readable progress message
   */
  private generateProgressMessage(): string {
    const { phase, processedItems, totalItems, currentBatch, totalBatches } = this.state
    
    switch (phase) {
      case 'reading':
        return 'Reading activities from GarminDB...'
      case 'transforming':
        return `Transforming activities (${processedItems}/${totalItems})...`
      case 'importing':
        const batchInfo = totalBatches > 0 ? ` [Batch ${currentBatch}/${totalBatches}]` : ''
        return `Importing to database (${processedItems}/${totalItems})${batchInfo}...`
      case 'complete':
        return `Import complete! Processed ${processedItems} activities.`
      case 'error':
        return `Import failed. Processed ${processedItems}/${totalItems} before error.`
      default:
        return `Processing... (${processedItems}/${totalItems})`
    }
  }

  /**
   * Notifies the callback with current progress
   */
  private notifyProgress(): void {
    if (this.callback) {
      this.callback(this.getProgress())
    }
  }
}

/**
 * Utility function to format time duration
 */
export function formatDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`
  } else {
    return `${seconds}s`
  }
}

/**
 * Utility function to format items per second rate
 */
export function formatRate(itemsPerSecond: number): string {
  if (itemsPerSecond > 1) {
    return `${itemsPerSecond} items/sec`
  } else if (itemsPerSecond > 0) {
    return `${Math.round(1 / itemsPerSecond)} sec/item`
  } else {
    return '0 items/sec'
  }
}
