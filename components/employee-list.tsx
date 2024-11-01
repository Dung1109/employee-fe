"use client";

import { useState } from "react";
import {
    QueryClient,
    QueryClientProvider,
    useQuery,
    useMutation,
} from "@tanstack/react-query";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Eye, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface Employee {
    id: number;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    address: string;
    phone: string;
    departmentName: string;
}

interface EmployeeResponse {
    employees: Employee[];
    currentPage: number;
    totalItems: number;
    totalPages: number;
    currentSort: string;
}

const fetchEmployees = async ({
    pageParam = 1,
    filterBy = "id",
}): Promise<EmployeeResponse> => {
    const { data } = await axios.get("http://localhost:8080/api/v1/employee/", {
        params: { pageNo: pageParam - 1, pageSize: 10, sortBy: filterBy },
    });

    console.log(data);
    return data;
};

const logoutUser = async () => {
    await axios.post("https://api.example.com/logout");
};

function EmployeeListContent() {
    const [filteredEmployees, setFilteredEmployees] = useState<
        Employee[] | null
    >(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterBy, setFilterBy] = useState("id");
    const [page, setPage] = useState(1);
    const router = useRouter();

    const { data, isLoading, isError } = useQuery({
        queryKey: ["employees", page, filterBy],
        queryFn: () => fetchEmployees({ pageParam: page, filterBy }),
    });

    const logoutMutation = useMutation({
        mutationFn: logoutUser,
        onSuccess: () => {
            router.push("/login");
        },
    });

    const handleLogout = () => {
        logoutMutation.mutate();
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    const handleSearch = (): void => {
        if (!data?.employees) return;

        if (searchTerm === "") {
            setFilteredEmployees(null); // Reset to show all employees
            return;
        }

        const filtered = data.employees.filter(
            (employee) =>
                employee.firstName
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                employee.lastName
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                employee.departmentName
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())
        );

        setFilteredEmployees(filtered);
    };

    const handleClear = (): void => {
        setSearchTerm("");
        setFilteredEmployees(null);
    };

    return (
        <div className="flex h-screen bg-gray-100">
            <main className="flex-1 p-10">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold">Employee list</h2>
                    <div>
                        <span className="mr-2">Welcome kasjd</span>
                        <Button
                            variant="outline"
                            onClick={handleLogout}
                            disabled={logoutMutation.isPending}
                        >
                            {logoutMutation.isPending
                                ? "Logging out..."
                                : "Logout"}
                        </Button>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex justify-between mb-4">
                        <div className="flex items-center space-x-2">
                            <Input
                                type="text"
                                placeholder="User Search"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-64"
                            />
                            <Select
                                value={filterBy}
                                onValueChange={setFilterBy}
                            >
                                <SelectTrigger className="w-32">
                                    <SelectValue placeholder="Filter By" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="firstName">
                                        First Name
                                    </SelectItem>
                                    <SelectItem value="departmentName">
                                        Department
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={handleSearch}>Search</Button>
                            <Button variant="outline" onClick={handleClear}>
                                Clear
                            </Button>
                        </div>
                    </div>
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : isError ? (
                        <div className="text-center text-red-500">
                            Error loading employees
                        </div>
                    ) : (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Date of birth</TableHead>
                                        <TableHead>Address</TableHead>
                                        <TableHead>Phone number</TableHead>
                                        <TableHead>Department</TableHead>
                                        <TableHead>Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {(
                                        filteredEmployees ||
                                        data?.employees ||
                                        []
                                    ).map((employee) => (
                                        <TableRow key={employee.id}>
                                            <TableCell>{employee.id}</TableCell>
                                            <TableCell>
                                                {employee.firstName +
                                                    " " +
                                                    employee.lastName}
                                            </TableCell>
                                            <TableCell>
                                                {employee.dateOfBirth}
                                            </TableCell>
                                            <TableCell>
                                                {employee.address}
                                            </TableCell>
                                            <TableCell>
                                                {employee.phone}
                                            </TableCell>
                                            <TableCell>
                                                {employee.departmentName}
                                            </TableCell>
                                            <TableCell>
                                                <Button variant="link">
                                                    <Eye />
                                                    View
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <div className="flex justify-center mt-4 space-x-2">
                                <Button
                                    variant="outline"
                                    onClick={() => handlePageChange(page - 1)}
                                    disabled={page === 1}
                                >
                                    Previous
                                </Button>
                                {[...Array(data?.totalPages || 0)].map(
                                    (_, index) => (
                                        <Button
                                            key={index}
                                            variant={
                                                page === index + 1
                                                    ? "default"
                                                    : "outline"
                                            }
                                            onClick={() =>
                                                handlePageChange(index + 1)
                                            }
                                        >
                                            {index + 1}
                                        </Button>
                                    )
                                )}
                                <Button
                                    variant="outline"
                                    onClick={() => handlePageChange(page + 1)}
                                    disabled={page === data?.totalPages}
                                >
                                    Next
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}

// Create a new QueryClient instance
const queryClient = new QueryClient();

// Wrap the main component with QueryClientProvider
export function EmployeeListComponent() {
    return (
        <QueryClientProvider client={queryClient}>
            <EmployeeListContent />
        </QueryClientProvider>
    );
}
