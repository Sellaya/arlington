"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

const configSchema = z.object({
  businessName: z.string().min(2, {
    message: "Business name must be at least 2 characters.",
  }),
  greetingMessage: z.string().max(200, "Greeting message is too long."),
  channels: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You have to select at least one channel.",
  }),
  escalationKeywords: z.string().optional(),
})

const channels = [
  { id: "phone", label: "Phone Calls" },
  { id: "sms", label: "SMS / Text Messages" },
  { id: "webchat", label: "Website Chat" },
]

export default function ConfigurationPage() {
  const { toast } = useToast()

  const form = useForm<z.infer<typeof configSchema>>({
    resolver: zodResolver(configSchema),
    defaultValues: {
      businessName: "My Awesome Business",
      greetingMessage: "Hello! Thanks for contacting My Awesome Business. How can I help you today?",
      channels: ["phone", "webchat"],
      escalationKeywords: "human, agent, representative",
    },
  })

  function onSubmit(values: z.infer<typeof configSchema>) {
    toast({
      title: "Configuration Save (Demo)",
      description: "Saving this data is not implemented in the MVP version.",
      variant: "default",
    })
    console.log(values)
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-6 lg:gap-8 xl:gap-10">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold font-headline">Configuration</h1>
        <p className="text-sm sm:text-base lg:text-lg text-muted-foreground mt-1 lg:mt-2">
          Customize your AI receptionist's behavior and settings
        </p>
      </div>

      {/* Form with Responsive Layout */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6 lg:space-y-8 xl:space-y-10">
            {/* General Settings Card */}
            <Card>
                <CardHeader className="pb-3 sm:pb-4 lg:pb-6">
                    <CardTitle className="text-base sm:text-lg lg:text-xl">General Settings</CardTitle>
                    <CardDescription className="text-xs sm:text-sm lg:text-base">
                        Basic information about your business.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6 lg:space-y-8 lg:p-6">
                    <FormField
                        control={form.control}
                        name="businessName"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel className="text-sm sm:text-base">Business Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Your Company LLC" {...field} className="text-sm sm:text-base" />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="greetingMessage"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel className="text-sm sm:text-base">Greeting Message</FormLabel>
                            <FormControl>
                                <Textarea 
                                    placeholder="Welcome to..." 
                                    {...field} 
                                    className="text-sm sm:text-base min-h-[100px] sm:min-h-[120px]"
                                />
                            </FormControl>
                            <FormDescription className="text-xs sm:text-sm">
                                This is the first message your customers will see or hear.
                            </FormDescription>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </CardContent>
            </Card>

            {/* Channels Card */}
            <Card>
                <CardHeader className="pb-3 sm:pb-4 lg:pb-6">
                    <CardTitle className="text-base sm:text-lg lg:text-xl">Channels</CardTitle>
                    <CardDescription className="text-xs sm:text-sm lg:text-base">
                        Where your AI receptionist will be active.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 lg:space-y-6 lg:p-6">
                    <FormField
                        control={form.control}
                        name="channels"
                        render={() => (
                            <FormItem>
                            <div className="space-y-3 sm:space-y-4">
                                {channels.map((item) => (
                                    <FormField
                                    key={item.id}
                                    control={form.control}
                                    name="channels"
                                    render={({ field }) => {
                                        return (
                                        <FormItem
                                            key={item.id}
                                            className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border border-border/40 p-3 sm:p-4 hover:bg-muted/30 transition-colors"
                                        >
                                            <FormControl>
                                            <Checkbox
                                                checked={field.value?.includes(item.id)}
                                                onCheckedChange={(checked) => {
                                                return checked
                                                    ? field.onChange([...field.value, item.id])
                                                    : field.onChange(
                                                        field.value?.filter(
                                                        (value) => value !== item.id
                                                        )
                                                    )
                                                }}
                                            />
                                            </FormControl>
                                            <FormLabel className="font-normal text-sm sm:text-base cursor-pointer flex-1">
                                            {item.label}
                                            </FormLabel>
                                        </FormItem>
                                        )
                                    }}
                                    />
                                ))}
                            </div>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                </CardContent>
            </Card>

            {/* Escalation Rules Card */}
            <Card>
                <CardHeader className="pb-3 sm:pb-4 lg:pb-6">
                    <CardTitle className="text-base sm:text-lg lg:text-xl">Escalation Rules</CardTitle>
                    <CardDescription className="text-xs sm:text-sm lg:text-base">
                        Define when to hand over to a human agent.
                    </CardDescription>
                </CardHeader>
                <CardContent className="lg:p-6">
                     <FormField
                        control={form.control}
                        name="escalationKeywords"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel className="text-sm sm:text-base">Escalation Keywords</FormLabel>
                            <FormControl>
                                <Input 
                                    placeholder="e.g., human, agent, representative" 
                                    {...field} 
                                    className="text-sm sm:text-base"
                                />
                            </FormControl>
                             <FormDescription className="text-xs sm:text-sm">
                                Comma-separated keywords that will trigger an escalation.
                            </FormDescription>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end pt-2 sm:pt-4 lg:pt-6">
                <Button 
                    type="submit" 
                    className="w-full sm:w-auto bg-accent text-accent-foreground hover:bg-accent/90 text-sm sm:text-base lg:text-lg px-6 sm:px-8 lg:px-10 lg:h-12"
                >
                    Save Configuration
                </Button>
            </div>
        </form>
      </Form>
    </div>
  )
}
