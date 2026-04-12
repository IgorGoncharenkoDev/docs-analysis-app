'use client'

import {
  Brain,
  Calendar,
  Download,
  File,
  FileText,
  Loader2,
  Sparkles,
  Tag,
  Trash2,
  User,
} from 'lucide-react'
import { Dispatch, SetStateAction } from 'react'
import ReactMarkdown from 'react-markdown'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { analysisTypes , formatFileSize } from '@/lib/data/data'
import { AnalysisType } from '@/types'
import { GetDocumentDTO } from '@/types/dto'

type DocumentCardProps = {
  document: GetDocumentDTO
  analyzing: boolean
  selectedAnalysisType: AnalysisType
  onAnalysisTypeChange: Dispatch<SetStateAction<AnalysisType>>
  onAnalyze: (documentId: string) => void
  onDelete: (documentId: string) => void
  onToggleSummary: (documentId: string) => void
  expandedSummary: Set<string>
}

export function DocumentCard({
  document,
  analyzing,
  selectedAnalysisType,
  onAnalysisTypeChange,
  onAnalyze,
  onDelete,
  onToggleSummary,
  expandedSummary,
}: DocumentCardProps) {
  const isExpanded = expandedSummary.has(document.id)

  const getAnalysisIcon = (type: AnalysisType) => {
    const analysisType = analysisTypes.find((t) => t.value === type)
    const Icon = analysisType?.icon || Sparkles
    return <Icon className="h-4 w-4" />
  }

  return (
    <div className="border rounded-lg p-6 hover:shadow-lg transition-all">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4 flex-1">
          <div className="p-3 rounded-lg bg-blue-100">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-lg mb-1">{document.name}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {document.user.name || document.user.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(document.createdAt).toLocaleDateString()}
                  </span>
                  {document.fileSize && (
                    <span className="flex items-center gap-1">
                      <File className="h-3 w-3" />
                      {formatFileSize(document.fileSize) || 'N/A'}
                    </span>
                  )}
                </div>
              </div>
              {document.sentiment && (
                <Badge>
                  <div className="flex items-center gap-1">
                    <span className="capitalize">{document.sentiment}</span>
                  </div>
                </Badge>
              )}
            </div>

            {document.aiSummary && (
              <div className="mt-4 p-4 bg-linear-to-r from-gray-50 to-blue-50 rounded-lg border">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-green-600" />
                    <span className="font-medium">AI Analysis</span>
                    <Badge className="ml-2" variant="outline">
                      Gemini AI
                    </Badge>
                  </div>
                  {document.aiSummary.length > 200 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onToggleSummary(document.id)}
                    >
                      {isExpanded ? 'Show Less' : 'Show More'}
                    </Button>
                  )}
                </div>
                <div className="text-gray-700">
                  {isExpanded ? (
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown>{document.aiSummary}</ReactMarkdown>
                    </div>
                  ) : (
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown>
                        {document.aiSummary.length > 200
                          ? `${document.aiSummary.substring(0, 200)}...`
                          : document.aiSummary}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
                {document.aiKeywords.length > 0 && (
                  <div className="mt-4 pt-3 border-t">
                    <div className="flex items-center gap-2 mb-2">
                      <Tag className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">Key Topics</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {document.aiKeywords.slice(0, 8).map((keyword, idx) => (
                        <Badge
                          className="px-3 py-1"
                          key={idx}
                          variant="secondary"
                        >
                          {keyword}
                        </Badge>
                      ))}
                      {document.aiKeywords.length > 8 && (
                        <Badge className="px-3 py-1" variant="outline">
                          +{document.aiKeywords.length - 8} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 ml-4">
          {document.fileUrl && (
            <Button
              className="justify-start"
              size="sm"
              title="Download"
              variant="outline"
              onClick={() => document.fileUrl && window.open(document.fileUrl, '_blank')}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          )}

          <div className="space-y-2">
            <div className="text-xs text-gray-500">
              {document.aiSummary ? 'Re-analyze with:' : 'Analyze with:'}
            </div>

            <Select
              value={selectedAnalysisType}
              onValueChange={(value: AnalysisType) => onAnalysisTypeChange(value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue>
                  <div className="flex items-center gap-2">
                    {getAnalysisIcon(selectedAnalysisType)}
                    {
                      analysisTypes.find((t) => t.value === selectedAnalysisType)
                        ?.label
                    }
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {analysisTypes.map((type) => {
                  const { value, label, icon: Icon } = type
                  return (
                    <SelectItem key={value} value={value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {label}
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
            <Button
              className="justify-start w-full"
              disabled={analyzing}
              size="sm"
              variant={document.aiSummary ? "outline" : "default"}
              onClick={() => onAnalyze(document.id)}
            >
              {analyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {document.aiSummary ? 'Re-analyzing...' : 'Analyzing...'}
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  {document.aiSummary ? 'Re-analyze' : 'Analyze'}
                </>
              )}
            </Button>
          </div>
          <Button
            className="text-red-600 hover:text-red-700 hover:bg-red-50 justify-start"
            size="sm"
            variant="ghost"
            onClick={() => onDelete(document.id)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  )
}
