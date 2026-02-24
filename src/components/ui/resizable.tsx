import { GripVertical } from "lucide-react"
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from "react-resizable-panels"

import { cn } from "@/lib/utils"

const ResizablePanelGroup = ({
    className,
    direction,
    ...props
}: React.ComponentProps<typeof PanelGroup> & { direction?: "horizontal" | "vertical" }) => (
    <PanelGroup
        orientation={direction}
        className={cn(
            "flex h-full w-full data-[panel-group-direction=vertical]:flex-col",
            className
        )}
        {...props}
    />
)

const ResizablePanel = Panel

const ResizableHandle = ({
    withHandle,
    className,
    ...props
}: React.ComponentProps<typeof PanelResizeHandle> & {
    withHandle?: boolean
}) => (
    <PanelResizeHandle
        className={cn(
            "relative flex w-2 mx-1 rounded-sm items-center justify-center after:absolute after:inset-y-0 after:left-1/2 after:w-4 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 [&[data-panel-group-direction=vertical]>div]:rotate-90 hover:bg-slate-200 transition-colors duration-200",
            className
        )}
        {...props}
    >
        {withHandle && (
            <div className="z-10 flex h-6 w-3 items-center justify-center rounded-sm border bg-border bg-gray-100 shadow-sm">
                <GripVertical className="h-3.5 w-3.5 text-gray-500" />
            </div>
        )}
    </PanelResizeHandle>
)

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
