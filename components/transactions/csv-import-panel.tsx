'use client'

import * as React from 'react'
import { AlertCircle, CheckCircle2, FileSpreadsheet, Upload } from 'lucide-react'
import { toast } from 'sonner'
import {
  BottomSheetBody,
  BottomSheetFooter,
} from '@/components/ui/bottom-sheet'
import { PrimaryButton, SecondaryButton } from '@/components/transactions/primary-button'
import { useCategories } from '@/lib/hooks/use-categories'
import { useImportTransactions } from '@/lib/hooks/use-transactions'
import { parseTransactionsCsv, type CsvImportPreview } from '@/lib/import/csv'
import { cn, formatNGN } from '@/lib/utils'

type CsvImportPanelProps = {
  onSuccess: () => void
  onBack: () => void
}

export function CsvImportPanel({ onSuccess, onBack }: CsvImportPanelProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = React.useState<string | null>(null)
  const [preview, setPreview] = React.useState<CsvImportPreview | null>(null)
  const [readError, setReadError] = React.useState<string | null>(null)

  const { data: categories = [], isLoading: categoriesLoading } = useCategories({
    includeArchived: false,
  })
  const importMutation = useImportTransactions()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setReadError(null)
    setFileName(file.name)

    try {
      const text = await file.text()
      const parsed = parseTransactionsCsv(text, categories)
      setPreview(parsed)
    } catch {
      setPreview(null)
      setReadError('Could not read that CSV file. Check the file and try again.')
    } finally {
      // Allow re-selecting the same file after fixing rows
      e.target.value = ''
    }
  }

  const handleImport = async () => {
    if (!preview || preview.validRows.length === 0 || importMutation.isPending) return

    try {
      const payload = preview.validRows.map((r) => r.input)
      const res = await importMutation.mutateAsync(payload)
      toast.success(
        `Imported ${res.insertedCount} transaction${res.insertedCount === 1 ? '' : 's'}`
      )
      onSuccess()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Could not import transactions'
      )
    }
  }

  const validCount = preview?.validRows.length ?? 0

  return (
    <>
      <BottomSheetBody>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          onChange={(e) => void handleFileChange(e)}
          className="sr-only"
          aria-label="Select CSV file"
        />

        <div className="overflow-hidden rounded-xl border border-border bg-bg-subtle p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-muted text-orange">
              <FileSpreadsheet className="h-5 w-5" aria-hidden />
            </div>
            <div className="min-w-0 flex-1 overflow-hidden">
              <p
                title={fileName ?? undefined}
                className="truncate text-sm font-semibold text-text-primary"
              >
                {fileName ?? 'Upload a CSV file'}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-text-secondary">
                Needs <span className="font-medium text-text-primary">Date</span>,{' '}
                <span className="font-medium text-text-primary">Type</span>, and{' '}
                <span className="font-medium text-text-primary">Amount</span> columns.
                Extra columns like time or transaction ID are filtered out automatically.
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={categoriesLoading || importMutation.isPending}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'pressable mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-border-strong bg-bg-elevated px-4 text-sm font-semibold text-text-primary',
              'transition-colors hover:bg-bg-surface',
              'disabled:pointer-events-none disabled:opacity-40',
              'cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange'
            )}
          >
            <Upload className="h-4 w-4" aria-hidden />
            {fileName ? 'Choose another CSV' : 'Choose CSV file'}
          </button>
        </div>

        {readError ? (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-xl border border-red/40 bg-red-muted px-3.5 py-3 text-xs text-red"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span>{readError}</span>
          </div>
        ) : null}

        {preview ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-xl border border-border bg-bg-surface px-3.5 py-3">
              <div className="flex items-center gap-2 min-w-0">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-green" aria-hidden />
                <span className="text-sm font-semibold text-text-primary tabular-nums">
                  {validCount} ready to import
                </span>
              </div>
              {preview.errors.length > 0 ? (
                <span className="text-xs font-medium text-red tabular-nums">
                  {preview.errors.length} skipped
                </span>
              ) : null}
            </div>

            {validCount > 0 ? (
              <div className="grid grid-cols-2 gap-2.5">
                <div className="rounded-xl border border-border bg-bg-surface p-3 min-w-0">
                  <p className="text-xs text-text-secondary">Income</p>
                  <p className="mt-1 truncate text-sm font-semibold text-green tabular-nums">
                    +{formatNGN(preview.totalIncome)}
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-bg-surface p-3 min-w-0">
                  <p className="text-xs text-text-secondary">Expense</p>
                  <p className="mt-1 truncate text-sm font-semibold text-red tabular-nums">
                    -{formatNGN(preview.totalExpense)}
                  </p>
                </div>
              </div>
            ) : null}

            {preview.ignoredColumns.length > 0 ? (
              <div className="rounded-xl border border-border bg-bg-surface px-3.5 py-2.5 text-xs text-text-secondary break-words">
                <span className="font-medium text-text-primary">
                  Filtered out extra columns:
                </span>{' '}
                {preview.ignoredColumns.join(', ')}
              </div>
            ) : null}

            {preview.categoryMappings.length > 0 ? (
              <div className="rounded-xl border border-amber/40 bg-amber-muted px-3.5 py-2.5 text-xs text-text-primary">
                <p className="font-semibold text-amber">Category mapping</p>
                <ul className="mt-1 space-y-0.5 text-text-secondary">
                  {preview.categoryMappings.slice(0, 5).map((m) => (
                    <li key={`${m.from}-${m.to}`} className="truncate">
                      {m.from} → <span className="text-text-primary">{m.to}</span>{' '}
                      <span className="tabular-nums">({m.count})</span>
                    </li>
                  ))}
                  {preview.categoryMappings.length > 5 ? (
                    <li>+{preview.categoryMappings.length - 5} more mapped</li>
                  ) : null}
                </ul>
              </div>
            ) : null}

            {validCount > 0 ? (
              <div className="rounded-xl border border-border bg-bg-surface px-3.5 py-2.5">
                <p className="text-xs font-medium text-text-secondary">
                  Preview ({Math.min(3, validCount)} of {validCount})
                </p>
                <ul className="mt-2 divide-y divide-border">
                  {preview.validRows.slice(0, 3).map((row) => (
                    <li
                      key={row.rowNumber}
                      className="flex items-center justify-between gap-2 py-2 first:pt-0 last:pb-0 text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-text-primary">
                          {row.input.description || row.categoryName}
                        </p>
                        <p className="truncate text-text-tertiary tabular-nums">
                          {row.input.transaction_date} · {row.categoryName}
                        </p>
                      </div>
                      <span
                        className={cn(
                          'shrink-0 font-semibold tabular-nums',
                          row.input.type === 'income' ? 'text-green' : 'text-text-primary'
                        )}
                      >
                        {row.input.type === 'income' ? '+' : '-'}
                        {formatNGN(row.input.amount)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {preview.errors.length > 0 ? (
              <div
                role="alert"
                className="rounded-xl border border-red/40 bg-red-muted px-3.5 py-2.5 text-xs text-red"
              >
                <p className="font-semibold">Row issues</p>
                <ul className="mt-1 space-y-0.5">
                  {preview.errors.slice(0, 4).map((err) => (
                    <li key={`${err.rowNumber}-${err.message}`} className="break-words">
                      Row {err.rowNumber}: {err.message}
                    </li>
                  ))}
                  {preview.errors.length > 4 ? (
                    <li>+{preview.errors.length - 4} more rows skipped</li>
                  ) : null}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}
      </BottomSheetBody>

      <BottomSheetFooter className="flex-col sm:flex-col">
        <PrimaryButton
          onClick={() => void handleImport()}
          disabled={validCount === 0 || importMutation.isPending}
          loading={importMutation.isPending}
        >
          {validCount > 0
            ? `Import ${validCount} transaction${validCount === 1 ? '' : 's'}`
            : 'Import transactions'}
        </PrimaryButton>
        <SecondaryButton
          type="button"
          onClick={onBack}
          disabled={importMutation.isPending}
        >
          Back to manual entry
        </SecondaryButton>
      </BottomSheetFooter>
    </>
  )
}
