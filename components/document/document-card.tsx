// TODO i |> fix typing
type DocumentCardProps = {
  document: any
  isAnalyzing: boolean
  selectedAnalysisType: any
  onAnalysisTypeChange: any
  onAnalyze: (documentId: string) => Promise<void>
  onDelete: (documentId: string) => Promise<void>
  onToggleSummary: (documentId: string) => void
  expandedSummaries: any
}

export function DocumentCard({
  document,
  isAnalyzing,
  selectedAnalysisType,
  onAnalysisTypeChange,
  onAnalyze,
  onDelete,
  onToggleSummary,
  expandedSummaries,
}: DocumentCardProps) {
  return <div>Document Card</div>
}
