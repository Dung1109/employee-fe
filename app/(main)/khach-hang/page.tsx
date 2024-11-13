"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import Link from "next/link";

interface Customer {
    id: string;
    maKhachHang: string;
    tenKhachHang: string;
    diaChi: string;
    nhomKhNcc: string;
    maSoThue: string;
    dienThoai: string;
    ngungTheoDoi: boolean;
}

interface CustomerResponse {
    customers: Customer[];
    currentPage: number;
    totalItems: number;
    totalPages: number;
}

const fetchCustomers = async ({
    pageParam = 1,
    filterBy = "",
    filterValue = "",
}): Promise<CustomerResponse> => {
    const cookie = document.cookie
        .split(";")
        .find((c) => c.trim().startsWith("jwt="));
    const token = cookie ? cookie.split("=")[1] : null;

    const { data } = await axios.get(
        "http://localhost:8080/api/v1/employee/khach-hang",
        {
            headers: { Authorization: token },
            params: {
                pageNo: pageParam - 1,
                pageSize: 10,
                filterBy: filterBy,
                filterValue: filterValue,
            },
        }
    );

    console.log("data", data);

    return data;
};

export default function CustomerListPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterBy, setFilterBy] = useState("");
    const [page, setPage] = useState(1);
    const [activeFilter, setActiveFilter] = useState({ by: "", value: "" });

    const { data, isLoading, isError } = useQuery({
        queryKey: ["customers", page, activeFilter.by, activeFilter.value],
        queryFn: () =>
            fetchCustomers({
                pageParam: page,
                filterBy: activeFilter.by,
                filterValue: activeFilter.value,
            }),
    });

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    const handleSearch = () => {
        setActiveFilter({ by: filterBy, value: searchTerm });
        setPage(1);
    };

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
                    <h2 className="text-3xl font-bold">Customer List</h2>
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
                                    <SelectItem value="tenKhachHang">
                                        Name
                                    </SelectItem>
                                    <SelectItem value="diaChi">
                                        Address
                                    </SelectItem>
                                    <SelectItem value="nhomKhNcc">
                                        Group
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
                            Error loading customers
                        </div>
                    ) : (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Customer Code</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Address</TableHead>
                                        <TableHead>Group</TableHead>
                                        <TableHead>Tax Code</TableHead>
                                        <TableHead>Phone</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {(data || []).map((customer) => (
                                        <TableRow key={customer.id}>
                                            <TableCell>
                                                {customer.maKhachHang}
                                            </TableCell>
                                            <TableCell>
                                                {customer.tenKhachHang}
                                            </TableCell>
                                            <TableCell>
                                                {customer.diaChi}
                                            </TableCell>
                                            <TableCell>
                                                {customer.nhomKhNcc}
                                            </TableCell>
                                            <TableCell>
                                                {customer.maSoThue}
                                            </TableCell>
                                            <TableCell>
                                                {customer.dienThoai}
                                            </TableCell>
                                            <TableCell>
                                                {customer.ngungTheoDoi
                                                    ? "Inactive"
                                                    : "Active"}
                                            </TableCell>
                                            <TableCell>
                                                <Button variant="link">
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    <Link
                                                        href={`/khach-hang/${customer.id}`}
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
