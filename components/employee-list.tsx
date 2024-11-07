"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
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
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";

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
    filterBy: string;
    filterValue: string;
}

const fetchEmployees = async ({
    pageParam = 1,
    filterBy = "",
    filterValue = "",
}): Promise<EmployeeResponse> => {
    const cookie = document.cookie
        .split(";")
        .find((c) => c.trim().startsWith("jwt="));
    const token = cookie ? cookie.split("=")[1] : null;

    const { data } = await axios.get("http://localhost:8080/api/v1/employee/", {
        headers: { Authorization: token },
        params: {
            pageNo: pageParam - 1,
            pageSize: 10,
            filterBy: filterBy,
            filterValue: filterValue,
        },
    });

    return data;
};

const logoutUser = async () => {
    await axios.post("https://api.example.com/logout");
};

export default function EmployeeListContent() {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterBy, setFilterBy] = useState("");
    const [page, setPage] = useState(1);
    const [activeFilter, setActiveFilter] = useState({ by: "", value: "" });
    const router = useRouter();

    const { data, isLoading, isError } = useQuery({
        queryKey: ["employees", page, activeFilter.by, activeFilter.value],
        queryFn: () =>
            fetchEmployees({
                pageParam: page,
                filterBy: activeFilter.by,
                filterValue: activeFilter.value,
            }),
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

    const handleSearch = () => {
        setActiveFilter({ by: filterBy, value: searchTerm });
        setPage(1); // Reset to first page when searching
    };

    const { isAuthenticated } = useAuthStore();
    console.log("The isAuthenticated is ", isAuthenticated);

    const handleClear = () => {
        setSearchTerm("");
        setFilterBy("");
        setActiveFilter({ by: "", value: "" });
        setPage(1);
    };

    return (
        <div className="flex h-screen bg-gray-100">
            <main className="flex-1 p-10">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold">Employee list</h2>
                    <div>
                        <span className="mr-2">Welcome user</span>
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
                                placeholder="Search"
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
                                    <SelectItem value="fullName">
                                        Name
                                    </SelectItem>
                                    <SelectItem value="address">
                                        Address
                                    </SelectItem>
                                    <SelectItem value="department">
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
                                    {(data?.employees || []).map((employee) => (
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
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    <Link
                                                        href={`/employee/${employee.id}`}
                                                    >
                                                        View
                                                    </Link>
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
