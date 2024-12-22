import { PageHeader } from "@renderer/components/page/page-header"
import { FileQuestion } from "lucide-react"
import { PageContent } from "@renderer/components/page/page-content"
import { PageMain } from "@renderer/components/page/page-main"
import { createFileRoute } from '@tanstack/react-router'

// export const Route = createFileRoute('/page')({
//   component: Page,
// })

// npx @tanstack/router-cli generate

export default function Page() {
  return (
    <PageMain>   

      <PageHeader
        title={"Title"}
        description={"Description."}
        icon={FileQuestion}
      />

      {/* <PageContent>
        <DataTable columns={columns} data={data} />
      </PageContent> */}
      
    </PageMain>
  )
}