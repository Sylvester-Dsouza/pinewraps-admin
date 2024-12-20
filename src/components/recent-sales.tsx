import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function RecentSales() {
  return (
    <div className="space-y-8">
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarImage src="/avatars/01.png" alt="Avatar" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">John Doe</p>
          <p className="text-sm text-muted-foreground">john@example.com</p>
        </div>
        <div className="ml-auto font-medium">+$249.00</div>
      </div>
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarImage src="/avatars/02.png" alt="Avatar" />
          <AvatarFallback>JC</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">Jane Cooper</p>
          <p className="text-sm text-muted-foreground">jane@example.com</p>
        </div>
        <div className="ml-auto font-medium">+$349.00</div>
      </div>
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarImage src="/avatars/03.png" alt="Avatar" />
          <AvatarFallback>RK</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">Robert King</p>
          <p className="text-sm text-muted-foreground">robert@example.com</p>
        </div>
        <div className="ml-auto font-medium">+$499.00</div>
      </div>
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarImage src="/avatars/04.png" alt="Avatar" />
          <AvatarFallback>BW</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">Brooklyn Williams</p>
          <p className="text-sm text-muted-foreground">brooklyn@example.com</p>
        </div>
        <div className="ml-auto font-medium">+$399.00</div>
      </div>
    </div>
  )
}
