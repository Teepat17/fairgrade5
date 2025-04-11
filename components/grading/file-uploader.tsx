"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, X, File, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

interface FileUploaderProps {
  accept: string
  multiple?: boolean
  maxFiles?: number
  onChange: (files: File[]) => void
}

export function FileUploader({ accept, multiple = false, maxFiles = 10, onChange }: FileUploaderProps) {
  const [files, setFiles] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileList = Array.from(e.target.files)

      if (multiple) {
        if (files.length + fileList.length > maxFiles) {
          toast({
            title: "Too many files",
            description: `You can upload a maximum of ${maxFiles} files`,
            variant: "destructive",
          })
          return
        }

        const newFiles = [...files, ...fileList]
        setFiles(newFiles)
        onChange(newFiles)
      } else {
        setFiles(fileList)
        onChange(fileList)
      }
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files) {
      const fileList = Array.from(e.dataTransfer.files).filter((file) => {
        const fileType = file.type
        return accept.includes(fileType) || accept.includes(`.${file.name.split(".").pop()}`)
      })

      if (fileList.length === 0) {
        toast({
          title: "Invalid file type",
          description: `Please upload files with the following format: ${accept}`,
          variant: "destructive",
        })
        return
      }

      if (multiple) {
        if (files.length + fileList.length > maxFiles) {
          toast({
            title: "Too many files",
            description: `You can upload a maximum of ${maxFiles} files`,
            variant: "destructive",
          })
          return
        }

        const newFiles = [...files, ...fileList]
        setFiles(newFiles)
        onChange(newFiles)
      } else {
        setFiles([fileList[0]])
        onChange([fileList[0]])
      }
    }
  }

  const removeFile = (index: number) => {
    const newFiles = [...files]
    newFiles.splice(index, 1)
    setFiles(newFiles)
    onChange(newFiles)
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  // Function to determine if file is an image
  const isImageFile = (file: File) => {
    return file.type.startsWith("image/")
  }

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center ${
          isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
        />
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="rounded-full bg-primary/10 p-3">
            <Upload className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-medium">Drag & drop {multiple ? "files" : "a file"} here</h3>
          <p className="text-sm text-muted-foreground">or click to browse your computer</p>
          <Button type="button" variant="outline" size="sm" onClick={triggerFileInput} className="mt-2">
            Select {multiple ? "Files" : "File"}
          </Button>
          <p className="text-xs text-muted-foreground mt-2">Accepted formats: {accept}</p>
          {multiple && <p className="text-xs text-muted-foreground">Maximum {maxFiles} files</p>}
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Selected Files:</h4>
          <ul className="space-y-2">
            {files.map((file, index) => (
              <li key={`${file.name}-${index}`} className="flex items-center justify-between rounded-md border p-2">
                <div className="flex items-center space-x-2">
                  {isImageFile(file) ? (
                    <ImageIcon className="h-4 w-4 text-primary" />
                  ) : (
                    <File className="h-4 w-4 text-primary" />
                  )}
                  <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                  <span className="text-xs text-muted-foreground">({(file.size / 1024).toFixed(1)} KB)</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Remove file</span>
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
