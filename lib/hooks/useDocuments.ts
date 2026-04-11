import { useOrganization } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { apiClient, unwrapApiResult } from '@/lib/apiClient'
import { Document } from '@/types'

// TODO i |> do the typing...
export function useDocuments() {
  const { organization } = useOrganization()

  // TODO i |> fix the typing...
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  const fetchDocuments = async () => {
    if (!organization) {
      return
    }

    try {
      // TODO i |> check the typing...
      const getDocumentsResult = unwrapApiResult(
        await apiClient.documents.get({ organizationId: organization.id }),
      )

      if (!getDocumentsResult.ok) {
        toast.error('Failed to fetch organization documents')
        // TODO i |> fix return...
        return
      }
      // TODO i |> fix the typing...
      // @ts-ignore
      setDocuments(getDocumentsResult.data.documents)
    } catch (error) {
      console.error('Error fetching documents:', error)
      toast.error('Failed to fetch documents')
    } finally {
      setLoading(false)
    }

    setLoading(true)
  }

  useEffect(() => {}, [organization])

  return {
    documents,
    loadingDocuments: loading,
  }
}
