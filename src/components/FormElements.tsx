'use client'

interface FieldProps {
  label: string
  hint?: string
  error?: string
  required?: boolean
  children: React.ReactNode
}

export function Field({ label, hint, error, required, children }: FieldProps) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

export function Input({ error, className = '', ...props }: InputProps) {
  return (
    <input
      className={`w-full border rounded-lg px-3 py-2 text-sm outline-none transition-colors
        ${error
          ? 'border-red-300 focus:border-red-500 bg-red-50'
          : 'border-gray-200 focus:border-blue-500 bg-white'
        } ${className}`}
      {...props}
    />
  )
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean
}

export function Select({ error, className = '', children, ...props }: SelectProps) {
  return (
    <select
      className={`w-full border rounded-lg px-3 py-2 text-sm outline-none transition-colors bg-white
        ${error
          ? 'border-red-300 focus:border-red-500'
          : 'border-gray-200 focus:border-blue-500'
        } ${className}`}
      {...props}
    >
      {children}
    </select>
  )
}

export function Callout({ type, children }: { type: 'info' | 'warning' | 'danger' | 'success', children: React.ReactNode }) {
  const styles = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    danger: 'bg-red-50 border-red-200 text-red-800',
    success: 'bg-green-50 border-green-200 text-green-800',
  }
  return (
    <div className={`border rounded-lg p-4 text-sm leading-relaxed ${styles[type]}`}>
      {children}
    </div>
  )
}
