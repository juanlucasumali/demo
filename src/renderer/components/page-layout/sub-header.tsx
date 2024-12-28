interface SubHeaderProps {
    subHeader: string
}

export function SubHeader({ subHeader }: SubHeaderProps) {
    return (
        <div className="flex flex-row content-center gap-2 pb-4">
            <h1 className="text-xl font-semibold tracking-tight">{subHeader}</h1>
        </div>
    )
}