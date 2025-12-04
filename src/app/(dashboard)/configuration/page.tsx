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
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Configuration</h1>
        <p className="text-muted-foreground">
          Customize your AI receptionist's behavior.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>General Settings</CardTitle>
                    <CardDescription>Basic information about your business.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <FormField
                        control={form.control}
                        name="businessName"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Business Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Your Company LLC" {...field} />
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
                            <FormLabel>Greeting Message</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Welcome to..." {...field} />
                            </FormControl>
                            <FormDescription>
                                This is the first message your customers will see or hear.
                            </FormDescription>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Channels</CardTitle>
                    <CardDescription>Where your AI receptionist will be active.</CardDescription>
                </CardHeader>
                <CardContent>
                    <FormField
                        control={form.control}
                        name="channels"
                        render={() => (
                            <FormItem>
                            {channels.map((item) => (
                                <FormField
                                key={item.id}
                                control={form.control}
                                name="channels"
                                render={({ field }) => {
                                    return (
                                    <FormItem
                                        key={item.id}
                                        className="flex flex-row items-start space-x-3 space-y-0"
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
                                        <FormLabel className="font-normal">
                                        {item.label}
                                        </FormLabel>
                                    </FormItem>
                                    )
                                }}
                                />
                            ))}
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Escalation Rules</CardTitle>
                    <CardDescription>Define when to hand over to a human agent.</CardDescription>
                </CardHeader>
                <CardContent>
                     <FormField
                        control={form.control}
                        name="escalationKeywords"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Escalation Keywords</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., human, agent, representative" {...field} />
                            </FormControl>
                             <FormDescription>
                                Comma-separated keywords that will trigger an escalation.
                            </FormDescription>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </CardContent>
            </Card>

            <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90">Save Configuration</Button>
        </form>
      </Form>
    </div>
  )
}
