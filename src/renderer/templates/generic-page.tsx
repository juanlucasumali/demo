import { PageHeader } from '@renderer/components/page/page-header'
import { PageContent } from '@renderer/components/page/page-content'
import { PageMain } from '@renderer/components/page/page-main'
import { Dialog, DialogContent } from '@renderer/components/ui/dialog'
import { Button } from '@renderer/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@renderer/components/ui/tooltip'
import { ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'

// export const Route = createFileRoute('/generic')({
//   component: GenericPage,
// })

// npx @tanstack/router-cli generate

// Generic Page Header with dynamic buttons
function PageHeaderWithButtons({
  title,
  description,
  icon: Icon,
  buttons,
}: {
  title: string
  description: string
  icon: LucideIcon
  buttons: { icon: LucideIcon; tooltip: string; onClick: () => void }[]
}) {
  return (
    <PageHeader title={title} description={description} icon={Icon}>
      {buttons.map((button, index) => (
        <TooltipProvider key={index} delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="default" onClick={button.onClick}>
                <button.icon />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{button.tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </PageHeader>
  )
}

// Generic Dialog Manager
function DialogManager({
  dialogs,
}: {
  dialogs: { open: boolean; setOpen: (state: boolean) => void; title: string; content: ReactNode }[]
}) {
  return (
    <>
      {dialogs.map((dialog, index) => (
        <Dialog key={index} open={dialog.open} onOpenChange={dialog.setOpen}>
          <DialogContent>
            <div>{dialog.title}</div>
            {dialog.content}
          </DialogContent>
        </Dialog>
      ))}
    </>
  )
}

// Generic Page Component
export function GenericPage({
  title,
  description,
  icon,
  buttons,
  dialogs,
  children,
}: {
  title: string
  description: string
  icon: LucideIcon
  buttons: { icon: LucideIcon; tooltip: string; onClick: () => void }[]
  dialogs: { open: boolean; setOpen: (state: boolean) => void; title: string; content: ReactNode }[]
  children: ReactNode
}) {
  return (
    <PageMain>
      <PageHeaderWithButtons title={title} description={description} icon={icon} buttons={buttons} />
      <PageContent>{children}</PageContent>
      <DialogManager dialogs={dialogs} />
    </PageMain>
  )
}