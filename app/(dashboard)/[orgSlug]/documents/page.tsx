'use client'
import { useOrganization } from '@clerk/nextjs'
import { FileText, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { DocumentCard } from '@/components/document/document-card'
import { DocumentUploadDialog } from '@/components/document/document-upload-dialog'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { apiClient, unwrapApiResult } from '@/lib/apiClient'
import { analysisTypes, formatFileSize } from '@/lib/data/data'
import { useDocuments } from '@/lib/hooks/useDocuments'
import { AnalysisType } from '@/types'

export default function DocumentsPage() {
  const { organization } = useOrganization()
  const { documents, loadingDocuments, refetchDocuments } = useDocuments()

  const [analyzing, setAnalyzing] = useState<string | null>(null)
  const [selectedAnalysisType, setSelectedAnalysisType] = useState<AnalysisType>('summary')
  const [expandedSummary, setExpandedSummary] = useState<Set<string>>(new Set())

  const toggleSummary = (documentId: string) => {
    setExpandedSummary((prev) => {
      const next = new Set(prev)

      if (next.has(documentId)) {
        next.delete(documentId)
      } else {
        next.add(documentId)
      }

      return next
    })
  }

  const handleAnalyze = async (documentId: string) => {
    if (!organization) return

    setAnalyzing(documentId)

    try {
      const postAnalysisResult = unwrapApiResult(await apiClient.analyze.post({
        documentId,
        analysisType: selectedAnalysisType,
        organizationClerkId: organization.id
      }))

      if (!postAnalysisResult.ok) {
        toast.error(`Failed to analyze document: ${postAnalysisResult.error || 'Unknown error'}`)
        return
      }

      const analysisTypeLabel = analysisTypes.find(type => type.value === selectedAnalysisType)?.label || 'Document'

      toast.success(`${analysisTypeLabel} analysis completed successfully`)
      await refetchDocuments()
      setExpandedSummary(prev => new Set(prev).add(documentId))
    } catch (error) {
      console.error('Error analyzing document:', error)
      toast.error('Failed to analyze document')
    } finally {
      setAnalyzing(null)
    }
  }

  const handleDelete = async (documentId: string) => {
    try {
      const deleteResult = unwrapApiResult(
        await apiClient.documents.delete({ documentId }),
      )

      if (!deleteResult.ok) {
        toast.error(`Failed to delete document: ${deleteResult.error || 'Unknown error'}`)
        return
      }

      toast.success('Document deleted successfully')
      await refetchDocuments()
    } catch (error) {
      console.error('Error deleting document:', error)
      toast.error('Failed to delete document')
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Documents</h1>
          <p className="text-gray-600">
            Upload and analyze documents in {organization?.name}
          </p>
        </div>
        <DocumentUploadDialog onUploadSuccess={refetchDocuments} />
      </div>

      {!!documents.length && !loadingDocuments && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold">{documents.length}</div>
                <p className="text-sm text-gray-500">Total Documents</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {documents.filter((doc) => doc.aiSummary).length}
                </div>
                <p className="text-sm text-gray-500">Analyzed</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold">
                  {formatFileSize(
                    documents.reduce(
                      (acc, curr) => acc + (curr.fileSize || 0),
                      0,
                    ),
                  )}
                </div>
                <p className="text-sm text-gray-500">Total Size</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      <Card>
        <CardHeader>
          <CardTitle>
            Documents ({documents.length})
            {loadingDocuments && (
              <Loader2 className="h-4 w-4 inline ml-2 animate-spin" />
            )}
          </CardTitle>
          <CardDescription>
            {documents.filter((doc) => doc.aiSummary).length} analyzed •{' '}
            {documents.filter((doc) => !doc.aiSummary).length} pending
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingDocuments && (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading documents...</p>
            </div>
          )}
          {!loadingDocuments && !documents.length && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No documents uploaded yet</p>
              <p className="text-sm text-gray-500 mt-2">
                Upload your first document to get started
              </p>
            </div>
          )}
          {!loadingDocuments && !!documents.length && (
            <div className="space-y-6">
              {documents.map((doc) => (
                <DocumentCard
                  analyzing={analyzing === doc.id}
                  document={doc}
                  expandedSummary={expandedSummary}
                  key={doc.id}
                  selectedAnalysisType={selectedAnalysisType}
                  onAnalysisTypeChange={setSelectedAnalysisType}
                  onAnalyze={handleAnalyze}
                  onDelete={handleDelete}
                  onToggleSummary={toggleSummary}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
