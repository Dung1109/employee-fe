import axios from "axios";

// Define the type for the employee data
type EmployeeData = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: Date;
  gender: number;
  email: string;
  address?: string;
  status: number;
  departmentName: string;
  remark?: string;
};

export async function fetchEmployee(id: string) {
  const cookie = document.cookie
    .split(";")
    .find((c) => c.trim().startsWith("jwt="));
  const token = cookie ? cookie.split("=")[1] : null;
  const res = await axios.get(`http://localhost:8080/api/v1/employee/${id}`, {
    headers: {
      Authorization: token,
    },
  });
  return res.data;
}

export async function updateEmployee(
  employeeData: EmployeeData,
): Promise<EmployeeData> {
  try {
    const cookie = document.cookie
      .split(";")
      .find((c) => c.trim().startsWith("jwt="));
    const token = cookie ? cookie.split("=")[1] : null;
    const response = await axios.put(
      `http://localhost:8080/api/v1/employee/${employeeData.id}`,
      employeeData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      },
    );

    if (response.status !== 200) {
      throw new Error("Failed to update employee");
    }

    return response.data;
  } catch (error) {
    console.error("Error updating employee:", error);
    throw error;
  }
}
