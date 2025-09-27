/**
 * Sync History Table Component
 * Displays recent sync operations with status and results
 * T6: Scheduled Sync and Automation
 */

'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { RefreshCw, ChevronDown, ChevronRight, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { GarminSyncHistory } from '@/lib/garmin/types'
import { useState } from 'react'

interface SyncHistoryTableProps {
  history: GarminSyncHistory[]
  onRefresh: () => void
}

export function SyncHistoryTable({ history, onRefresh }: SyncHistoryTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const toggleRow = (syncId: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(syncId)) {
      newExpanded.delete(syncId)
    } else {
      newExpanded.add(syncId)
    }
    setExpandedRows(newExpanded)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Clock className="h-4 w-4 text-blue-500" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'cancelled':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    const variant = status === 'completed' ? 'default' : 
                   status === 'failed' ? 'destructive' :
                   status === 'running' ? 'secondary' : 'outline'
    
    return <Badge variant={variant}>{status}</Badge>
  }

  const formatDuration = (durationMs: number | null) => {
    if (!durationMs) return 'N/A'
    
    const seconds = Math.floor(durationMs / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`
    }
    return `${seconds}s`
  }

  if (history.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No sync history available</p>
            <p className="text-sm">Sync operations will appear here once you start syncing</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={onRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Started</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Results</TableHead>
              <TableHead>Data Types</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.map((sync) => (
              <Collapsible key={sync.sync_id} asChild>
                <>
                  <TableRow className="cursor-pointer hover:bg-muted/50">
                    <TableCell>
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => toggleRow(sync.sync_id)}
                        >
                          {expandedRows.has(sync.sync_id) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">
                          {new Date(sync.started_at).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(sync.started_at).toLocaleTimeString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {sync.sync_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(sync.status)}
                        {getStatusBadge(sync.status)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {formatDuration(sync.duration_ms)}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {sync.activities_imported > 0 && (
                          <div className="text-xs">
                            {sync.activities_imported} activities
                          </div>
                        )}
                        {sync.wellness_records_imported > 0 && (
                          <div className="text-xs">
                            {sync.wellness_records_imported} wellness
                          </div>
                        )}
                        {sync.activities_imported === 0 && sync.wellness_records_imported === 0 && (
                          <div className="text-xs text-muted-foreground">
                            No imports
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {sync.data_types.map(type => (
                          <Badge key={type} variant="secondary" className="text-xs">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                  
                  <CollapsibleContent asChild>
                    <TableRow>
                      <TableCell colSpan={7} className="bg-muted/25">
                        <div className="p-4 space-y-3">
                          {/* Detailed Results */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <div className="font-medium">Activities</div>
                              <div className="text-muted-foreground">
                                {sync.activities_imported} imported, {sync.activities_skipped} skipped
                              </div>
                            </div>
                            <div>
                              <div className="font-medium">Wellness</div>
                              <div className="text-muted-foreground">
                                {sync.wellness_records_imported} imported, {sync.wellness_skipped} skipped
                              </div>
                            </div>
                            <div>
                              <div className="font-medium">Completed</div>
                              <div className="text-muted-foreground">
                                {sync.completed_at 
                                  ? new Date(sync.completed_at).toLocaleString()
                                  : 'Still running'
                                }
                              </div>
                            </div>
                            <div>
                              <div className="font-medium">Sync ID</div>
                              <div className="text-muted-foreground font-mono text-xs">
                                {sync.sync_id.substring(0, 8)}...
                              </div>
                            </div>
                          </div>

                          {/* Errors */}
                          {sync.errors.length > 0 && (
                            <div className="space-y-2">
                              <div className="font-medium text-red-600">Errors ({sync.errors.length})</div>
                              <div className="space-y-1">
                                {sync.errors.slice(0, 5).map((error, index) => (
                                  <div key={index} className="text-xs text-red-600 bg-red-50 p-2 rounded">
                                    {error}
                                  </div>
                                ))}
                                {sync.errors.length > 5 && (
                                  <div className="text-xs text-muted-foreground">
                                    ... and {sync.errors.length - 5} more errors
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Metadata */}
                          {sync.metadata && Object.keys(sync.metadata).length > 0 && (
                            <div className="space-y-2">
                              <div className="font-medium">Metadata</div>
                              <div className="text-xs font-mono bg-muted p-2 rounded">
                                {JSON.stringify(sync.metadata, null, 2)}
                              </div>
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  </CollapsibleContent>
                </>
              </Collapsible>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
