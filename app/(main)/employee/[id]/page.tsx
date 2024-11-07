"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { fetchEmployee, updateEmployee } from "@/api/api";
import { format } from "date-fns";
import { ArrowBigLeftDash, Edit, Save } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

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
  email: z.string().email("Invalid email address"),
  address: z.string().optional(),
  active: z.boolean().optional(),
  departmentName: z.string({
    required_error: "Department is required",
  }),
  remark: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function EmployeeDetailPage() {
  const [isEditing, setIsEditing] = useState(false);
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id as string;

  const {
    data: employee,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["employee", id],
    queryFn: () => fetchEmployee(id),
  });

  const updateEmployeeMutation = useMutation({
    mutationFn: updateEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["employee", id],
      });
      queryClient.invalidateQueries({
        queryKey: ["employees"],
      });
      toast({
        title: "Employee Updated",
        description: "The employee has been successfully updated.",
      });
      setIsEditing(false);
    },
    onError: (error) => {
      console.error("Error updating employee:", error);
      toast({
        title: "Error",
        description: "Failed to update employee. Please try again.",
        variant: "destructive",
      });
    },
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      dateOfBirth: undefined,
      gender: "male",
      email: "",
      address: "",
      active: false,
      departmentName: "",
      remark: "",
    },
  });

  useEffect(() => {
    if (employee) {
      form.reset({
        firstName: employee.firstName,
        lastName: employee.lastName,
        phone: employee.phone,
        dateOfBirth: new Date(employee.dateOfBirth),
        gender: employee.gender === 0 ? "male" : "female",
        email: employee.email,
        address: employee.address,
        active: employee.status === 0,
        departmentName: employee.departmentName,
        remark: employee.remark,
      });
    }
  }, [employee, form]);

  function handleBack(): void {
    router.push("/employee");
  }

  function handleEdit(): void {
    setIsEditing(true);
  }

  function handleSubmit(data: FormValues): void {
    updateEmployeeMutation.mutate({
      id,
      ...data,
      gender: data.gender === "male" ? 0 : 1,
      status: data.active ? 0 : 1,
    });
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!employee) {
    return <div>Employee not found</div>;
  }

  return (
    <Card className="w-full p-4 md:p-6">
      <CardHeader>
        <CardTitle>Employee Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            if (isEditing) {
              form.handleSubmit(handleSubmit)(e);
            } else {
              e.preventDefault();
            }
          }}
        >
          <div className="grid gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                {isEditing ? (
                  <Input id="firstName" {...form.register("firstName")} />
                ) : (
                  <div>{employee.firstName}</div>
                )}
                {form.formState.errors.firstName && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.firstName.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                {isEditing ? (
                  <Input id="lastName" {...form.register("lastName")} />
                ) : (
                  <div>{employee.lastName}</div>
                )}
                {form.formState.errors.lastName && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.lastName.message}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone number</Label>
              {isEditing ? (
                <Input id="phone" {...form.register("phone")} />
              ) : (
                <div>{employee.phone}</div>
              )}
              {form.formState.errors.phone && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.phone.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Date of birth</Label>
              {isEditing ? (
                <Controller
                  name="dateOfBirth"
                  control={form.control}
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
              ) : (
                <div>{format(new Date(employee.dateOfBirth), "PPP")}</div>
              )}
              {form.formState.errors.dateOfBirth && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.dateOfBirth.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Gender</Label>
              {isEditing ? (
                <Controller
                  name="gender"
                  control={form.control}
                  render={({ field }) => (
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="male" id="male" />
                        <Label htmlFor="male">Male</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="female" id="female" />
                        <Label htmlFor="female">Female</Label>
                      </div>
                    </RadioGroup>
                  )}
                />
              ) : (
                <div>{employee.gender === 0 ? "Male" : "Female"}</div>
              )}
              {form.formState.errors.gender && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.gender.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="account">Account</Label>
              <div>{employee.account}</div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              {isEditing ? (
                <Input id="email" type="email" {...form.register("email")} />
              ) : (
                <div>{employee.email}</div>
              )}
              {form.formState.errors.email && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              {isEditing ? (
                <Textarea id="address" {...form.register("address")} />
              ) : (
                <div>{employee.address}</div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {isEditing ? (
                <Controller
                  name="active"
                  control={form.control}
                  render={({ field }) => (
                    <Checkbox
                      id="active"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              ) : (
                <Checkbox
                  id="active"
                  checked={employee.status === 0}
                  disabled
                />
              )}
              <Label htmlFor="active">Active</Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="departmentName">Department</Label>
              {isEditing ? (
                <Controller
                  name="departmentName"
                  control={form.control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hr">Human Resources</SelectItem>
                        <SelectItem value="it">IT</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              ) : (
                <div>{employee.departmentName}</div>
              )}
              {form.formState.errors.departmentName && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.departmentName.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="remark">Remark</Label>
              {isEditing ? (
                <Textarea id="remark" {...form.register("remark")} />
              ) : (
                <div>{employee.remark}</div>
              )}
            </div>
          </div>
          <CardFooter className="mt-6 flex text-white space-x-2 px-0">
            <Button className="bg-cyan-600" onClick={handleBack} type="button">
              <ArrowBigLeftDash />
              Back
            </Button>
            {isEditing ? (
              <Button type="submit" className="bg-green-600">
                <Save /> Save
              </Button>
            ) : (
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  handleEdit();
                }}
                className="bg-blue-600"
                type="button"
              >
                <Edit /> Edit
              </Button>
            )}
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
}
