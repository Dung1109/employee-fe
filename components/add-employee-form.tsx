"use client";

import {useState} from "react";
import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import * as z from "zod";
import {format} from "date-fns";
import {ArrowBigLeftDash, CalendarIcon, Plus, TimerReset} from "lucide-react";

import {Button} from "@/components/ui/button";
import {Card, CardContent, CardFooter, CardHeader, CardTitle,} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select";
import {Textarea} from "@/components/ui/textarea";
import {Checkbox} from "@/components/ui/checkbox";
import {Calendar} from "@/components/ui/calendar";
import {Popover, PopoverContent, PopoverTrigger,} from "@/components/ui/popover";
import {cn} from "@/lib/utils";
import {toast} from "@/hooks/use-toast";
import axios from "axios";
import {useRouter} from "next/navigation";

const formSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    phone: z.string().min(1, "Phone number is required"),
    dateOfBirth: z.date({
        required_error: "Date of birth is required",
    }),
    gender: z.enum(["female", "male"], {
        required_error: "Gender is required",
    }),
    account: z.string().min(1, "Account is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    address: z.string().optional(),
    active: z.boolean().optional(),
    departmentName: z.string({
        required_error: "Department is required",
    }),
    remark: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function AddEmployeeForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const router = useRouter();
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            active: false,
            departmentName: undefined,
        },
    });

    const onSubmit = async (data: FormValues) => {
        setIsSubmitting(true);
        const transformedData = {
            ...data,
            gender: data.gender === "male" ? 0 : 1,
            status: data.active ? 0 : 1,
        };

        console.log(transformedData);
        try {
            const response = await axios.post(
                "http://localhost:8080/api/v1/employee/",
                transformedData,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.status !== 200) {
                throw new Error("Failed to add employee");
            }

            toast({
                title: "Employee Added",
                description:
                    "The employee has been successfully added to the system.",
            });
            form.reset();
        } catch (error) {
            console.error("Error adding employee:", error);
            toast({
                title: "Error",
                description: "Failed to add employee. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    function handleBack(): void {
        router.push("/employee");
    }

    return (
        <Card className="w-full p-4 md:p-6">
            <CardHeader>
                <CardTitle>Add Employee</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="grid gap-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">
                                    First name{" "}
                                    <span className="text-red-600">(*)</span>
                                </Label>
                                <Input
                                    id="firstName"
                                    {...form.register("firstName")}
                                />
                                {form.formState.errors.firstName && (
                                    <p className="text-sm text-red-600">
                                        {
                                            form.formState.errors.firstName
                                                .message
                                        }
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">
                                    Last name{" "}
                                    <span className="text-red-600">(*)</span>
                                </Label>
                                <Input
                                    id="lastName"
                                    {...form.register("lastName")}
                                />
                                {form.formState.errors.lastName && (
                                    <p className="text-sm text-red-600">
                                        {form.formState.errors.lastName.message}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">
                                Phone number{" "}
                                <span className="text-red-600">(*)</span>
                            </Label>
                            <Input id="phone" {...form.register("phone")} />
                            {form.formState.errors.phone && (
                                <p className="text-sm text-red-600">
                                    {form.formState.errors.phone.message}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label>
                                Date of birth{" "}
                                <span className="text-red-600">(*)</span>
                            </Label>
                            <Controller
                                name="dateOfBirth"
                                control={form.control}
                                render={({field}) => (
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full justify-start text-left font-normal",
                                                    !field.value &&
                                                    "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4"/>
                                                {field.value ? (
                                                    format(field.value, "PPP")
                                                ) : (
                                                    <span>Pick a date</span>
                                                )}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent
                                            className="w-auto p-0"
                                            align="start"
                                        >
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) =>
                                                    date > new Date() ||
                                                    date <
                                                    new Date("1900-01-01")
                                                }
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                )}
                            />
                            {form.formState.errors.dateOfBirth && (
                                <p className="text-sm text-red-600">
                                    {form.formState.errors.dateOfBirth.message}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label>
                                Gender <span className="text-red-600">(*)</span>
                            </Label>
                            <Controller
                                name="gender"
                                control={form.control}
                                render={({field}) => (
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        className="flex flex-col space-y-1"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem
                                                value="male"
                                                id="male"
                                            />
                                            <Label htmlFor="male">Male</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem
                                                value="female"
                                                id="female"
                                            />
                                            <Label htmlFor="female">
                                                Female
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                )}
                            />
                            {form.formState.errors.gender && (
                                <p className="text-sm text-red-600">
                                    {form.formState.errors.gender.message}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="account">
                                Account{" "}
                                <span className="text-red-600">(*)</span>
                            </Label>
                            <Input id="account" {...form.register("account")} />
                            {form.formState.errors.account && (
                                <p className="text-sm text-red-600">
                                    {form.formState.errors.account.message}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">
                                Email <span className="text-red-600">(*)</span>
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                {...form.register("email")}
                            />
                            {form.formState.errors.email && (
                                <p className="text-sm text-red-600">
                                    {form.formState.errors.email.message}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">
                                Password{" "}
                                <span className="text-red-600">(*)</span>
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                {...form.register("password")}
                            />
                            {form.formState.errors.password && (
                                <p className="text-sm text-red-600">
                                    {form.formState.errors.password.message}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="address">Address</Label>
                            <Textarea
                                id="address"
                                {...form.register("address")}
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Controller
                                name="active"
                                control={form.control}
                                render={({field}) => (
                                    <Checkbox
                                        id="active"
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                )}
                            />
                            <Label htmlFor="active">Active</Label>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="departmentName">
                                Department <span className="text-red-600">(*)</span>
                            </Label>
                            <Controller
                                name="departmentName"
                                control={form.control}
                                render={({field}) => (
                                    <Select onValueChange={field.onChange}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select department"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="hr">
                                                Human Resources
                                            </SelectItem>
                                            <SelectItem value="it">
                                                IT
                                            </SelectItem>
                                            <SelectItem value="finance">
                                                Finance
                                            </SelectItem>
                                            <SelectItem value="marketing">
                                                Marketing
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {form.formState.errors.departmentName && (
                                <p className="text-sm text-red-600">
                                    {
                                        form.formState.errors.departmentName
                                            .message
                                    }
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="remark">Remark</Label>
                            <Textarea
                                id="remark"
                                {...form.register("remark")}
                            />
                        </div>
                    </div>
                    <CardFooter className="mt-6 flex text-white   space-x-2 px-0">
                        <Button
                            className="bg-cyan-600"
                            onClick={handleBack}
                            type="button"
                        >
                            <ArrowBigLeftDash/>
                            Back
                        </Button>
                        {/*<Button variant="outline" className="bg-orange-400" type="button" onClick={() => form.reset()}*/}
                        {/*        disabled={isSubmitting}>*/}
                        <Button
                            variant="outline"
                            className="bg-orange-400"
                            type="reset"
                            disabled={isSubmitting}
                        >
                            <TimerReset/>
                            Reset
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-green-600"
                        >
                            <Plus/> {isSubmitting ? "Adding..." : "Add"}
                        </Button>
                    </CardFooter>
                </form>
            </CardContent>
        </Card>
    );
}
