'use client'

import * as React from 'react'
import { Calendar as CalendarIcon, Clock } from 'lucide-react'
import { format } from 'date-fns'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'

interface DateTimePickerProps {
  date: Date | undefined
  setDate: (date: Date | undefined) => void
}

export function DateTimePicker({ date, setDate }: DateTimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  // Handle Date Selection
  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      // Preserve existing time if updating date
      const newDate = new Date(selectedDate)
      if (date) {
        newDate.setHours(date.getHours())
        newDate.setMinutes(date.getMinutes())
      }
      setDate(newDate)
    }
  }

  // Handle Time Selection
  const handleTimeChange = (type: 'hour' | 'minute', value: number) => {
    const newDate = date ? new Date(date) : new Date()
    if (type === 'hour') {
      newDate.setHours(value)
    } else {
      newDate.setMinutes(value)
    }
    setDate(newDate)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal',
            !date && 'text-muted-foreground',
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, 'PPP HH:mm') : <span>Pick a date & time</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="sm:flex">
          {/* Calendar Section */}
          <div className="p-3 border-b sm:border-b-0 sm:border-r">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              initialFocus
              fromDate={new Date()} // Disable past dates
            />
          </div>

          {/* Time Section */}
          <div className="flex flex-col sm:w-[160px] p-3">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Time</span>
            </div>
            <div className="flex h-[260px]">
              {/* Hours */}
              <ScrollArea className="w-full border-r pr-2">
                <div className="flex flex-col gap-1">
                  {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                    <Button
                      key={hour}
                      variant={date && date.getHours() === hour ? 'default' : 'ghost'}
                      size="sm"
                      className="justify-center font-normal"
                      onClick={() => handleTimeChange('hour', hour)}
                    >
                      {hour.toString().padStart(2, '0')}:00
                    </Button>
                  ))}
                </div>
                <ScrollBar orientation="vertical" />
              </ScrollArea>

              {/* Minutes (every 15 mins) */}
              <ScrollArea className="w-full pl-2">
                <div className="flex flex-col gap-1">
                  {[0, 15, 30, 45].map((minute) => (
                    <Button
                      key={minute}
                      variant={date && date.getMinutes() === minute ? 'default' : 'ghost'}
                      size="sm"
                      className="justify-center font-normal"
                      onClick={() => handleTimeChange('minute', minute)}
                    >
                      :{minute.toString().padStart(2, '0')}
                    </Button>
                  ))}
                </div>
                <ScrollBar orientation="vertical" />
              </ScrollArea>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
