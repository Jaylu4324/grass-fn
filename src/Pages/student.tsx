import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"

import MainLayout from '../section/MainLayout'
type User = {
  id: number
  name: string
  email: string
  role: string
}

const users: User[] = [
  { id: 1, name: "Alice Johnson", email: "alice@example.com", role: "Admin" },
  { id: 2, name: "Bob Smith", email: "bob@example.com", role: "User" },
  { id: 3, name: "Charlie Brown", email: "charlie@example.com", role: "Editor" },
  { id: 3, name: "Charlie Brown", email: "charlie@example.com", role: "Editor" },
  { id: 3, name: "Charlie Brown", email: "charlie@example.com", role: "Editor" },

]

const Student = () => {
  return (
    <MainLayout>

    
    <div className="p-4 bg-white rounded-2xl shadow-md border border-gray-200  ">
      <h2 className="text-xl font-semibold mb-4 bg-amber-600 text-gray-700">Studant List</h2>
      <Table className="border-spacing-5" >
        <TableHeader>
          <TableRow className="bg-amber-900 border-spacing-5">
            <TableHead className="w-20 border-spacing-5">ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="border-spacing-5">
          {users.map((user: User) => (
            <TableRow key={user.id} className=" bg-amber-300 border-spacing-5 " >
              <TableCell className="font-medium py-5  border-spacing-5">{user.id}</TableCell>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
    </MainLayout>
  )
}

export default Student
