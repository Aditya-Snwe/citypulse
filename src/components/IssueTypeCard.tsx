import type { LucideIcon } from 'lucide-react'
import {
  CircleDot,
  Construction,
  Droplets,
  Lightbulb,
  MoreHorizontal,
  Trash2,
  TreePine,
  Waves,
} from 'lucide-react'
import { cn } from '../lib/cn'
import type { IssueType } from '../types/report'

const ICONS: Record<IssueType, LucideIcon> = {
  Pothole: CircleDot,
  'Road Damage': Construction,
  Garbage: Trash2,
  'Water Leakage': Droplets,
  Waterlogging: Waves,
  'Broken Streetlight': Lightbulb,
  'Fallen Tree': TreePine,
  Other: MoreHorizontal,
}

export function IssueTypeCard({
  type,
  selected,
  onSelect,
}: {
  type: IssueType
  selected: boolean
  onSelect: (type: IssueType) => void
}) {
  const Icon = ICONS[type]

  return (
    <button
      type="button"
      onClick={() => onSelect(type)}
      className={cn(
        'flex min-h-[88px] flex-col items-center justify-center gap-2 rounded-2xl border p-3 text-center transition-all active:scale-[0.98]',
        selected
          ? 'border-primary bg-primary-fixed text-primary shadow-sm ring-2 ring-primary/20'
          : 'border-outline-variant/50 bg-surface-lowest text-on-surface hover:border-primary/50',
      )}
    >
      <Icon className="h-6 w-6" />
      <span className="text-[13px] leading-4 font-semibold">{type}</span>
    </button>
  )
}
