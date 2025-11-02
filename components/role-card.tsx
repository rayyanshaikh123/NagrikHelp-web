"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

export function RoleCard({
  title,
  description,
  onSelect,
  avatarSrc,
  avatarFallback,
  layout = 'horizontal', // new prop
}: {
  title: string
  description: string
  onSelect: () => void
  avatarSrc?: string
  avatarFallback?: string
  layout?: 'horizontal' | 'vertical'
}) {
  const vertical = layout === 'vertical'
  return (
    <Card className={cn('flex flex-col h-full w-full', vertical && 'items-center text-center w-full')}> 
      <CardHeader className={cn('pb-3', vertical ? 'flex flex-col items-center gap-4 w-full' : 'flex flex-row items-start gap-4 pb-3')}> 
        <Avatar className={cn('border border-border/60', vertical ? 'size-24 md:size-28 shadow-sm' : 'size-12')}> 
          {avatarSrc && <AvatarImage src={avatarSrc} alt={title} />}
          <AvatarFallback className={cn(vertical ? 'text-lg md:text-xl' : '')}>{avatarFallback || title.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className={cn('space-y-1 w-full', vertical && 'max-w-xs md:max-w-sm')}> 
          <CardTitle className={cn('font-semibold leading-snug', vertical ? 'text-xl md:text-2xl' : 'text-lg')}>{title}</CardTitle>
          <CardDescription className={cn('text-pretty leading-relaxed', vertical ? 'text-sm md:text-base' : 'text-xs md:text-sm')}>{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className={cn('mt-auto pt-0 w-full', vertical && 'pt-2 max-w-xs md:max-w-sm')}> 
        <Button onClick={onSelect} className="w-full" size={vertical ? 'default' : 'sm'}>
          Continue as {title}
        </Button>
      </CardContent>
    </Card>
  )
}
