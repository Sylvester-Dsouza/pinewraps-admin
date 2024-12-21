import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { RewardHistory } from "@/types/reward"
import { format } from "date-fns"
import { ArrowUpCircle, ArrowDownCircle, History } from "lucide-react"

interface RewardHistoryDialogProps {
  history: RewardHistory[]
  customerName: string
}

export function RewardHistoryDialog({ history, customerName }: RewardHistoryDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <History className="h-4 w-4 mr-2" />
          View History
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Reward Points History - {customerName}</DialogTitle>
          <DialogDescription>
            Complete history of points earned and redeemed
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[400px] rounded-md border p-4">
          <div className="space-y-4">
            {history.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between border-b pb-4 last:border-0"
              >
                <div className="flex items-center space-x-4">
                  {item.type === 'EARNED' ? (
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                      <ArrowUpCircle className="h-5 w-5 text-green-600" />
                    </div>
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                      <ArrowDownCircle className="h-5 w-5 text-red-600" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium">
                      {item.type === 'EARNED' ? 'Earned' : 'Redeemed'}{' '}
                      <span className={item.type === 'EARNED' ? 'text-green-600' : 'text-red-600'}>
                        {item.type === 'EARNED' ? '+' : '-'}{Math.abs(item.points)} points
                      </span>
                    </p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                    {item.orderId && (
                      <p className="text-xs text-muted-foreground">
                        Order ID: {item.orderId}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {format(new Date(item.createdAt), 'PPp')}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
