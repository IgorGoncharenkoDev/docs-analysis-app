'use client'

import { useOrganization, useUser } from '@clerk/nextjs'
import { Loader2, Upload, X } from 'lucide-react'
import React, { useRef, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { apiClient, unwrapApiResult } from '@/lib/apiClient'
import { allowedTypes } from '@/lib/data/data'

// TODO i |>
//  Props must be serializable for components in the "use client" entry file
type DocumentUploadDialogProps = {
  onUploadSuccess?: () => void
  trigger?: React.ReactNode
}

export function DocumentUploadDialog({
  onUploadSuccess,
  trigger,
}: DocumentUploadDialogProps) {
  const { organization } = useOrganization()
  const { user } = useUser()

  const [open, setOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [documentName, setDocumentName] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const resetForm = () => {
    setDocumentName('')
    setSelectedFile(null)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    // single file upload only
    const file = e.target.files?.[0]

    if (!file) return

    // file size limit: 10Mb
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds 10MB limit')
      return
    }

    if (!allowedTypes.includes(file.type)) {
      toast.error('Unsupported file type')
      return
    }

    // removing file extention
    setDocumentName(file.name.replace(/\.[^/.]+$/, ""))
    setSelectedFile(file)
  }

  const handleFileUpload = async () => {
    if (!organization || !user || !selectedFile) {
      toast.error("Please select a file");
      return;
    }

    if (!documentName.trim()) {
      toast.error("Please enter a document name");
      return;
    }

    setUploading(true)

    const formData = new FormData()
    formData.append('name', documentName)
    formData.append('clerkOrgId', organization.id)
    formData.append('file', selectedFile)

    try {
      const postDocumentResult = unwrapApiResult(await apiClient.documents.post(formData))

      if (!postDocumentResult.ok) {
        toast.error(postDocumentResult.error || 'Failed to upload document')
      }

      toast.success('Document uploaded successfully')
      resetForm()
      setOpen(false)

      onUploadSuccess?.()
    } catch (error: unknown) {
      console.error('Error uploading document:', error)
      toast.error('Failed to upload document')
    } finally {
      setUploading(false)
    }
  }

  const handleDialogOpen = (open: boolean) => {
    setOpen(open)

    if (!open) {
      resetForm()

      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>
            Upload a file or enter text content for analysis
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Document Name *
            </label>
            <Input
              disabled={uploading}
              placeholder="Enter document name"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Upload File
            </label>
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <input
                accept=".txt,.pdf,.doc,.docx,.md"
                className="hidden"
                disabled={uploading}
                id="file-upload"
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
              />
              <label className="cursor-pointer" htmlFor="file-upload">
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-8 w-8 text-gray-400" />
                  <span className="font-medium">
                    {selectedFile ? selectedFile.name : 'Click to select file'}
                  </span>
                  <span className="text-sm text-gray-500">
                    Supports: .txt, .pdf, .doc, .docx, .md (Max 10MB)
                  </span>
                  {selectedFile && (
                    <Button
                      size="sm"
                      type="button"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedFile(null)
                        if (fileInputRef.current) {
                          fileInputRef.current.value = ''
                        }
                      }}
                    >
                      <X className="h-3 w-3 mr-1" />
                      Remove
                    </Button>
                  )}
                </div>
              </label>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            disabled={uploading}
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            disabled={!documentName.trim() || uploading}
            onClick={handleFileUpload}
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
