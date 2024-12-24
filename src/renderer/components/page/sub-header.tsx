import { LucideIcon } from 'lucide-react'

interface SubHeaderProps {
    subHeader: string
    icon: LucideIcon
}

export function SubHeader({ subHeader, icon: Icon }: SubHeaderProps) {
    return (
        <div className="flex flex-row content-center gap-2 pb-4 pt-2">
            {Icon && <Icon size={20} className='mt-1'/>}
            <h1 className="text-xl font-semibold tracking-tight">{subHeader}</h1>
        </div>
    )
}