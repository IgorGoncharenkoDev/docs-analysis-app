import { useOrganization } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { apiClient, unwrapApiResult } from '@/lib/apiClient'
import { GetDocumentDTO } from '@/types/dto'

export function useDocuments(): {
  documents: GetDocumentDTO[]
  loadingDocuments: boolean
  refetchDocuments: () => Promise<void>
} {
  const { organization } = useOrganization()

  const [documents, setDocuments] = useState<GetDocumentDTO[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  const fetchDocuments = async () => {
    if (!organization) {
      return
    }
    
    setLoading(true)

    try {
      const getDocumentsResult = unwrapApiResult(
        await apiClient.documents.get({ organizationId: organization.id }),
      )

      if (!getDocumentsResult.ok) {
        toast.error('Failed to fetch organization documents')
      } else {
        setDocuments(getDocumentsResult.data.documents)
      }
    } catch (error) {
      console.error('Error fetching documents:', error)
      toast.error('Failed to fetch documents')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDocuments()
  }, [organization])

  return {
    documents,
    loadingDocuments: loading,
    refetchDocuments: fetchDocuments,
  }
}
